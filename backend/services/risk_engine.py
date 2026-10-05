"""
ScamShield AI - Unified Risk Assessment Engine
Standardizes risk scoring (0-100), risk tiers (LOW, MEDIUM, HIGH, CRITICAL),
calibrates confidence percentages, and ensures product safety guidelines are met.
"""
from typing import Dict, Any, List

class RiskEngine:
    """
    Risk Score Calibration:
    0–29   : LOW      -> Likely Safe
    30–59  : MEDIUM   -> Suspicious
    60–79  : HIGH     -> Likely Scam
    80–100 : CRITICAL -> Likely Scam
    """

    @staticmethod
    def calculate_risk(
        text_prob: float = 0.0,
        url_prob: float = 0.0,
        indicators: List[Dict[str, Any]] = None,
        threat_intel_hit: bool = False
    ) -> Dict[str, Any]:
        indicators = indicators or []
        
        # Base probability calculation from multi-modal inputs
        if text_prob > 0 and url_prob > 0:
            # Both text and URL present
            combined_prob = max(text_prob, url_prob) * 0.70 + min(text_prob, url_prob) * 0.30
        elif text_prob > 0:
            combined_prob = text_prob
        elif url_prob > 0:
            combined_prob = url_prob
        else:
            combined_prob = 0.05

        # Factor in severity of indicators
        severity_points = {
            "CRITICAL": 18,
            "HIGH": 12,
            "MEDIUM": 6,
            "LOW": 2
        }
        indicator_score = sum(severity_points.get(ind.get("severity", "LOW"), 2) for ind in indicators)
        
        # Threat intel hit overrides base floor
        if threat_intel_hit:
            indicator_score += 40

        # Calculate raw score 0 to 100
        raw_score = (combined_prob * 65) + min(35, indicator_score)
        
        # Clamp to [4, 98] to NEVER claim 0% or 100% (Safety requirement)
        final_score = int(round(max(4, min(98, raw_score))))

        # Determine Risk Level and Classification
        if final_score < 30:
            risk_level = "LOW"
            classification = "Likely Safe"
            confidence = round(max(0.72, min(0.98, 1.0 - (final_score / 100.0) + 0.1)), 2)
        elif final_score < 60:
            risk_level = "MEDIUM"
            classification = "Suspicious"
            confidence = round(max(0.68, min(0.88, 0.75 + abs(final_score - 45) / 100)), 2)
        elif final_score < 80:
            risk_level = "HIGH"
            classification = "Likely Scam"
            confidence = round(max(0.82, min(0.96, (final_score / 100.0) + 0.12)), 2)
        else:
            risk_level = "CRITICAL"
            classification = "Likely Scam"
            confidence = round(max(0.90, min(0.98, (final_score / 100.0) + 0.05)), 2)

        # Ensure confidence never exceeds 0.99
        confidence = min(0.99, confidence)

        return {
            "risk_score": final_score,
            "risk_level": risk_level,
            "classification": classification,
            "confidence": confidence
        }

risk_engine = RiskEngine()
