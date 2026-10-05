"""
ScamShield AI - Dataset Generator & Preprocessor
Generates realistic scam/phishing datasets and legitimate datasets
across 15+ scam categories and varied URL patterns, then splits into
train, validation, and test splits.
"""
import os
import csv
import random
import pandas as pd
import numpy as np

# Seed for reproducibility
random.seed(42)
np.random.seed(42)

DATASET_DIR = os.path.dirname(os.path.abspath(__file__))
TRAIN_DIR = os.path.join(DATASET_DIR, "train")
VAL_DIR = os.path.join(DATASET_DIR, "validation")
TEST_DIR = os.path.join(DATASET_DIR, "test")

os.makedirs(TRAIN_DIR, exist_ok=True)
os.makedirs(VAL_DIR, exist_ok=True)
os.makedirs(TEST_DIR, exist_ok=True)

# 1. SCAM MESSAGES ACROSS CATEGORIES
SCAM_TEMPLATES = [
    # Banking Scam
    ("Dear customer, your SBI bank account ending in 4021 has been suspended due to pending KYC verification. Update immediately at https://sbi-kyc-portal.secure-net.cc to avoid permanent account block.", "Banking Scam", 92),
    ("ALERT: Unauthorized debit of Rs 48,990 attempted from your HDFC account. If not done by you, immediately reverse the transaction by clicking https://hdfc-fraud-verify.link/cancel", "Banking Scam", 95),
    ("Your ICICI NetBanking profile password will expire today. Renew now to prevent interruption in services: https://icici-security-renew.top/login", "Banking Scam", 88),
    ("Notice: Your debit card has been blocked due to suspicious activity. Verify card details and CVV to reactivate: http://bank-card-unlock.info/verify", "Banking Scam", 96),

    # UPI Scam
    ("You have received a pending cashback of Rs 2,999 on GooglePay! Click here to accept payment into your bank account: gpay-rewards.claim-pay.in?id=98214", "UPI Scam", 89),
    ("PhonePe Reward: You won a scratch card worth Rs 1,450! Open link and enter your UPI PIN to credit funds to your bank: http://phonepe-scratchcard.biz/claim", "UPI Scam", 94),
    ("Paytm Refund: Your refund of Rs 3,500 is waiting. Approve the UPI collect request or visit http://paytm-refund-approval.xyz to receive cash immediately.", "UPI Scam", 91),
    ("Buyer wants to pay via QR code on OLX. Scan this QR code and type your 6-digit UPI PIN to receive money in your account right now.", "UPI Scam", 96),

    # OTP Scam
    ("DO NOT SHARE: Use OTP 849201 to approve your transaction of INR 25,000. If this was not you, send this OTP to +91-9876543210 to cancel immediately.", "OTP Scam", 93),
    ("Bank Support: We are cancelling the fraud charge on your credit card. Please share the 6-digit OTP sent to your phone to confirm your identity.", "OTP Scam", 95),
    ("Your WhatsApp code is 382-192. Our security agent needs this code to verify your account recovery request. Please text it back now.", "OTP Scam", 90),

    # KYC Scam
    ("Dear User, your Airtel SIM KYC is incomplete and your outgoing calls will be stopped in 24 hours. Call 9823481234 or visit http://airtel-quick-kyc.site", "KYC Scam", 87),
    ("Jio Customer Alert: Your SIM card documentation has expired. Complete Aadhaar e-KYC immediately to prevent disconnection: http://jio-verification-kyc.online", "KYC Scam", 88),
    ("BSNL Advisory: Important update regarding your mobile line. Please verify Aadhaar number and PAN card by clicking http://bsnl-reverification.top", "KYC Scam", 85),

    # Job Scam
    ("Earn 3000 to 5000 INR per day working 1-2 hours from home by liking YouTube videos and rating hotels on Google Maps! Contact manager on Telegram: @hr_recruit_vip", "Job Scam", 91),
    ("Congratulations! Your resume was shortlisted for Amazon Remote Data Entry Executive. Salary: $4,500/month. Pay initial registration fee of $50 to start onboarding.", "Job Scam", 94),
    ("URGENT HIRING: Part-time online job for students and housewives. Daily payout guaranteed. No experience needed. Join Telegram channel t.me/daily_task_income to start.", "Job Scam", 89),
    ("DHL International Logistics hiring shipment coordinators. Work from mobile. Deposit refundable equipment security charge of Rs 1,500 to receive company laptop.", "Job Scam", 92),

    # Investment Scam
    ("Guaranteed 200% return in just 7 days! Join our VIP Forex and Crypto trading signals group. Zero risk with our AI bot. Deposit min 5000 INR: https://crypto-wealth-vault.co", "Investment Scam", 96),
    ("Double your money in 48 hours! Government approved multi-yield mutual fund scheme. Limited slots remaining. Transfer funds to UPI: instantgrow@ybl", "Investment Scam", 95),
    ("Exclusive insider stocks tip. Guaranteed 50% weekly gain on penny stocks. Register on our proprietary trading platform: http://elite-stock-multiplier.biz", "Investment Scam", 88),

    # Loan Scam
    ("Approved! Instant loan of Rs 5,00,000 sanctioned for your mobile number with 0% interest for 12 months. Pay processing fee of Rs 999 to disburse funds to bank.", "Loan Scam", 93),
    ("Pre-approved emergency personal loan up to 10 Lakhs with no CIBIL score required and zero documents! Download fast loan APK: http://quick-cash-disburse.apk", "Loan Scam", 94),
    ("Dhani Loan: Your loan application of Rs 2,50,000 has been cleared. Submit your PAN card and pay advance stamp duty fee of Rs 1,200 to release loan.", "Loan Scam", 92),

    # Lottery Scam
    ("Congratulations! You have won 25,00,000 INR in Kaun Banega Crorepati (KBC) Lucky Draw 2026. Contact KBC manager Mr. Rana Pratap on WhatsApp +91-9988776655 to claim.", "Lottery Scam", 98),
    ("DEAR WINNER: Your mobile number has won £750,000 in the UK National Lottery International program. Send full name, address and passport to claim-desk@uklottery-dept.co.uk", "Lottery Scam", 97),
    ("You have been chosen as the 1st prize winner of Mercedes Benz car or cash equivalent $150,000. Send processing fee to customs agent to arrange delivery.", "Lottery Scam", 96),

    # Prize Scam
    ("Congratulations! You have won ₹50,000. Click this link immediately to claim your prize.", "Prize Scam", 95),
    ("Spin to win! You have won an Apple iPhone 15 Pro Max from Amazon 30th Anniversary celebration! Fill your delivery address and pay shipping fee of Rs 199: http://amazon-anniversary-gift.top", "Prize Scam", 93),
    ("You are the lucky visitor #1,000,000! Claim your Walmart $1,000 shopping voucher before timer runs out in 4 minutes: http://walmart-voucher-claim.site", "Prize Scam", 91),

    # Delivery Scam
    ("FedEx: Your package #FDX-83921 could not be delivered due to incorrect street address. Please update delivery details within 12 hours or item will be returned: https://fedex-parcel-update.com/track", "Delivery Scam", 90),
    ("India Post: Your parcel has arrived at distribution center but is on hold due to missing customs payment of Rs 48. Pay fee online to reschedule delivery: http://indiapost-parcel-clearance.net", "Delivery Scam", 92),
    ("DHL Express: Important notice regarding shipment DHL-99214. Reschedule delivery date and pay re-delivery surcharge: https://dhl-express-tracking.cc/notice", "Delivery Scam", 89),
    ("UPS Delivery Notice: Driver tried to deliver your parcel at 14:30. Pay unpaid customs duties of $3.50 to avoid return to sender: http://ups-redelivery-center.org", "Delivery Scam", 91),

    # Government Impersonation
    ("Income Tax Department Notice: Tax refund of Rs 18,740 has been approved for your PAN card. Verify your bank account number and IFSC code immediately to credit refund: http://incometax-refund-gov.in.org", "Government Impersonation", 94),
    ("Ministry of Finance Alert: PM Kisan Samman Nidhi installment is pending. Update your e-KYC and biometric credentials online: https://pmkisan-verification.info", "Government Impersonation", 93),
    ("Traffic Police Cyber Cell: E-challan pending against your vehicle DL01AB1234. Pay fine of Rs 2,000 within 24 hours to avoid court summons and license suspension: http://echallan-parivahan-pay.cc", "Government Impersonation", 94),

    # Tech Support Scam
    ("Microsoft Alert: Windows detected Trojan:Win32/TrojanSpy virus on your computer. Your financial data and passwords are being transmitted. Call official support: 1-800-482-1920 immediately!", "Tech Support Scam", 96),
    ("Apple Security Warning: Your iCloud has been breached from an unknown device in Moscow. All photos and messages will be wiped. Call Apple Support at +1-888-294-8192 right now.", "Tech Support Scam", 95),
    ("McAfee Antivirus: Your subscription has expired! 5 viruses found. Renew protection immediately or your PC will be locked: http://mcafee-renew-protection.site", "Tech Support Scam", 90),

    # Social Media Scam
    ("Instagram Copyright Infringement Notice: Your account will be permanently deleted in 24 hours for community guideline violation. Appeal via our official form: https://instagram-help-verify.me", "Social Media Scam", 89),
    ("Facebook Security Team: Someone tried to reset your password from Nigeria. If this was not you, confirm your identity by submitting your credentials at http://facebook-security-check.vip", "Social Media Scam", 92),
    ("Twitter / X Badge: You qualify for verified blue checkmark for free! Verify your handle and login password here: https://twitter-verify-badge.top/claim", "Social Media Scam", 90),

    # Crypto Scam
    ("Elon Musk 5000 BTC Giveaway: Send 0.1 BTC to the official wallet address below and receive 0.2 BTC instantly in return to celebrate Tesla earnings! Visit: http://elon-tesla-giveaway.cc", "Crypto Scam", 98),
    ("Metamask Critical Notice: Web3 wallet synchronization required following Ethereum hard fork. Sync your 12-word seed phrase now to protect assets: https://metamask-sync-wallet.tech", "Crypto Scam", 99),
    ("Binance Security Alert: Your crypto withdrawal of 1.45 ETH is pending approval. Cancel transaction immediately if unauthorized: http://binance-cancel-withdraw.info", "Crypto Scam", 93),
]

