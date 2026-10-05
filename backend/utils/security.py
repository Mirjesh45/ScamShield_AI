"""
ScamShield AI - Security & Privacy Engine
Handles password hashing, JWT authentication tokens, and strict PII sanitization.
"""
import re
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from passlib.context import CryptContext
import jwt

SECRET_KEY = os.getenv("SCAMSHIELD_SECRET_KEY", "scamshield-super-secure-production-jwt-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None

def sanitize_pii(text: str) -> str:
    """
    Sanitizes sensitive personally identifiable information (PII)
    prior to any storage or logs:
    - Credit/Debit Card numbers (13-19 digits)
    - Phone numbers (10 digits, international prefix)
    - Email addresses
    - Indian Aadhaar / PAN / US SSN formats
    - UPI IDs
    """
    if not text:
        return text

    sanitized = text

    # Credit cards (16 digits with or without spaces/dashes)
    sanitized = re.sub(r'\b(?:\d{4}[ -]?){3}\d{4}\b', '[REDACTED_CARD_NUMBER]', sanitized)

    # Email addresses
    sanitized = re.sub(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', '[REDACTED_EMAIL]', sanitized)

    # Phone numbers (+91, +1, or standard 10 digits)
    sanitized = re.sub(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b', '[REDACTED_PHONE]', sanitized)

    # Indian Aadhaar (12 digits, often in groups of 4)
    sanitized = re.sub(r'\b\d{4}\s\d{4}\s\d{4}\b', '[REDACTED_AADHAAR]', sanitized)

    # PAN Card (5 letters, 4 digits, 1 letter)
    sanitized = re.sub(r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b', '[REDACTED_PAN]', sanitized)

    # SSN (XXX-XX-XXXX)
    sanitized = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '[REDACTED_SSN]', sanitized)

    # UPI IDs (e.g. name@okaxis, user@ybl)
    sanitized = re.sub(r'\b[a-zA-Z0-9.\-_]{2,256}@(okaxis|okhdfcbank|okicici|oksbi|ybl|ibl|paytm|axl|apl)\b', '[REDACTED_UPI_ID]', sanitized)

    return sanitized
