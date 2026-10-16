from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.models.models import Scheme, SchemeDateRecord, SchemeEligibilityRule
from app.schemas.schemas import SchemeResponse, DateRecordResponse
from app.scheme_ingestion.loader import compute_date_status

router = APIRouter(prefix="/schemes", tags=["Government Schemes"])

def build_scheme_response(scheme: Scheme, db: Session) -> dict:
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

    return {
        "id": scheme.id,
        "official_name": scheme.official_name,
        "short_summary": scheme.short_summary,
        "detailed_description": scheme.detailed_description,
        "benefits_summary": scheme.benefits_summary,
        "benefit_amount_min": scheme.benefit_amount_min,
        "benefit_amount_max": scheme.benefit_amount_max,
        "benefit_type": scheme.benefit_type,
        "category": scheme.category,
        "government_level": scheme.government_level,
        "applicable_states": scheme.applicable_states or [],
        "target_beneficiaries": scheme.target_beneficiaries or [],
        "required_documents": scheme.required_documents or [],
        "application_process": scheme.application_process,
        "official_application_url": scheme.official_application_url,
        "official_source_url": scheme.official_source_url,
        "source_authority": scheme.source_authority,
        "verification_status": scheme.verification_status,
        "last_verified_date": scheme.last_verified_date,
        "cycle_year": scheme.cycle_year,
        "date_info": date_info
    }

@router.get("", response_model=list[SchemeResponse])
def get_schemes(
    q: str | None = Query(None, description="Search keyword"),
    category: str | None = Query(None, description="Filter by category"),
    state: str | None = Query(None, description="Filter by state"),
    government_level: str | None = Query(None, description="central or state"),
    beneficiary: str | None = Query(None, description="Target beneficiary"),
    db: Session = Depends(get_db)
):
    query = db.query(Scheme)

    if q:
        search_filter = or_(
            Scheme.official_name.ilike(f"%{q}%"),
            Scheme.short_summary.ilike(f"%{q}%"),
            Scheme.benefits_summary.ilike(f"%{q}%"),
            Scheme.category.ilike(f"%{q}%")
        )
        query = query.filter(search_filter)

    if category and category.lower() != "all":
        query = query.filter(Scheme.category == category.lower())

    if government_level and government_level.lower() != "all":
        query = query.filter(Scheme.government_level == government_level.lower())

    schemes = query.all()

    # In-memory filtering for JSON state lists & beneficiaries
    results = []
    for s in schemes:
        if state and state.lower() != "all":
            states = [st.lower() for st in (s.applicable_states or [])]
            if "all" not in states and "all india" not in states and state.lower() not in states:
                continue
        
        if beneficiary and beneficiary.lower() != "all":
            beneficiaries = [b.lower() for b in (s.target_beneficiaries or [])]
            if beneficiary.lower() not in beneficiaries:
                continue

        results.append(build_scheme_response(s, db))

    return results

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    schemes = db.query(Scheme).all()
    cat_counts = {}
    for s in schemes:
        cat_counts[s.category] = cat_counts.get(s.category, 0) + 1
    return [{"category": k, "count": v} for k, v in cat_counts.items()]

@router.get("/filters")
def get_filter_options(db: Session = Depends(get_db)):
    return {
        "categories": [
            {"value": "education", "label": "Education & Scholarships"},
            {"value": "agriculture", "label": "Agriculture & Farmers"},
            {"value": "healthcare", "label": "Healthcare & Wellness"},
            {"value": "housing", "label": "Housing & Shelter"},
            {"value": "social_welfare", "label": "Social Welfare & Pensions"},
            {"value": "women_child", "label": "Women & Child Empowerment"},
            {"value": "employment", "label": "Employment & Skills"}
        ],
        "government_levels": [
            {"value": "all", "label": "All Levels"},
            {"value": "central", "label": "Central Government"},
            {"value": "state", "label": "State Government"}
        ],
        "states": [
            {"value": "all", "label": "All India"},
            {"value": "Maharashtra", "label": "Maharashtra"}
        ],
        "beneficiaries": [
            {"value": "all", "label": "All Beneficiaries"},
            {"value": "students", "label": "Students"},
            {"value": "farmers", "label": "Farmers"},
            {"value": "women", "label": "Women"},
            {"value": "senior_citizens", "label": "Senior Citizens"},
            {"value": "disability", "label": "Persons with Disabilities"},
            {"value": "low_income", "label": "Economically Weaker Section (EWS/BPL)"}
        ]
    }

@router.get("/{scheme_id}", response_model=SchemeResponse)
def get_scheme_detail(scheme_id: str, db: Session = Depends(get_db)):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return build_scheme_response(scheme, db)