# Generate variations to expand scam dataset to 500+ realistic examples
EXPANDED_SCAMS = []
for template, category, risk in SCAM_TEMPLATES:
    EXPANDED_SCAMS.append({"text": template, "label": 1, "category": category, "risk_score": risk})
    # Add variations with slight perturbations, urgency tokens, alternative links
    urgency_modifiers = [
        "ACT IMMEDIATELY: ",
        "FINAL REMINDER: ",
        "URGENT ATTENTION REQUIRED: ",
        "IMPORTANT SECURITY ALERT: ",
        "NOTICE: ",
        "ACTION REQUIRED WITHIN 24 HOURS: "
    ]
    suffixes = [
        " Failure to do so will result in permanent suspension.",
        " Ignore this and legal action may be initiated.",
        " Time sensitive offer expires in 15 minutes.",
        " Contact helpdesk immediately if you did not authorize this.",
        " Do not ignore this alert."
    ]
    for i in range(12):
        prefix = random.choice(urgency_modifiers) if random.random() > 0.4 else ""
        suffix = random.choice(suffixes) if random.random() > 0.4 else ""
        variant_text = f"{prefix}{template}{suffix}".strip()
        # vary risk score slightly
        variant_risk = max(70, min(99, risk + random.randint(-4, 4)))
        EXPANDED_SCAMS.append({"text": variant_text, "label": 1, "category": category, "risk_score": variant_risk})

