"""
ScamShield AI - NLP Text Analysis Engine
Loads trained TF-IDF + Logistic Regression text classification pipeline,
extracts domain-specific scam indicators, categorizes into 15+ threat vectors,
and provides grounded evidence.
"""
import os
import re
import pickle
from typing import Dict, Any, List, Tuple

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "text_model.pkl")

# Indicator Patterns & Explanations
INDICATOR_RULES = [
    {
        "name": "Artificial Urgency & Time Pressure",
        "pattern": r"(?i)\b(immediately|urgent|within\s*\d+\s*(?:hours|hrs|mins|minutes)|expires?\s*(?:today|soon|in\s*\d+)|act\s*now|last\s*chance|final\s*notice|right\s*now)\b",
        "severity": "HIGH",
        "explanation": "Scammers manufacture artificial urgency to induce panic and force victims to act before verifying the legitimacy of the request."
    },
    {
        "name": "Financial Reward / Unsolicited Gain",
        "pattern": r"(?i)\b(congratulations|won\s*(?:rs|inr|\$|£|€)?\s*[\d,]+|cashback|lottery|lucky\s*draw|jackpot|guaranteed\s*returns?|double\s*your\s*money|100%\s*profit|free\s*gift|voucher|reward)\b",
        "severity": "HIGH",
        "explanation": "Promises of unearned financial windfalls or exorbitant rewards are primary bait mechanisms in advance-fee and prize scams."
    },
    {
        "name": "Credential & Sensitive Data Harvesting",
        "pattern": r"(?i)\b(otp|one\s*time\s*password|upi\s*pin|cvv|atm\s*pin|password|seed\s*phrase|netbanking\s*password|pan\s*card|aadhaar|ssn)\b",
        "severity": "CRITICAL",
        "explanation": "Requests for authentication secrets (OTP, PIN, passwords, seed phrases) are the hallmark of financial account takeover attempts."
    },
    {
        "name": "Fear, Intimidation & Service Suspension",
        "pattern": r"(?i)\b(suspended|blocked|deactivated|terminated|legal\s*action|police|court\s*summons|arrest\s*warrant|fine\s*pending|e-challan|penalty)\b",
        "severity": "HIGH",
        "explanation": "Threatening service disconnection or legal consequences exploits psychological fear to compel immediate compliance."
    },
    {
        "name": "Brand / Institution Impersonation",
        "pattern": r"(?i)\b(sbi|hdfc|icici|paytm|phonepe|googlepay|gpay|amazon|fedex|dhl|india\s*post|income\s*tax|microsoft|apple|binance|metamask|netflix)\b",
        "severity": "MEDIUM",
        "explanation": "High-trust brands are impersonated to lend false authenticity to fraudulent communications."
    },
    {
        "name": "UPI & Payment Redirection Trickery",
        "pattern": r"(?i)\b(enter\s*(?:your)?\s*upi\s*pin\s*to\s*receive|scan\s*(?:the)?\s*qr\s*code\s*to\s*receive|collect\s*request|approve\s*refund)\b",
        "severity": "CRITICAL",
        "explanation": "Scammers falsely claim you need to enter your UPI PIN or scan a QR code to receive money. UPI PIN is only required to SEND money."
    },
    {
        "name": "Unrealistic Employment Bait",
        "pattern": r"(?i)\b(earn\s*(?:rs|\$|inr)?\s*[\d,]+(?:\s*(?:daily|per\s*day|hourly))|part-?time\s*job|work\s*from\s*home|like\s*youtube\s*videos|rate\s*hotels|telegram\s*tasks?)\b",
        "severity": "HIGH",
        "explanation": "Task-based part-time job schemes promise easy daily income to lure victims into high-yield prepayments or crypto deposits."
    },
    {
        "name": "Suspicious External Contact Channel",
        "pattern": r"(?i)(t\.me\/[a-zA-Z0-9_]+|telegram|whatsapp\s*(?:call|\+?[\d\s-]+)|@hr_[a-zA-Z0-9_]+)",
        "severity": "MEDIUM",
        "explanation": "Directing victims to encrypted messaging apps like Telegram or personal WhatsApp avoids corporate email monitoring and traceability."
    }
]

