import json
import logging
from datetime import date, datetime, timezone
from pathlib import Path
from sqlalchemy.orm import Session
from app.models.models import Scheme, SchemeEligibilityRule, SchemeDateRecord

logger = logging.getLogger(__name__)

def compute_date_status(opening_date: date | None, closing_date: date | None, deadline_type: str) -> dict:
    today = date.today()
    if deadline_type == "continuous":
        return {
            "status_label": "No fixed deadline published (Continuous)",
            "days_remaining": None
        }
    if deadline_type == "unannounced" or not closing_date:
        return {
            "status_label": "Deadline not announced",
            "days_remaining": None
        }
    
    if opening_date and today < opening_date:
        days_until = (opening_date - today).days
        return {
            "status_label": f"Opens soon (in {days_until} days)",
            "days_remaining": days_until
        }
    
    if today > closing_date:
        return {
            "status_label": "Closed",
            "days_remaining": 0
        }
    
    days_left = (closing_date - today).days
    if days_left <= 15:
        return {
            "status_label": f"Closing soon ({days_left} days left)",
            "days_remaining": days_left
        }
    return {
        "status_label": f"Open ({days_left} days left)",
        "days_remaining": days_left
    }


def seed_schemes_from_json(db: Session, force: bool = False) -> int:
    existing_count = db.query(Scheme).count()
    if existing_count > 0 and not force:
        logger.info("Schemes already seeded (%d existing). Skipping.", existing_count)
        return existing_count

    json_path = Path(__file__).resolve().parent.parent.parent.parent / "data" / "seed_schemes.json"
    if not json_path.exists():
        logger.error("Seed schemes file not found at %s", json_path)
        return 0

    with open(json_path, "r", encoding="utf-8") as f:
        schemes_data = json.load(f)

    loaded_count = 0
    for item in schemes_data:
        scheme_id = item["id"]
        scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
        if not scheme:
            scheme = Scheme(id=scheme_id)
            db.add(scheme)

        scheme.official_name = item["official_name"]
        scheme.short_summary = item["short_summary"]
        scheme.detailed_description = item["detailed_description"]
        scheme.benefits_summary = item["benefits_summary"]
        scheme.benefit_amount_min = item.get("benefit_amount_min")
        scheme.benefit_amount_max = item.get("benefit_amount_max")
        scheme.benefit_type = item.get("benefit_type", "financial")
        scheme.category = item["category"]
        scheme.government_level = item.get("government_level", "central")
        scheme.applicable_states = item.get("applicable_states", ["All India"])
        scheme.target_beneficiaries = item.get("target_beneficiaries", [])
        scheme.required_documents = item.get("required_documents", [])
        scheme.application_process = item["application_process"]
        scheme.official_application_url = item["official_application_url"]
        scheme.official_source_url = item["official_source_url"]
        scheme.source_authority = item["source_authority"]
        scheme.verification_status = item.get("verification_status", "verified")
        scheme.cycle_year = item.get("cycle_year", "2024-2025")
        scheme.last_verified_date = date.today()

        # Update Date records
        db.query(SchemeDateRecord).filter(SchemeDateRecord.scheme_id == scheme_id).delete()
        date_info = item.get("dates", {})
        open_d = datetime.strptime(date_info["opening_date"], "%Y-%m-%d").date() if date_info.get("opening_date") else None
        close_d = datetime.strptime(date_info["closing_date"], "%Y-%m-%d").date() if date_info.get("closing_date") else None
        
        date_rec = SchemeDateRecord(
            scheme_id=scheme_id,
            opening_date=open_d,
            closing_date=close_d,
            deadline_type=date_info.get("deadline_type", "fixed"),
            source_reference=date_info.get("source_reference"),
            is_current_cycle=True
        )
        db.add(date_rec)

        # Update Eligibility Rules
        db.query(SchemeEligibilityRule).filter(SchemeEligibilityRule.scheme_id == scheme_id).delete()
        rules = item.get("rules", [])
        if rules:
            rule_entry = SchemeEligibilityRule(
                scheme_id=scheme_id,
                rule_name=f"{item['official_name']} - Eligibility Criteria",
                description="Published official conditions",
                condition_group="mandatory",
                rules_json=rules
            )
            db.add(rule_entry)

        loaded_count += 1

    db.commit()
    logger.info("Successfully seeded %d government schemes.", loaded_count)
    return loaded_count
