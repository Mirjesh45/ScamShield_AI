"""
ScamShield AI - History Router
Provides endpoints to search, filter, inspect, and delete analysis audit logs.
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
import json
from backend.database.db import get_db_connection
from backend.routes.auth import get_current_user

router = APIRouter(prefix="/api/history", tags=["Analysis History"])

@router.get("")
def get_history(
    search: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Optional[dict] = Depends(get_current_user)
):
    conn = get_db_connection()
    cursor = conn.cursor()

    conditions = []
    params = []

    if current_user:
        conditions.append("(user_id = ? OR user_id IS NULL)")
        params.append(current_user["id"])

    if search and search.strip():
        conditions.append("(input_preview LIKE ? OR category LIKE ? OR explanation LIKE ?)")
        wildcard = f"%{search.strip()}%"
        params.extend([wildcard, wildcard, wildcard])

    if type and type.lower() != "all":
        conditions.append("LOWER(input_type) = ?")
        params.append(type.strip().lower())

    if risk_level and risk_level.upper() != "ALL":
        conditions.append("UPPER(risk_level) = ?")
        params.append(risk_level.strip().upper())

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    # Total count query
    count_query = f"SELECT COUNT(*) FROM analyses {where_clause}"
    cursor.execute(count_query, params)
    total_count = cursor.fetchone()[0]

    # Data query
    data_query = f"""
    SELECT id, user_id, input_type, input_preview, classification, risk_score, 
           risk_level, confidence, category, indicators, explanation, 
           recommendations, metadata, created_at
    FROM analyses
    {where_clause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
    """
    params.extend([limit, offset])
    cursor.execute(data_query, params)
    rows = cursor.fetchall()
    conn.close()

    items = []
    for r in rows:
        try:
            indicators = json.loads(r["indicators"]) if r["indicators"] else []
        except Exception:
            indicators = []
        try:
            recommendations = json.loads(r["recommendations"]) if r["recommendations"] else []
        except Exception:
            recommendations = []
        try:
            meta = json.loads(r["metadata"]) if r["metadata"] else {}
        except Exception:
            meta = {}

        items.append({
            "id": r["id"],
            "input_type": r["input_type"],
            "input_preview": r["input_preview"],
            "classification": r["classification"],
            "risk_score": r["risk_score"],
            "risk_level": r["risk_level"],
            "confidence": r["confidence"],
            "category": r["category"],
            "indicators": indicators,
            "explanation": r["explanation"],
            "recommendations": recommendations,
            "metadata": meta,
            "created_at": r["created_at"]
        })

    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "items": items
    }

@router.delete("/{analysis_id}")
def delete_history_item(analysis_id: str, current_user: Optional[dict] = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM analyses WHERE id = ?", (analysis_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    cursor.execute("DELETE FROM analyses WHERE id = ?", (analysis_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "message": f"Deleted analysis record {analysis_id}"}

@router.delete("")
def clear_all_history(current_user: Optional[dict] = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    if current_user:
        cursor.execute("DELETE FROM analyses WHERE user_id = ?", (current_user["id"],))
    else:
        cursor.execute("DELETE FROM analyses WHERE user_id IS NULL")
    conn.commit()
    conn.close()
    return {"status": "success", "message": "History cleared successfully"}
