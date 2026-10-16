from typing import Any
import json
import logging
import uuid
from datetime import datetime, timezone, date
from sqlalchemy.orm import Session
from app.models.models import (
    User, UserProfile, Scheme, SchemeEligibilityRule,
    SchemeDateRecord, Recommendation, ExtractedDocumentData, UploadedDocument
)
from app.eligibility.engine import EligibilityEngine, EligibilityEvaluationResult
from app.scheme_ingestion.loader import compute_date_status
from app.core.config import settings

logger = logging.getLogger(__name__)

def generate_ai_explanation(
    user_data: dict[str, Any],
    scheme: Scheme,
    eval_result: EligibilityEvaluationResult
) -> str:
    """
    Generates personalized natural-language explanation.
    Uses Gemini API if configured; otherwise uses deterministic rule-based template.
    """
    if settings.GEMINI_API_KEY:
        try:
            import httpx
            prompt = (
                f"You are Yojana AI, an Indian government scheme advisor.\n"
                f"Explain concisely in 2-3 sentences why this scheme matches the user's profile.\n"
                f"Scheme: {scheme.official_name}\n"
                f"Benefits: {scheme.benefits_summary}\n"
                f"User Profile: {user_data.get('occupation')}, Category: {user_data.get('category')}, "
                f"State: {user_data.get('state')}, Income: ₹{user_data.get('annual_family_income')}\n"
                f"Eligibility Status: {eval_result.eligibility_status}\n"
                f"Satisfied Criteria: {', '.join(eval_result.criteria_satisfied)}\n"
                f"Missing Documents: {', '.join(eval_result.missing_documents)}\n"
                f"Keep it professional, encouraging, and clear without making false guarantees."
            )
            # Call Gemini REST API directly
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.AI_MODEL_NAME}:generateContent?key={settings.GEMINI_API_KEY}"
            resp = httpx.post(
                url,
                json={"contents": [{"parts": [{"text": prompt}]}]},
                timeout=8.0
            )
            if resp.status_code == 200:
                data = resp.json()
                ai_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                if ai_text:
                    return ai_text
        except Exception as e:
            logger.info("AI LLM explanation fallback triggered: %s", e)

    # Deterministic high-quality explanation fallback
    status_str = eval_result.eligibility_status
    if status_str == "likely_eligible":
        doc_msg = f" Ensure you have your {', '.join(eval_result.missing_documents[:2])} ready." if eval_result.missing_documents else " All required documents appear to be in order."
        return f"Based on your confirmed profile as a {user_data.get('occupation', 'resident')} in {user_data.get('state', 'India')}, you meet all core eligibility criteria for this scheme.{doc_msg}"
    elif status_str == "potentially_eligible":
        pending = f" Required confirmations: {eval_result.criteria_pending[0]}" if eval_result.criteria_pending else ""
        return f"You appear to meet major qualifications for {scheme.official_name}, but some conditions need verification.{pending}"
    elif status_str == "insufficient_data":
        return f"Additional profile information is required to evaluate {scheme.official_name}. Please update your education and income details."
    else:
        return f"Your current profile does not satisfy one or more mandatory conditions: {eval_result.criteria_failed[0] if eval_result.criteria_failed else 'Ineligible'}."