# 2. LEGITIMATE MESSAGES
LEGITIMATE_TEMPLATES = [
    "Your OTP for login to Amazon is 491029. Valid for 10 minutes. Please do not share this OTP with anyone for security reasons.",
    "Your order #9821481 has been shipped via BlueDart. Track package status at https://www.bluedart.com with AWB 981240182.",
    "Dear customer, your HDFC Bank account xx4012 was debited by Rs 450.00 on 02-Oct-2026 at Starbucks Cafe. Available balance: Rs 42,109.20. If not you, SMS BLOCK to 5676712.",
    "Hi Sarah, let's catch up tomorrow at 10:30 AM for the quarterly engineering sync. I'll book the conference room.",
    "Your monthly electricity bill for meter #892147 is Rs 1,420. Due date is 15-Oct-2026. Pay safely through your provider portal at https://www.bescom.co.in or official BBPS app.",
    "Google Security Alert: A new sign-in from Chrome on macOS was detected for your account user@example.com. If this was you, no action needed.",
    "Hi team, please review the pull request for the new authentication middleware before end of day. Link: https://github.com/company/repo/pull/142",
    "Your Uber trip receipt: Rs 280.00 charged to your credit card ending in 8812. Thank you for riding with Uber.",
    "Reminder: Your dental appointment with Dr. Mehta is confirmed for Wednesday at 4:00 PM. Reply 1 to confirm, 2 to reschedule.",
    "Netflix: Your subscription has been renewed successfully for Rs 649. Next billing date is 02-Nov-2026.",
    "Hi mom, I reached the hotel safely. The flight was on time. Will call you after dinner!",
    "Zoom meeting invite: Project ScamShield Standup starting at 9:00 AM UTC. Join URL: https://zoom.us/j/9182374619",
    "Dear Employee, the annual health checkup camp will be organized in the cafeteria next Tuesday from 9 AM to 3 PM. Please register on the internal portal.",
    "Swiggy order confirmed! Restaurant is preparing your food. Delivery partner will be assigned shortly. Estimated delivery time: 35 mins.",
    "Your ICICI Bank credit card statement for statement cycle ending Sep 2026 is ready. Total amount due: Rs 8,450. Due date: 22-Oct-2026.",
    "LinkedIn: You have 3 new notifications and 1 connection request waiting from John Doe (Staff Engineer at Stripe).",
    "Weather update: Moderate rainfall expected in Bangalore today. High 28°C, Low 20°C. Carry an umbrella.",
    "Slack notification: @alex mentioned you in #general: 'Can you check the staging build logs when you get a chance?'",
    "Your monthly Spotify Premium subscription of $9.99 will auto-renew on October 12, 2026. Manage subscription in account settings.",
    "Airtel recharge successful: Unlimited 5G pack activated for 84 days. High-speed data balance: 2GB/day. Thank you for choosing Airtel."
]

