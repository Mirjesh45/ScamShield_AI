"""
ScamShield AI - Authentication Router
Handles user signup, login, session validation, and instant demo login.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
import sqlite3
from backend.database.db import get_db_connection
from backend.utils.security import verify_password, get_password_hash, create_access_token, decode_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    username_or_email: str
    password: str

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    if not credentials:
        return None
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        return None
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email, role, created_at FROM users WHERE id = ?", (payload.get("sub"),))
    user = cursor.fetchone()
    conn.close()
    if not user:
        return None
    return dict(user)

@router.post("/register")
def register(req: RegisterRequest):
    if len(req.username.strip()) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters long.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM users WHERE username = ? OR email = ?", (req.username.strip(), req.email.strip().lower()))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username or email already registered.")

        hashed = get_password_hash(req.password)
        cursor.execute(
            "INSERT INTO users (username, email, hashed_password, role) VALUES (?, ?, ?, 'analyst')",
            (req.username.strip(), req.email.strip().lower(), hashed)
        )
        conn.commit()
        user_id = cursor.lastrowid
    finally:
        conn.close()

    token = create_access_token({"sub": user_id, "username": req.username, "role": "analyst"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "username": req.username,
            "email": req.email,
            "role": "analyst"
        }
    }

@router.post("/login")
def login(req: LoginRequest):
    identifier = req.username_or_email.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email, hashed_password, role FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?", (identifier, identifier))
    user = cursor.fetchone()
    conn.close()

    if not user or not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    token = create_access_token({"sub": user["id"], "username": user["username"], "role": user["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"]
        }
    }

@router.post("/demo")
def demo_login():
    """Allows instant frictionless testing as a Lead Security Analyst."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email, role FROM users WHERE username = 'sec_analyst'")
    user = cursor.fetchone()

    if not user:
        hashed = get_password_hash("ScamShield2026!")
        cursor.execute(
            "INSERT INTO users (username, email, hashed_password, role) VALUES ('sec_analyst', 'analyst@scamshield.ai', ?, 'lead_analyst')",
            (hashed,)
        )
        conn.commit()
        user_id = cursor.lastrowid
        role = "lead_analyst"
        username = "sec_analyst"
        email = "analyst@scamshield.ai"
    else:
        user_id = user["id"]
        role = user["role"]
        username = user["username"]
        email = user["email"]
    conn.close()

    token = create_access_token({"sub": user_id, "username": username, "role": role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "username": username,
            "email": email,
            "role": role
        }
    }

@router.get("/me")
def get_me(current_user: Optional[dict] = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"user": current_user}
