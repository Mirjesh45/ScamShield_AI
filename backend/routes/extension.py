"""
ScamShield AI - Browser Extension API Router
Provides lightweight, optimized endpoints for the Chrome/Firefox browser extension.
Returns minimal JSON responses to keep the popup snappy.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from backend.services.text_detector import text_detector
from backend.services.url_detector import url_detector
from backend.services.risk_engine import risk_engine
from backend.services.explanation_engine import explanation_engine
from backend.database.db import get_db_connection

router = APIRouter(prefix="/api/extension", tags=["Browser Extension"])


class ExtScanURLRequest(BaseModel):
    url: str


class ExtScanTextRequest(BaseModel):
    content: str


def _build_minimal_response(classification: str, risk_score: int, category: str, explanation: str):
    """Return a slim payload that keeps the popup load time fast."""
    return {
        "classification": classification,
        "risk_score": risk_score,
        "category": category,
        "explanation": explanation,
        "advisory_disclaimer": "AI predictions are advisory — not absolute proof.",
    }


@router.post("/scan-url")
def extension_scan_url(req: ExtScanURLRequest):
    url = req.url.strip()
    if not url:
        return {"error": True, "message": "URL cannot be empty."}

    conn = get_db_connection()
    try:
        url_res = url_detector.analyze(url, db_connection=conn)
    finally:
        conn.close()

    if "error" in url_res:
        return {"error": True, "message": url_res["error"]}

    threat_hit = bool(url_res.get("threat_match"))
    risk = risk_engine.calculate_risk(
        url_prob=url_res["ml_probability"],
        indicators=url_res["indicators"],
        threat_intel_hit=threat_hit,
    )
    category = url_res["suggested_category"] if risk["classification"] != "Likely Safe" else "Legitimate"
    exp = explanation_engine.generate_explanation(
        classification=risk["classification"],
        category=category,
        indicators=url_res["indicators"],
        input_type="URL",
    )
    return _build_minimal_response(risk["classification"], risk["risk_score"], category, exp)


@router.post("/scan-text")
def extension_scan_text(req: ExtScanTextRequest):
    text = req.content.strip()
    if not text:
        return {"error": True, "message": "Text cannot be empty."}

    text_res = text_detector.analyze(text)
    if "error" in text_res:
        return {"error": True, "message": text_res["error"]}

    indicators = list(text_res["indicators"])
    url_prob = 0.0
    threat_hit = False

    if text_res["extracted_urls"]:
        conn = get_db_connection()
        try:
            url_res = url_detector.analyze(text_res["extracted_urls"][0], db_connection=conn)
        finally:
            conn.close()
        if "error" not in url_res:
            url_prob = url_res["ml_probability"]
            threat_hit = bool(url_res.get("threat_match"))
            indicators.extend(url_res["indicators"])

    risk = risk_engine.calculate_risk(
        text_prob=text_res["ml_probability"],
        url_prob=url_prob,
        indicators=indicators,
        threat_intel_hit=threat_hit,
    )
    exp = explanation_engine.generate_explanation(
        classification=risk["classification"],
        category=text_res["category"],
        indicators=indicators,
        input_type="message",
    )
    return _build_minimal_response(risk["classification"], risk["risk_score"], text_res["category"], exp)