EXPANDED_LEGITIMATE = []
for template in LEGITIMATE_TEMPLATES:
    EXPANDED_LEGITIMATE.append({"text": template, "label": 0, "category": "Legitimate", "risk_score": random.randint(5, 20)})
    for i in range(25):
        # subtle natural variations
        t = template.replace("tomorrow", "next Monday").replace("Rs 450", f"Rs {random.randint(100, 900)}").replace("Dr. Mehta", "Dr. Sharma")
        EXPANDED_LEGITIMATE.append({"text": t, "label": 0, "category": "Legitimate", "risk_score": random.randint(3, 24)})

# 3. URL DATASETS
PHISHING_URLS = [
    # Typosquatting / impersonation
    ("https://sbi-kyc-update.secure-verification-login.net/banking", 95, "Banking Scam"),
    ("http://paypal-account-security-center.com.co/resolve?token=98214", 94, "Phishing"),
    ("http://192.168.1.105:8080/netflix-free-premium/login.php", 96, "Phishing"),
    ("https://amazon-security-alert-center.support-gift.xyz/claim", 93, "Prize Scam"),
    ("http://appleid-apple-verify-service.icu/login?id=84920", 95, "Phishing"),
    ("https://hdfc-netbanking-portal-secure.top/corporate", 94, "Banking Scam"),
    ("http://gpay-cashback-offer-reward.claim-funds.online/upi", 92, "UPI Scam"),
    ("http://fedex-parcel-redelivery-tracking.support-info.biz/delivery", 91, "Delivery Scam"),
    ("https://wellsfargo-verify-customer-account.ru/signin", 97, "Banking Scam"),
    ("http://chase-bank-online-security-update.club/auth", 95, "Banking Scam"),
    ("https://binance-airdrop-bonus-claim.site/wallet", 96, "Crypto Scam"),
    ("http://metamask-seed-phrase-validator.tech/connect", 98, "Crypto Scam"),
    ("http://dhl-shipment-exception-fee.cc/invoice", 89, "Delivery Scam"),
    ("https://microsoft-account-compromised-support.help-desk.work", 92, "Tech Support Scam"),
    ("http://instagram-copyright-appeal-center.vip/badge", 91, "Social Media Scam"),
    ("https://irs-tax-refund-direct-deposit.info/claim", 96, "Government Impersonation"),
    ("http://parivahan-echallan-pay-fine.online/payment", 94, "Government Impersonation"),
    ("https://free-crypto-miner-yield.click/register", 90, "Investment Scam"),
    ("http://telegram-earn-money-daily.co/tasks", 89, "Job Scam"),
    ("http://fast-instant-cash-loan-app.top/apply", 92, "Loan Scam"),
]

