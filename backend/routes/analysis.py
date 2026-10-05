"""
ScamShield AI - Analysis Router
Coordinates multi-modal detection endpoints for messages, emails, URLs, and screenshots.
"""
import uuid
import json
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from pydantic import BaseModel
from backend.database.db import get_db_connection
from backend.services.text_detector import text_detector
from backend.services.url_detector import url_detector
from backend.services.image_processor import image_processor
from backend.services.risk_engine import risk_engine
from backend.services.explanation_engine import explanation_engine
from backend.utils.security import sanitize_pii
from backend.routes.auth import get_current_user

router = APIRouter(prefix="/api/analyze", tags=["Detection Engine"])

class MessageAnalysisRequest(BaseModel):
    content: str
    save_to_history: bool = True

class EmailAnalysisRequest(BaseModel):
    sender: Optional[str] = ""
    subject: Optional[str] = ""
    body: str
    save_to_history: bool = True

class URLAnalysisRequest(BaseModel):
    url: str
    save_to_history: bool = True

def record_analysis(
    conn,
    analysis_id: str,
    user_id: Optional[int],
    input_type: str,
    input_preview: str,
    classification: str,
    risk_score: int,
    risk_level: str,
    confidence: float,
    category: str,
    indicators: list,
    explanation: str,
    recommendations: list,
    metadata: Optional[dict] = None
):
    try:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO analyses 
        (id, user_id, input_type, input_preview, classification, risk_score, risk_level, confidence, category, indicators, explanation, recommendations, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            analysis_id,
            user_id,
            input_type,
            input_preview[:250],
            classification,
            risk_score,
            risk_level,
            confidence,
            category,
            json.dumps(indicators),
            explanation,
            json.dumps(recommendations),
            json.dumps(metadata or {}),
            datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        ))
        conn.commit()
    except Exception as e:
        print(f"[Warning] Failed to record analysis in DB: {e}")

@router.post("/message")
def analyze_message(req: MessageAnalysisRequest, current_user: Optional[dict] = Depends(get_current_user)):
    raw_text = req.content.strip()
    if not raw_text:
        raise HTTPException(status_code=400, detail="Please enter a message to analyze.")

    text_res = text_detector.analyze(raw_text)
    if "error" in text_res:
        raise HTTPException(status_code=400, detail=text_res["error"])

    # If message contains extracted URLs, inspect the primary URL as well
    url_prob = 0.0
    threat_hit = False
    indicators = list(text_res["indicators"])
    
    conn = get_db_connection()
    if text_res["extracted_urls"]:
        primary_url = text_res["extracted_urls"][0]
        url_res = url_detector.analyze(primary_url, db_connection=conn)
        if "error" not in url_res:
            url_prob = url_res["ml_probability"]
            if url_res.get("threat_match"):
                threat_hit = True
            indicators.extend(url_res["indicators"])

    risk_assessment = risk_engine.calculate_risk(
        text_prob=text_res["ml_probability"],
        url_prob=url_prob,
        indicators=indicators,
        threat_intel_hit=threat_hit
    )

    explanation = explanation_engine.generate_explanation(
        classification=risk_assessment["classification"],
        category=text_res["category"],
        indicators=indicators,
        input_type="message"
    )

    recommendations = explanation_engine.get_recommendations(
        category=text_res["category"],
        classification=risk_assessment["classification"]
    )

    analysis_id = f"msg_{uuid.uuid4().hex[:10]}"
    sanitized_preview = sanitize_pii(raw_text)

    if req.save_to_history:
        record_analysis(
            conn=conn,
            analysis_id=analysis_id,
            user_id=current_user["id"] if current_user else None,
            input_type="message",
            input_preview=sanitized_preview,
            classification=risk_assessment["classification"],
            risk_score=risk_assessment["risk_score"],
            risk_level=risk_assessment["risk_level"],
            confidence=risk_assessment["confidence"],
            category=text_res["category"],
            indicators=indicators,
            explanation=explanation,
            recommendations=recommendations,
            metadata={"urls": text_res["extracted_urls"]}
        )
    conn.close()

    return {
        "analysis_id": analysis_id,
        "classification": risk_assessment["classification"],
        "risk_score": risk_assessment["risk_score"],
        "risk_level": risk_assessment["risk_level"],
        "confidence": risk_assessment["confidence"],
        "category": text_res["category"],
        "indicators": indicators,
        "explanation": explanation,
        "recommendations": recommendations,
        "extracted_urls": text_res["extracted_urls"],
        "advisory_disclaimer": "AI predictions are advisory and should not be treated as absolute proof. Verify sensitive transactions through official channels."
    }

