"""
ScamShield AI - Explainable AI & Advisory Recommendation Engine
Generates human-understandable forensic explanations, contextual safety actions,
and transparent advisory disclosures.
"""
from typing import Dict, Any, List

RECOMMENDATION_CATALOG = {
    "Banking Scam": [
        "Do not click the provided link or enter any NetBanking credentials.",
        "Never share OTPs, card numbers, expiry dates, or CVVs with anyone.",
        "Verify your account status by visiting your bank's official website or calling the toll-free number on the back of your card.",
        "Report the phishing attempt to your bank's designated cyber fraud desk."
    ],
    "UPI Scam": [
        "Remember: You NEVER need to enter your UPI PIN to receive money.",
        "Decline any incoming collect requests or suspicious QR code scanning prompts.",
        "Check your banking app directly to verify if funds actually arrived.",
        "Report the suspicious UPI ID or phone number on the National Cyber Crime Reporting Portal."
    ],
    "OTP Scam": [
        "Never disclose one-time passwords (OTP) to anyone claiming to be from customer support or security.",
        "Legitimate bank or tech support staff will NEVER ask for your OTP over phone, SMS, or WhatsApp.",
        "If you already shared an OTP, immediately contact your bank to freeze your accounts and reset passwords."
    ],
    "KYC Scam": [
        "Telecom operators (Airtel, Jio, Vi, BSNL) do not suspend SIM cards via informal SMS warnings.",
        "Never download remote screen-sharing tools (AnyDesk, TeamViewer, RustDesk) requested by callers.",
        "Complete official KYC only in person at an authorized retail center or via verified provider apps."
    ],
    "Job Scam": [
        "Legitimate corporate employers will never charge registration or 'refundable security' fees.",
        "Avoid high-paying task schemes (rating hotels, subscribing to channels) organized via Telegram.",
        "Do not provide identity documents (PAN, Aadhaar, Passport) to unverified recruiters."
    ],
    "Investment Scam": [
        "Be extremely skeptical of guaranteed high returns, zero-risk trading bots, or doubling schemes.",
        "Verify whether the investment entity is registered with financial regulators (SEBI, SEC, FCA).",
        "Never transfer investment capital to personal UPI addresses or unregulated cryptocurrency wallets."
    ],
    "Loan Scam": [
        "Do not pay advance processing fees or stamp duties to release an unsecured loan.",
        "Do not install unverified loan APK applications from web links, as they may steal contacts and photos.",
        "Apply for loans solely through licensed banks or registered Non-Banking Financial Companies (NBFCs)."
    ],
    "Lottery Scam": [
        "You cannot win a lottery or prize contest that you never purchased a ticket or entered.",
        "Refuse demands for advance taxes, customs duties, or transfer clearance fees.",
        "Block the sender and delete the message immediately."
    ],
    "Prize Scam": [
        "Unsolicited claims that you won expensive smartphones, gift cards, or cash rewards are almost always fraudulent.",
        "Do not pay shipping or verification surcharges to claim prizes.",
        "Do not fill in personal details or survey forms on unfamiliar domains."
    ],
    "Delivery Scam": [
        "Do not click delivery rescheduling links received via unsolicited text messages.",
        "Track your package exclusively using the official courier application or official website.",
        "Do not pay unexpected small customs or redelivery fees without verifying with the merchant."
    ],
    "Government Impersonation": [
        "Government departments (Income Tax, Police, Parivahan) communicate notices through formal postal mail or authenticated government portals (.gov.in / .gov).",
        "Never pay traffic challans or tax dues on non-government third-party websites.",
        "Cross-check your vehicle or PAN details directly on official government websites."
    ],
    "Tech Support Scam": [
        "Major operating systems (Microsoft Windows, Apple macOS) do not display browser pop-ups prompting you to call a toll-free number.",
        "Never grant remote desktop control to someone who unsolicitedly alerted you of computer infections.",
        "Close the browser tab immediately and run a scan with trusted anti-malware software."
    ],
    "Social Media Scam": [
        "Social media platforms never threaten account deletion via direct messages or third-party links.",
        "Check account security status solely within the official app settings menu.",
        "Enable two-factor authentication (2FA) using an authenticator app, not SMS."
    ],
    "Crypto Scam": [
        "Never enter your 12-word or 24-word secret recovery seed phrase into any website or form.",
        "No celebrity or crypto exchange conducts 'send 1 BTC, get 2 BTC back' giveaways.",
        "Disconnect your wallet immediately from any unfamiliar Web3 decentralized application."
    ],
    "Legitimate": [
        "The analyzed content exhibits patterns consistent with authentic communication.",
        "Continue practicing standard digital security hygiene.",
        "Never share sensitive credentials (passwords, PINs, OTPs) even when an alert appears genuine."
    ]
}

DEFAULT_RECOMMENDATIONS = [
    "Do not click unverified links or download attachments.",
    "Do not provide sensitive financial credentials, OTPs, or identity numbers.",
    "Verify the sender independently through official published contact channels.",
    "Report suspicious messages to relevant cybersecurity platforms."
]

class ExplanationEngine:
    @staticmethod
    def generate_explanation(
        classification: str,
        category: str,
        indicators: List[Dict[str, Any]],
        input_type: str
    ) -> str:
        if classification == "Likely Safe":
            return (
                f"The analyzed {input_type} did not trigger known threat signatures, "
                f"suspicious urgency flags, or credential harvesting patterns. "
                f"It appears consistent with benign communication. However, always exercise cautious digital hygiene."
            )

        indicator_names = [ind["name"] for ind in indicators]
        indicator_summary = ", ".join(indicator_names[:3]) if indicator_names else "unusual heuristics"

        if classification == "Likely Scam":
            return (
                f"This {input_type} exhibits strong indicators of a {category}. "
                f"Our multi-vector analysis detected: {indicator_summary}. "
                f"Scammers routinely employ these coercive tactics to manipulate recipients into making hasty decisions "
                f"or surrendering critical financial credentials."
            )
        else: # Suspicious
            return (
                f"This {input_type} displays suspicious characteristics commonly seen in exploratory phishing or unsolicited campaigns, "
                f"specifically: {indicator_summary}. "
                f"While not conclusively malicious, we advise heightened caution before engaging."
            )

    @staticmethod
    def get_recommendations(category: str, classification: str) -> List[str]:
        if classification == "Likely Safe":
            return RECOMMENDATION_CATALOG.get("Legitimate", DEFAULT_RECOMMENDATIONS)
        return RECOMMENDATION_CATALOG.get(category, DEFAULT_RECOMMENDATIONS)

explanation_engine = ExplanationEngine()