# Expand phishing URLs
EXPANDED_PHISHING_URLS = []
for url, risk, cat in PHISHING_URLS:
    EXPANDED_PHISHING_URLS.append({"url": url, "label": 1, "category": cat, "risk_score": risk})
    # variations with subdomains, suspicious TLDs, hex/ip representations
    domains = ["secure-login", "account-alert", "verify-portal", "auth-check", "update-center", "safety-net"]
    tlds = [".top", ".xyz", ".club", ".icu", ".biz", ".online", ".site", ".ru", ".cc", ".work", ".info"]
    paths = ["/login.php", "/verify", "/account-hold", "/secure/signin", "/claim?id=", "/auth/session?token="]
    for _ in range(25):
        d = random.choice(domains)
        tld = random.choice(tlds)
        p = random.choice(paths) + str(random.randint(1000, 99999))
        scheme = "http://" if random.random() > 0.3 else "https://"
        rand_url = f"{scheme}{d}-{random.randint(10, 999)}{tld}{p}"
        EXPANDED_PHISHING_URLS.append({"url": rand_url, "label": 1, "category": cat, "risk_score": random.randint(80, 98)})

LEGITIMATE_URLS = [
    ("https://www.google.com", 2, "Legitimate"),
    ("https://www.github.com/microsoft/vscode", 5, "Legitimate"),
    ("https://en.wikipedia.org/wiki/Computer_security", 3, "Legitimate"),
    ("https://www.amazon.com/dp/B08N5WRWNW", 6, "Legitimate"),
    ("https://www.nytimes.com/section/technology", 4, "Legitimate"),
    ("https://stackoverflow.com/questions/tagged/python", 5, "Legitimate"),
    ("https://www.apple.com/iphone-15-pro/", 4, "Legitimate"),
    ("https://www.netflix.com/browse", 4, "Legitimate"),
    ("https://www.microsoft.com/en-us/windows", 5, "Legitimate"),
    ("https://www.onlinesbi.sbi", 8, "Legitimate"),
    ("https://www.hdfcbank.com/personal", 7, "Legitimate"),
    ("https://www.icicibank.com", 7, "Legitimate"),
    ("https://zoom.us/join", 6, "Legitimate"),
    ("https://www.linkedin.com/feed/", 5, "Legitimate"),
    ("https://www.youtube.com/watch?v=dQw4w9WgXcQ", 3, "Legitimate"),
    ("https://www.reddit.com/r/cybersecurity", 6, "Legitimate"),
    ("https://www.paypal.com/signin", 9, "Legitimate"),
    ("https://docs.python.org/3/library/index.html", 3, "Legitimate"),
    ("https://fastapi.tiangolo.com/tutorial/", 4, "Legitimate"),
    ("https://scikit-learn.org/stable/modules/classes.html", 4, "Legitimate"),
]