@router.post("/email")
def analyze_email(req: EmailAnalysisRequest, current_user: Optional[dict] = Depends(get_current_user)):
    body_text = req.body.strip()
    if not body_text:
        raise HTTPException(status_code=400, detail="Please enter email body content to analyze.")

    # Combine subject and body for analysis
    full_content = f"{req.subject}\n\n{body_text}".strip()
    text_res = text_detector.analyze(full_content)
    indicators = list(text_res["indicators"])

    # Email Specific Spoofing Heuristics
    if req.sender:
        sender_lower = req.sender.lower()
        impersonated_brands = ["paypal", "amazon", "apple", "netflix", "microsoft", "google", "sbi", "hdfc", "fedex", "dhl"]
        for brand in impersonated_brands:
            if brand in sender_lower:
                # Check if sender domain actually matches legitimate domain
                legit_domains = [f"@{brand}.com", f"@{brand}.in", f"@{brand}.co.in", f"@{brand}.net"]
                if not any(legit_domain in sender_lower for legit_domain in legit_domains):
                    indicators.insert(0, {
                        "name": "Sender Domain Spoofing / Display Name Mismatch",
                        "evidence": req.sender,
                        "severity": "CRITICAL",
                        "explanation": f"The email references '{brand}', but originates from an external or disguised email domain."
                    })
                    break

    conn = get_db_connection()
    url_prob = 0.0
    threat_hit = False
    if text_res["extracted_urls"]:
        primary_url = text_res["extracted_urls"][0]
        url_res = url_detector.analyze(primary_url, db_connection=conn)
        if "error" not in url_res:
            url_prob = url_res["ml_probability"]
            if url_res.get("threat_match"):
                threat_hit = True
            indicators.extend(url_res["indicators"])

    risk_assessment = risk_engine.calculate_risk(
        text_prob=text_res["ml_probability"],
        url_prob=url_prob,
        indicators=indicators,
        threat_intel_hit=threat_hit
    )

    explanation = explanation_engine.generate_explanation(
        classification=risk_assessment["classification"],
        category=text_res["category"],
        indicators=indicators,
        input_type="email"
    )

    recommendations = explanation_engine.get_recommendations(
        category=text_res["category"],
        classification=risk_assessment["classification"]
    )

    analysis_id = f"eml_{uuid.uuid4().hex[:10]}"
    preview = f"From: {req.sender} | Subject: {req.subject} | {body_text[:120]}"

    if req.save_to_history:
        record_analysis(
            conn=conn,
            analysis_id=analysis_id,
            user_id=current_user["id"] if current_user else None,
            input_type="email",
            input_preview=sanitize_pii(preview),
            classification=risk_assessment["classification"],
            risk_score=risk_assessment["risk_score"],
            risk_level=risk_assessment["risk_level"],
            confidence=risk_assessment["confidence"],
            category=text_res["category"],
            indicators=indicators,
            explanation=explanation,
            recommendations=recommendations,
            metadata={"sender": req.sender, "subject": req.subject, "urls": text_res["extracted_urls"]}
        )
    conn.close()

    return {
        "analysis_id": analysis_id,
        "classification": risk_assessment["classification"],
        "risk_score": risk_assessment["risk_score"],
        "risk_level": risk_assessment["risk_level"],
        "confidence": risk_assessment["confidence"],
        "category": text_res["category"],
        "indicators": indicators,
        "explanation": explanation,
        "recommendations": recommendations,
        "extracted_urls": text_res["extracted_urls"],
        "advisory_disclaimer": "AI predictions are advisory and should not be treated as absolute proof. Verify sensitive transactions through official channels."
    }