def run_recommendation_pipeline(user: User, db: Session) -> list[dict[str, Any]]:
    """
    Full recommendation workflow:
    1. Loads profile + confirmed document data
    2. Runs deterministic eligibility engine
    3. Ranks by relevance and score
    4. Generates explanations
    5. Saves to Recommendation table
    """
    profile = user.profile
    if not profile:
        return []

    # Compile user data dictionary
    user_data = {
        "full_name": profile.full_name or user.full_name,
        "age": profile.age,
        "gender": profile.gender,
        "state": profile.state,
        "district": profile.district,
        "residence_type": profile.residence_type,
        "education_level": profile.education_level,
        "education_status": profile.education_status,
        "course_stream": profile.course_stream,
        "occupation": profile.occupation,
        "annual_family_income": profile.annual_family_income,
        "family_size": profile.family_size,
        "is_disabled": profile.is_disabled,
        "disability_percentage": profile.disability_percentage,
        "is_farmer": profile.is_farmer,
        "landholding_acres": profile.landholding_acres,
        "category": profile.category,
        "is_minority": profile.is_minority,
        "has_domicile_certificate": profile.has_domicile_certificate,
    }

    # Fetch confirmed document types from Vault
    confirmed_docs = db.query(UploadedDocument).join(ExtractedDocumentData).filter(
        UploadedDocument.user_id == user.id,
        ExtractedDocumentData.is_confirmed == True
    ).all()
    confirmed_doc_types = {d.document_type for d in confirmed_docs}

    # Also merge confirmed extracted fields (e.g. if income was confirmed from certificate)
    for doc in confirmed_docs:
        if doc.extracted_data and doc.extracted_data.user_confirmed_fields:
            c_fields = doc.extracted_data.user_confirmed_fields
            if "income_amount" in c_fields and not user_data.get("annual_family_income"):
                user_data["annual_family_income"] = c_fields["income_amount"]
            if "category" in c_fields and not user_data.get("category"):
                user_data["category"] = c_fields["category"]

    # Retrieve all schemes
    schemes = db.query(Scheme).all()

    # Clear previous recommendations for this user
    db.query(Recommendation).filter(Recommendation.user_id == user.id).delete()

    recommendations_list = []

    for scheme in schemes:
        # Load rules
        rules_entries = db.query(SchemeEligibilityRule).filter(
            SchemeEligibilityRule.scheme_id == scheme.id
        ).all()
        
        flat_rules = []
        for r in rules_entries:
            if isinstance(r.rules_json, list):
                flat_rules.extend(r.rules_json)

        scheme_data = {
            "id": scheme.id,
            "applicable_states": scheme.applicable_states or ["All India"],
            "required_documents": scheme.required_documents or [],
            "rules": flat_rules
        }

        # Evaluate deterministic rules
        eval_result = EligibilityEngine.evaluate(
            user_data=user_data,
            scheme_data=scheme_data,
            confirmed_doc_types=confirmed_doc_types
        )

        # Generate explanation
        explanation = generate_ai_explanation(user_data, scheme, eval_result)

        # Save recommendation record
        rec_id = str(uuid.uuid4())
        rec_record = Recommendation(
            id=rec_id,
            user_id=user.id,
            scheme_id=scheme.id,
            eligibility_status=eval_result.eligibility_status,
            match_score=eval_result.match_score,
            confidence_score=eval_result.confidence_score,
            criteria_satisfied=eval_result.criteria_satisfied,
            criteria_pending=eval_result.criteria_pending,
            criteria_failed=eval_result.criteria_failed,
            missing_documents=eval_result.missing_documents,
            explanation=explanation,
            generated_at=datetime.now(timezone.utc)
        )
        db.add(rec_record)

        # Build date info
        date_rec = db.query(SchemeDateRecord).filter(
            SchemeDateRecord.scheme_id == scheme.id,
            SchemeDateRecord.is_current_cycle == True
        ).first()

        date_info = None
        if date_rec:
            d_status = compute_date_status(
                date_rec.opening_date,
                date_rec.closing_date,
                date_rec.deadline_type
            )
            date_info = {
                "opening_date": date_rec.opening_date,
                "closing_date": date_rec.closing_date,
                "deadline_type": date_rec.deadline_type,
                "is_current_cycle": date_rec.is_current_cycle,
                "status_label": d_status["status_label"],
                "days_remaining": d_status["days_remaining"]
            }

        recommendations_list.append({
            "id": rec_record.id,
            "scheme_id": scheme.id,
            "scheme_name": scheme.official_name,
            "category": scheme.category,
            "government_level": scheme.government_level,
            "benefit_summary": scheme.benefits_summary,
            "eligibility_status": eval_result.eligibility_status,
            "match_score": eval_result.match_score,
            "confidence_score": eval_result.confidence_score,
            "criteria_satisfied": eval_result.criteria_satisfied,
            "criteria_pending": eval_result.criteria_pending,
            "criteria_failed": eval_result.criteria_failed,
            "missing_documents": eval_result.missing_documents,
            "explanation": explanation,
            "official_application_url": scheme.official_application_url,
            "official_source_url": scheme.official_source_url,
            "date_info": date_info,
            "last_verified_date": scheme.last_verified_date
        })

    db.commit()

    # Sort:
    # 1. likely_eligible, then potentially_eligible, then insufficient_data, then not_eligible
    # 2. Descending match_score
    status_weights = {
        "likely_eligible": 4,
        "potentially_eligible": 3,
        "insufficient_data": 2,
        "not_eligible": 1
    }

    recommendations_list.sort(
        key=lambda x: (status_weights.get(x["eligibility_status"], 0), x["match_score"]),
        reverse=True
    )

    return recommendations_list