# Category Classification Rules
CATEGORY_KEYWORDS = {
    "Banking Scam": ["bank", "sbi", "hdfc", "icici", "netbanking", "debit card", "credit card", "account suspended", "cvv"],
    "UPI Scam": ["upi", "googlepay", "gpay", "phonepe", "paytm", "upi pin", "qr code", "cashback", "collect request"],
    "OTP Scam": ["otp", "one time password", "verification code", "share this otp", "recovery code"],
    "KYC Scam": ["kyc", "e-kyc", "sim kyc", "aadhaar", "pan card", "re-verification", "airtel kyc", "jio kyc"],
    "Job Scam": ["part-time job", "work from home", "daily payout", "like youtube", "rate hotels", "telegram task", "resume shortlisted"],
    "Investment Scam": ["guaranteed return", "forex", "trading signals", "double your money", "crypto wealth", "penny stock"],
    "Loan Scam": ["pre-approved loan", "instant loan", "0% interest", "no cibil", "disburse", "processing fee loan", "dhani"],
    "Lottery Scam": ["kbc", "lucky draw", "lottery", "national lottery", "uk lottery", "won 25,00,000", "crorepati"],
    "Prize Scam": ["won rs", "won $", "claim your prize", "spin to win", "iphone 15 pro", "shopping voucher", "anniversary gift"],
    "Delivery Scam": ["fedex", "dhl", "india post", "ups", "parcel", "package", "reschedule delivery", "customs fee", "address incomplete"],
    "Government Impersonation": ["income tax", "tax refund", "pm kisan", "parivahan", "traffic police", "e-challan", "court summons"],
    "Tech Support Scam": ["microsoft support", "windows detected", "trojan", "apple support", "icloud breached", "mcafee expired"],
    "Social Media Scam": ["instagram copyright", "facebook security", "twitter badge", "account deleted in 24 hours", "blue checkmark"],
    "Crypto Scam": ["btc giveaway", "seed phrase", "metamask", "binance", "ethereum", "web3 wallet sync", "crypto withdrawal"]
}

class TextDetector:
    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                with open(MODEL_PATH, "rb") as f:
                    self.model = pickle.load(f)
            except Exception as e:
                print(f"[Warning] Failed to load text model: {e}")
                self.model = None

    def extract_urls(self, text: str) -> List[str]:
        url_regex = r'(https?://[^\s<>"]+|www\.[^\s<>"]+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:/[^\s<>"]*)?)'
        matches = re.findall(url_regex, text)
        clean_urls = []
        for m in matches:
            if not m.startswith("http://") and not m.startswith("https://"):
                m = "https://" + m
            clean_urls.append(m.rstrip(".,;!?'\""))
        return list(dict.fromkeys(clean_urls))

    def detect_indicators(self, text: str) -> List[Dict[str, Any]]:
        indicators = []
        for rule in INDICATOR_RULES:
            match = re.search(rule["pattern"], text)
            if match:
                evidence_text = match.group(0)
                indicators.append({
                    "name": rule["name"],
                    "evidence": f'"{evidence_text}"',
                    "severity": rule["severity"],
                    "explanation": rule["explanation"]
                })
        return indicators

    def classify_category(self, text: str, is_scam: bool) -> str:
        if not is_scam:
            return "Legitimate"

        text_lower = text.lower()
        matched_scores = {}
        for cat, kw_list in CATEGORY_KEYWORDS.items():
            score = sum(1 for kw in kw_list if kw in text_lower)
            if score > 0:
                matched_scores[cat] = score

        if matched_scores:
            best_cat = max(matched_scores.items(), key=lambda x: x[1])[0]
            return best_cat

        return "Category uncertain"

    def analyze(self, text: str) -> Dict[str, Any]:
        if not text or not text.strip():
            return {
                "error": "Empty text provided"
            }

        text = text.strip()
        indicators = self.detect_indicators(text)
        urls = self.extract_urls(text)

        # ML Prediction
        ml_scam_prob = 0.5
        if self.model is not None:
            try:
                probs = self.model.predict_proba([text])[0]
                ml_scam_prob = float(probs[1])
            except Exception:
                ml_scam_prob = 0.5
        else:
            # Fallback heuristic
            ml_scam_prob = min(0.95, len(indicators) * 0.25)

        # Adjust score with indicators count and severity
        severity_weights = {"CRITICAL": 0.25, "HIGH": 0.15, "MEDIUM": 0.08, "LOW": 0.03}
        indicator_boost = sum(severity_weights.get(ind["severity"], 0.05) for ind in indicators)
        
        # Combined probability
        combined_prob = max(0.01, min(0.98, (ml_scam_prob * 0.65) + (indicator_boost * 0.35)))

        is_scam = combined_prob >= 0.50
        category = self.classify_category(text, is_scam)

        return {
            "ml_probability": round(combined_prob, 4),
            "indicators": indicators,
            "extracted_urls": urls,
            "category": category,
            "char_count": len(text),
            "word_count": len(text.split())
        }

text_detector = TextDetector()
