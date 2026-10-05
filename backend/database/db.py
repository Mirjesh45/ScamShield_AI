"""
ScamShield AI - Database Management Layer
SQLite database for users, analysis records, and threat intelligence.
"""
import os
import sqlite3
import json
from datetime import datetime
from typing import Optional, Dict, Any, List

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scamshield.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        role TEXT DEFAULT 'analyst',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Analyses table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS analyses (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        input_type TEXT NOT NULL,
        input_preview TEXT NOT NULL,
        classification TEXT NOT NULL,
        risk_score INTEGER NOT NULL,
        risk_level TEXT NOT NULL,
        confidence REAL NOT NULL,
        category TEXT NOT NULL,
        indicators TEXT NOT NULL,
        explanation TEXT NOT NULL,
        recommendations TEXT NOT NULL,
        metadata TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    )
    """)

    # Threat Intelligence table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS threat_intel (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        indicator_type TEXT NOT NULL,
        value TEXT UNIQUE NOT NULL,
        risk_level TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        source TEXT DEFAULT 'ScamShield Threat Matrix',
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()

    # Seed initial realistic Threat Intelligence items if empty
    cursor.execute("SELECT COUNT(*) FROM threat_intel")
    if cursor.fetchone()[0] == 0:
        seed_threat_intel(cursor)

    # Seed sample analyses for rich historical dashboard stats if empty
    cursor.execute("SELECT COUNT(*) FROM analyses")
    if cursor.fetchone()[0] == 0:
        seed_sample_analyses(cursor)

    conn.commit()
    conn.close()

def seed_threat_intel(cursor):
    sample_threats = [
        ("domain", "sbi-kyc-portal.secure-net.cc", "CRITICAL", "Banking Scam", "Impersonates State Bank of India customer verification form with credential phishing."),
        ("domain", "fedex-parcel-redelivery.biz", "HIGH", "Delivery Scam", "Fake postal tracking portal demanding fake re-delivery charges."),
        ("domain", "binance-airdrop-bonus.site", "CRITICAL", "Crypto Scam", "Counterfeit Web3 authorization page requesting private key import."),
        ("domain", "parivahan-echallan-pay.online", "HIGH", "Government Impersonation", "Fraudulent government traffic police challan payment gateway."),
        ("url", "https://gpay-cashback-offer.claim-pay.in?id=9821", "HIGH", "UPI Scam", "Phishing link asking user to approve UPI collect transaction to receive non-existent prize."),
        ("keyword", "enter UPI PIN to receive money", "HIGH", "UPI Scam", "Classic UPI manipulation: UPI PIN is never required to receive money."),
        ("keyword", "SIM KYC suspended in 24 hours", "HIGH", "KYC Scam", "Urgent telecom disconnection threat coercing victims into downloading remote access apps."),
        ("keyword", "WhatsApp lottery 25 Lakhs winner", "CRITICAL", "Lottery Scam", "Counterfeit lucky draw notification soliciting advance customs clearance fees."),
        ("keyword", "shortlisted for Telegram task like videos", "HIGH", "Job Scam", "Prevalent task fraud asking for deposit to unlock earnings tier.")
    ]
    cursor.executemany("""
    INSERT OR IGNORE INTO threat_intel (indicator_type, value, risk_level, category, description)
    VALUES (?, ?, ?, ?, ?)
    """, sample_threats)

def seed_sample_analyses(cursor):
    samples = [
        ("rep_001", None, "message", "Congratulations! You have won Rs 50,000. Click this link immediately to claim your prize.", "Likely Scam", 91, "CRITICAL", 0.94, "Prize Scam", 
         json.dumps([{"name": "Financial Reward Claim", "evidence": "won Rs 50,000", "severity": "HIGH", "explanation": "Promises unearned wealth to generate irrational excitement."},
                     {"name": "Urgency", "evidence": "immediately to claim", "severity": "HIGH", "explanation": "Creates false pressure so victims act before thinking."}]),
         "The message displays classic prize lottery fraud patterns designed to trick you into clicking an unknown link.",
         json.dumps(["Do not click the link.", "Do not provide OTP, PIN, or banking credentials.", "Block and report this sender."]),
         "2026-10-02 14:15:00"),
        ("rep_002", None, "url", "https://sbi-kyc-portal.secure-net.cc", "Likely Scam", 94, "CRITICAL", 0.96, "Banking Scam",
         json.dumps([{"name": "Suspicious TLD", "evidence": ".cc", "severity": "MEDIUM", "explanation": "Frequently leveraged by fast-flux phishing operators."},
                     {"name": "High Entropy Subdomain", "evidence": "secure-net.cc", "severity": "HIGH", "explanation": "Domain does not match legitimate bank domain."}]),
         "The URL uses domain spoofing to impersonate SBI banking infrastructure.",
         json.dumps(["Never enter bank credentials on non-official domains.", "Always visit onlinesbi.sbi directly."]),
         "2026-10-02 12:30:00"),
        ("rep_003", None, "email", "Invoice FDX-98214: Package delivery failed due to address error. Pay $3.50 clearance fee.", "Likely Scam", 88, "HIGH", 0.91, "Delivery Scam",
         json.dumps([{"name": "Impersonation", "evidence": "Invoice FDX-98214", "severity": "HIGH", "explanation": "Impersonates courier service to extort credit card details."}]),
         "Scammer asks for small payment to compromise card information.",
         json.dumps(["Check official delivery tracking directly on official app.", "Do not open invoice links."]),
         "2026-10-01 16:45:00"),
        ("rep_004", None, "message", "Your OTP for Amazon login is 491029. Do not share with anyone.", "Likely Safe", 8, "LOW", 0.98, "Legitimate",
         json.dumps([{"name": "Standard Security Advisory", "evidence": "Do not share with anyone", "severity": "LOW", "explanation": "Includes standard safety hygiene."}]),
         "Matches benign two-factor authentication notification.",
         json.dumps(["Normal OTP notification. Never share OTP with anyone calling you."]),
         "2026-10-01 11:20:00"),
        ("rep_005", None, "url", "https://github.com/microsoft/vscode", "Likely Safe", 4, "LOW", 0.99, "Legitimate",
         json.dumps([]),
         "Reputable domain with valid SSL and clean threat intelligence record.",
         json.dumps(["URL appears safe to visit."]),
         "2026-09-30 09:15:00"),
        ("rep_006", None, "message", "Part-time job: Earn Rs 4000 daily by rating restaurants on Google Maps. Contact @hr_vip on Telegram", "Likely Scam", 89, "HIGH", 0.93, "Job Scam",
         json.dumps([{"name": "High Payout Low Effort", "evidence": "Earn Rs 4000 daily by rating restaurants", "severity": "HIGH", "explanation": "Hallmark of task/prepayment fraud."}]),
         "Task fraud coercing victims into depositing funds into cryptocurrency wallets.",
         json.dumps(["No legitimate company conducts paid ratings on Telegram.", "Do not send any deposits."]),
         "2026-09-29 18:05:00"),
        ("rep_007", None, "url", "http://paytm-cashback-claim.xyz/offer", "Likely Scam", 92, "CRITICAL", 0.95, "UPI Scam",
         json.dumps([{"name": "Insecure Protocol", "evidence": "http://", "severity": "HIGH", "explanation": "Lacks SSL encryption."},
                     {"name": "Suspicious TLD", "evidence": ".xyz", "severity": "MEDIUM", "explanation": "Cheap TLD domain commonly registered in bulk for phishing."}]),
         "Fake cashback portal impersonating digital payment app.",
         json.dumps(["Do not enter UPI PIN or bank details.", "Report link to cybercrime portal."]),
         "2026-09-28 14:10:00")
    ]
    for sample in samples:
        cursor.execute("""
        INSERT OR IGNORE INTO analyses 
        (id, user_id, input_type, input_preview, classification, risk_score, risk_level, confidence, category, indicators, explanation, recommendations, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sample)
