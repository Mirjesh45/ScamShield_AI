"""
ScamShield AI - URL Analysis & Feature Extraction Engine
Performs multi-layered heuristic, entropy, and Random Forest ML inspection
of URLs, domain syntax, Punycode, redirect indicators, and threat intelligence.
"""
import os
import re
import math
import pickle
from urllib.parse import urlparse
from typing import Dict, Any, List, Optional
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "url_model.pkl")

SUSPICIOUS_TLDS = {
    ".xyz", ".top", ".club", ".icu", ".biz", ".online", ".site", ".ru",
    ".cc", ".work", ".info", ".buzz", ".fit", ".rest", ".link", ".click"
}

SUSPICIOUS_KEYWORDS = [
    "verify", "secure", "login", "signin", "account", "update", "bank", "free",
    "bonus", "claim", "reward", "wallet", "kyc", "upi", "card", "refund",
    "blocked", "alert", "password", "support", "gift", "prize", "winner",
    "billing", "re-authenticate", "auth", "validation"
]

def calculate_entropy(text: str) -> float:
    if not text:
        return 0.0
    prob = [float(text.count(c)) / len(text) for c in dict.fromkeys(list(text))]
    return -sum([p * math.log(p) / math.log(2.0) for p in prob])

class URLDetector:
    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                with open(MODEL_PATH, "rb") as f:
                    bundle = pickle.load(f)
                    if isinstance(bundle, dict) and "model" in bundle:
                        self.model = bundle["model"]
                    else:
                        self.model = bundle
            except Exception as e:
                print(f"[Warning] Failed to load URL model: {e}")
                self.model = None

    def extract_features(self, url_str: str) -> np.ndarray:
        try:
            parsed = urlparse(url_str if "://" in url_str else f"http://{url_str}")
            netloc = parsed.netloc.lower()
        except Exception:
            netloc = url_str.lower()

        url_len = len(url_str)
        domain_len = len(netloc)
        num_dots = url_str.count(".")
        num_hyphens = url_str.count("-")
        num_digits = sum(c.isdigit() for c in url_str)
        
        ip_pattern = r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]+)?$"
        has_ip = 1.0 if re.match(ip_pattern, netloc) else 0.0
        has_https = 1.0 if url_str.lower().startswith("https://") else 0.0
        
        clean_host = netloc.split(":")[0]
        domain_parts = clean_host.split(".")
        subdomains = max(0, len(domain_parts) - 2)
        kw_count = sum(1 for kw in SUSPICIOUS_KEYWORDS if kw in url_str.lower())
        has_sus_tld = 1.0 if any(clean_host.endswith(tld) for tld in SUSPICIOUS_TLDS) else 0.0
        entropy_val = calculate_entropy(url_str)

        return np.array([
            url_len, domain_len, num_dots, num_hyphens, num_digits,
            has_ip, has_https, subdomains, kw_count, has_sus_tld, entropy_val
        ], dtype=np.float32)

    def analyze(self, raw_url: str, db_connection=None) -> Dict[str, Any]:
        if not raw_url or not raw_url.strip():
            return {"error": "Empty URL provided"}

        url = raw_url.strip()
        if not (url.startswith("http://") or url.startswith("https://")):
            url_to_parse = f"http://{url}"
        else:
            url_to_parse = url

        try:
            parsed = urlparse(url_to_parse)
            hostname = parsed.hostname or parsed.netloc or ""
            port = parsed.port
            path = parsed.path
            query = parsed.query
        except Exception:
            return {"error": "Invalid URL format. Please verify the URL."}

        indicators: List[Dict[str, Any]] = []

        # 1. Threat Intelligence Lookup
        threat_match = None
        if db_connection:
            try:
                cursor = db_connection.cursor()
                cursor.execute("""
                SELECT value, risk_level, category, description 
                FROM threat_intel 
                WHERE (indicator_type IN ('url', 'domain') AND ? LIKE '%' || value || '%')
                """, (url,))
                row = cursor.fetchone()
                if row:
                    threat_match = {
                        "value": row["value"],
                        "risk_level": row["risk_level"],
                        "category": row["category"],
                        "description": row["description"]
                    }
                    indicators.append({
                        "name": "Threat Intelligence Match",
                        "evidence": f'Matches active threat: "{threat_match["value"]}"',
                        "severity": threat_match["risk_level"],
                        "explanation": threat_match["description"]
                    })
            except Exception as e:
                print(f"[Warning] Threat intel lookup error: {e}")

        # 2. IP Address as Hostname
        is_ip = bool(re.match(r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$", hostname))
        if is_ip:
            indicators.append({
                "name": "Direct IP Address Host",
                "evidence": hostname,
                "severity": "HIGH",
                "explanation": "Legitimate organizations generally use registered domain names. Raw IP addresses are frequently used in phishing campaigns to bypass domain reputation checks."
            })

        # 3. Punycode (IDN Homograph attack)
        is_punycode = hostname.startswith("xn--") or ".xn--" in hostname
        if is_punycode:
            indicators.append({
                "name": "Punycode (Homograph Attack)",
                "evidence": hostname,
                "severity": "CRITICAL",
                "explanation": "Punycode allows attackers to spoof famous domain names using visually identical foreign characters (e.g., Cyrillic 'а' replacing Latin 'a')."
            })

        # 4. HTTPS Usage (Note: do NOT flag solely as malicious just for HTTP)
        uses_https = url.lower().startswith("https://")
        if not uses_https:
            indicators.append({
                "name": "Insecure HTTP Protocol",
                "evidence": "http:// (unencrypted)",
                "severity": "LOW",
                "explanation": "Traffic is unencrypted. Note that HTTP alone does not prove malice, but modern banking and auth portals universally mandate HTTPS."
            })

        # 5. Excessive Subdomain Depth
        subdomain_tokens = hostname.split(".")
        if len(subdomain_tokens) > 3 and not is_ip:
            indicators.append({
                "name": "Excessive Subdomain Nesting",
                "evidence": f"{len(subdomain_tokens)} domain segments",
                "severity": "MEDIUM",
                "explanation": "Attackers frequently create misleading subdomains (e.g., paypal.com.user-verify.link) to trick mobile users where only part of the URL is visible."
            })

        # 6. Suspicious TLD (Do NOT claim malicious solely due to TLD, treat as advisory)
        matched_tld = next((tld for tld in SUSPICIOUS_TLDS if hostname.endswith(tld)), None)
        if matched_tld:
            indicators.append({
                "name": "High-Risk Top-Level Domain (TLD)",
                "evidence": matched_tld,
                "severity": "MEDIUM",
                "explanation": f"TLDs such as {matched_tld} offer inexpensive or anonymous registration and have higher statistical correlation with disposable phishing kits."
            })

        # 7. Suspicious Keywords in URL
        found_kw = [kw for kw in SUSPICIOUS_KEYWORDS if kw in url.lower()]
        if len(found_kw) >= 2:
            indicators.append({
                "name": "Targeted Phishing Keywords",
                "evidence": ", ".join(found_kw[:4]),
                "severity": "HIGH",
                "explanation": "URL path contains keywords commonly used to trick users into believing they are accessing a secure account management portal."
            })
        elif len(found_kw) == 1:
            indicators.append({
                "name": "Sensitive Operation Keyword",
                "evidence": found_kw[0],
                "severity": "LOW",
                "explanation": f"URL mentions '{found_kw[0]}', commonly scrutinized in credential verification contexts."
            })

        # 8. High URL Entropy (DGA or obfuscation)
        entropy = calculate_entropy(url)
        if entropy > 4.5:
            indicators.append({
                "name": "High Information Entropy",
                "evidence": f"Entropy: {round(entropy, 2)}",
                "severity": "MEDIUM",
                "explanation": "High randomness in the URL string often indicates randomized token obfuscation or domain generation algorithms (DGAs)."
            })

        # 9. Open Redirect Pattern
        if any(token in query.lower() for token in ["redirect=", "url=", "next=", "dest=", "return="]):
            indicators.append({
                "name": "Open Redirect Indicator",
                "evidence": query[:40],
                "severity": "MEDIUM",
                "explanation": "URL parameters contain redirection instructions that could bounce unsuspecting visitors to external malicious destinations."
            })

        # ML Model Inference
        features = self.extract_features(url)
        ml_prob = 0.5
        if self.model is not None:
            try:
                ml_prob = float(self.model.predict_proba([features])[0][1])
            except Exception:
                ml_prob = 0.5
        else:
            # Fallback heuristic calculation
            ml_prob = min(0.95, (0.4 if is_ip else 0) + (0.3 if is_punycode else 0) + (0.2 if matched_tld else 0))

        if threat_match:
            ml_prob = max(ml_prob, 0.95)

        # Determine category
        cat = "Phishing"
        if any(k in url.lower() for k in ["bank", "sbi", "hdfc", "icici", "chase", "card", "debit"]):
            cat = "Banking Scam"
        elif any(k in url.lower() for k in ["upi", "gpay", "phonepe", "paytm"]):
            cat = "UPI Scam"
        elif any(k in url.lower() for k in ["binance", "metamask", "crypto", "btc", "wallet"]):
            cat = "Crypto Scam"
        elif any(k in url.lower() for k in ["fedex", "dhl", "ups", "tracking", "parcel"]):
            cat = "Delivery Scam"
        elif any(k in url.lower() for k in ["tax", "challan", "police", "parivahan"]):
            cat = "Government Impersonation"
        elif any(k in url.lower() for k in ["prize", "gift", "reward", "spin", "voucher"]):
            cat = "Prize Scam"

        return {
            "url": url,
            "hostname": hostname,
            "has_https": uses_https,
            "entropy": round(entropy, 2),
            "ml_probability": round(ml_prob, 4),
            "indicators": indicators,
            "threat_match": threat_match,
            "suggested_category": cat
        }

url_detector = URLDetector()