@router.post("/url")
def analyze_url(req: URLAnalysisRequest, current_user: Optional[dict] = Depends(get_current_user)):
    url = req.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="Please enter a valid URL to analyze.")

    conn = get_db_connection()
    url_res = url_detector.analyze(url, db_connection=conn)
    if "error" in url_res:
        conn.close()
        raise HTTPException(status_code=400, detail=url_res["error"])

    threat_hit = bool(url_res.get("threat_match"))
    risk_assessment = risk_engine.calculate_risk(
        url_prob=url_res["ml_probability"],
        indicators=url_res["indicators"],
        threat_intel_hit=threat_hit
    )

    category = url_res["suggested_category"] if risk_assessment["classification"] != "Likely Safe" else "Legitimate"

    explanation = explanation_engine.generate_explanation(
        classification=risk_assessment["classification"],
        category=category,
        indicators=url_res["indicators"],
        input_type="URL"
    )

    recommendations = explanation_engine.get_recommendations(
        category=category,
        classification=risk_assessment["classification"]
    )

    analysis_id = f"url_{uuid.uuid4().hex[:10]}"

    if req.save_to_history:
        record_analysis(
            conn=conn,
            analysis_id=analysis_id,
            user_id=current_user["id"] if current_user else None,
            input_type="url",
            input_preview=url,
            classification=risk_assessment["classification"],
            risk_score=risk_assessment["risk_score"],
            risk_level=risk_assessment["risk_level"],
            confidence=risk_assessment["confidence"],
            category=category,
            indicators=url_res["indicators"],
            explanation=explanation,
            recommendations=recommendations,
            metadata={"hostname": url_res["hostname"], "has_https": url_res["has_https"], "entropy": url_res["entropy"]}
        )
    conn.close()

    return {
        "analysis_id": analysis_id,
        "url": url,
        "classification": risk_assessment["classification"],
        "risk_score": risk_assessment["risk_score"],
        "risk_level": risk_assessment["risk_level"],
        "confidence": risk_assessment["confidence"],
        "category": category,
        "indicators": url_res["indicators"],
        "explanation": explanation,
        "recommendations": recommendations,
        "url_details": {
            "hostname": url_res["hostname"],
            "has_https": url_res["has_https"],
            "entropy": url_res["entropy"]
        },
        "advisory_disclaimer": "AI predictions are advisory and should not be treated as absolute proof. Verify sensitive transactions through official channels."
    }

@router.post("/image")
async def analyze_image(
    file: UploadFile = File(...),
    save_to_history: bool = Form(True),
    current_user: Optional[dict] = Depends(get_current_user)
):
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    proc_res = image_processor.process_image(contents, filename=file.filename or "upload.png")
    if "error" in proc_res:
        raise HTTPException(status_code=400, detail=proc_res["error"])

    extracted_text = proc_res["extracted_text"]
    extracted_urls = proc_res["extracted_urls"]

    text_res = text_detector.analyze(extracted_text)
    indicators = list(text_res["indicators"])
    
    conn = get_db_connection()
    url_prob = 0.0
    threat_hit = False

    # Check extracted URLs
    all_urls = list(dict.fromkeys(extracted_urls + text_res.get("extracted_urls", [])))
    if all_urls:
        primary_url = all_urls[0]
        url_res = url_detector.analyze(primary_url, db_connection=conn)
        if "error" not in url_res:
            url_prob = url_res["ml_probability"]
            if url_res.get("threat_match"):
                threat_hit = True
            indicators.extend(url_res["indicators"])

    risk_assessment = risk_engine.calculate_risk(
        text_prob=text_res["ml_probability"],
        url_prob=url_prob,
        indicators=indicators,
        threat_intel_hit=threat_hit
    )

    explanation = explanation_engine.generate_explanation(
        classification=risk_assessment["classification"],
        category=text_res["category"],
        indicators=indicators,
        input_type="screenshot"
    )

    recommendations = explanation_engine.get_recommendations(
        category=text_res["category"],
        classification=risk_assessment["classification"]
    )

    analysis_id = f"img_{uuid.uuid4().hex[:10]}"
    preview = f"Image: {file.filename} | Extracted: {extracted_text[:120]}"

    if save_to_history:
        record_analysis(
            conn=conn,
            analysis_id=analysis_id,
            user_id=current_user["id"] if current_user else None,
            input_type="image",
            input_preview=sanitize_pii(preview),
            classification=risk_assessment["classification"],
            risk_score=risk_assessment["risk_score"],
            risk_level=risk_assessment["risk_level"],
            confidence=risk_assessment["confidence"],
            category=text_res["category"],
            indicators=indicators,
            explanation=explanation,
            recommendations=recommendations,
            metadata={"filename": file.filename, "extracted_urls": all_urls, "ocr_engine": proc_res["ocr_engine"]}
        )
    conn.close()

    return {
        "analysis_id": analysis_id,
        "classification": risk_assessment["classification"],
        "risk_score": risk_assessment["risk_score"],
        "risk_level": risk_assessment["risk_level"],
        "confidence": risk_assessment["confidence"],
        "category": text_res["category"],
        "extracted_text": extracted_text,
        "extracted_urls": all_urls,
        "image_info": {
            "filename": proc_res["filename"],
            "format": proc_res["format"],
            "dimensions": proc_res["dimensions"],
            "size_kb": proc_res["size_kb"],
            "ocr_engine": proc_res["ocr_engine"]
        },
        "indicators": indicators,
        "explanation": explanation,
        "recommendations": recommendations,
        "advisory_disclaimer": "AI predictions are advisory and should not be treated as absolute proof. Verify sensitive transactions through official channels."
    }