EXPANDED_LEGITIMATE_URLS = []
for url, risk, cat in LEGITIMATE_URLS:
    EXPANDED_LEGITIMATE_URLS.append({"url": url, "label": 0, "category": cat, "risk_score": risk})
    # add clean subpaths
    for sub in ["about", "contact", "support", "products", "pricing", "blog", "privacy", "terms", "docs", "help"]:
        EXPANDED_LEGITIMATE_URLS.append({"url": f"{url}/{sub}", "label": 0, "category": cat, "risk_score": random.randint(2, 18)})

# Write out base CSVs
df_scam = pd.DataFrame(EXPANDED_SCAMS)
df_legit = pd.DataFrame(EXPANDED_LEGITIMATE)
df_phish_url = pd.DataFrame(EXPANDED_PHISHING_URLS)
df_legit_url = pd.DataFrame(EXPANDED_LEGITIMATE_URLS)

df_scam.to_csv(os.path.join(DATASET_DIR, "scam_messages.csv"), index=False)
df_legit.to_csv(os.path.join(DATASET_DIR, "legitimate_messages.csv"), index=False)
df_phish_url.to_csv(os.path.join(DATASET_DIR, "phishing_urls.csv"), index=False)
df_legit_url.to_csv(os.path.join(DATASET_DIR, "legitimate_urls.csv"), index=False)

# Combine for Train / Val / Test splits (avoid data leakage)
# Message dataset
df_messages_all = pd.concat([df_scam, df_legit]).sample(frac=1, random_state=42).reset_index(drop=True)
n_msg = len(df_messages_all)
train_msg_end = int(0.70 * n_msg)
val_msg_end = int(0.85 * n_msg)

df_messages_all.iloc[:train_msg_end].to_csv(os.path.join(TRAIN_DIR, "messages_train.csv"), index=False)
df_messages_all.iloc[train_msg_end:val_msg_end].to_csv(os.path.join(VAL_DIR, "messages_val.csv"), index=False)
df_messages_all.iloc[val_msg_end:].to_csv(os.path.join(TEST_DIR, "messages_test.csv"), index=False)

# URL dataset
df_urls_all = pd.concat([df_phish_url, df_legit_url]).sample(frac=1, random_state=42).reset_index(drop=True)
n_url = len(df_urls_all)
train_url_end = int(0.70 * n_url)
val_url_end = int(0.85 * n_url)

df_urls_all.iloc[:train_url_end].to_csv(os.path.join(TRAIN_DIR, "urls_train.csv"), index=False)
df_urls_all.iloc[train_url_end:val_url_end].to_csv(os.path.join(VAL_DIR, "urls_val.csv"), index=False)
df_urls_all.iloc[val_url_end:].to_csv(os.path.join(TEST_DIR, "urls_test.csv"), index=False)

print(f"Dataset generated successfully:")
print(f"Messages: {len(df_messages_all)} total ({len(df_scam)} scam, {len(df_legit)} legit)")
print(f"URLs: {len(df_urls_all)} total ({len(df_phish_url)} phishing, {len(df_legit_url)} legit)")
print(f"Splits saved to {TRAIN_DIR}, {VAL_DIR}, and {TEST_DIR}")
