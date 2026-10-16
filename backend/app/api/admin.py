from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_admin
from app.models.models import (
    User, Scheme, SchemeEligibilityRule, SchemeDateRecord,
    Recommendation, ApplicationTracker, AdminAuditLog
)
from app.schemas.schemas import SchemeCreateUpdate

router = APIRouter(prefix="/admin", tags=["Administrative Portal"])

@router.post("/schemes", status_code=status.HTTP_201_CREATED)
def create_scheme(
    scheme_in: SchemeCreateUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Scheme).filter(Scheme.id == scheme_in.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Scheme with this ID already exists")

    scheme = Scheme(
        id=scheme_in.id,
        official_name=scheme_in.official_name,
        short_summary=scheme_in.short_summary,
        detailed_description=scheme_in.detailed_description,
        benefits_summary=scheme_in.benefits_summary,
        benefit_amount_min=scheme_in.benefit_amount_min,
        benefit_amount_max=scheme_in.benefit_amount_max,
        benefit_type=scheme_in.benefit_type,
        category=scheme_in.category,
        government_level=scheme_in.government_level,
        applicable_states=scheme_in.applicable_states,
        target_beneficiaries=scheme_in.target_beneficiaries,
        required_documents=scheme_in.required_documents,
        application_process=scheme_in.application_process,
        official_application_url=scheme_in.official_application_url,
        official_source_url=scheme_in.official_source_url,
        source_authority=scheme_in.source_authority,
        verification_status=scheme_in.verification_status,
        last_verified_date=date.today(),
        cycle_year=scheme_in.cycle_year
    )
    db.add(scheme)

    # Date record
    date_rec = SchemeDateRecord(
        scheme_id=scheme_in.id,
        opening_date=scheme_in.opening_date,
        closing_date=scheme_in.closing_date,
        deadline_type=scheme_in.deadline_type,
        is_current_cycle=True
    )
    db.add(date_rec)

    # Eligibility rules
    if scheme_in.rules:
        rule_entry = SchemeEligibilityRule(
            scheme_id=scheme_in.id,
            rule_name=f"{scheme_in.official_name} - Eligibility Rules",
            condition_group="mandatory",
            rules_json=scheme_in.rules
        )
        db.add(rule_entry)

    # Audit log
    audit = AdminAuditLog(
        admin_id=admin.id,
        action="CREATE_SCHEME",
        target_type="Scheme",
        target_id=scheme.id,
        details={"name": scheme.official_name}
    )
    db.add(audit)

    db.commit()
    db.refresh(scheme)
    return {"message": "Scheme created successfully", "id": scheme.id}


@router.put("/schemes/{scheme_id}")
def update_scheme(
    scheme_id: str,
    scheme_in: SchemeCreateUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    scheme.official_name = scheme_in.official_name
    scheme.short_summary = scheme_in.short_summary
    scheme.detailed_description = scheme_in.detailed_description
    scheme.benefits_summary = scheme_in.benefits_summary
    scheme.benefit_amount_min = scheme_in.benefit_amount_min
    scheme.benefit_amount_max = scheme_in.benefit_amount_max
    scheme.benefit_type = scheme_in.benefit_type
    scheme.category = scheme_in.category
    scheme.government_level = scheme_in.government_level
    scheme.applicable_states = scheme_in.applicable_states
    scheme.target_beneficiaries = scheme_in.target_beneficiaries
    scheme.required_documents = scheme_in.required_documents
    scheme.application_process = scheme_in.application_process
    scheme.official_application_url = scheme_in.official_application_url
    scheme.official_source_url = scheme_in.official_source_url
    scheme.source_authority = scheme_in.source_authority
    scheme.verification_status = scheme_in.verification_status
    scheme.last_verified_date = date.today()
    scheme.cycle_year = scheme_in.cycle_year

    # Update date
    date_rec = db.query(SchemeDateRecord).filter(
        SchemeDateRecord.scheme_id == scheme_id,
        SchemeDateRecord.is_current_cycle == True
    ).first()
    if not date_rec:
        date_rec = SchemeDateRecord(scheme_id=scheme_id, is_current_cycle=True)
        db.add(date_rec)
    
    date_rec.opening_date = scheme_in.opening_date
    date_rec.closing_date = scheme_in.closing_date
    date_rec.deadline_type = scheme_in.deadline_type
    date_rec.verification_timestamp = datetime.now(timezone.utc)

    # Audit log
    audit = AdminAuditLog(
        admin_id=admin.id,
        action="UPDATE_SCHEME",
        target_type="Scheme",
        target_id=scheme.id,
        details={"name": scheme.official_name}
    )
    db.add(audit)

    db.commit()
    return {"message": "Scheme updated successfully"}


@router.post("/schemes/{scheme_id}/verify")
def toggle_scheme_verification(
    scheme_id: str,
    status_label: str = "verified",  # verified, pending_verification, outdated
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    scheme.verification_status = status_label
    scheme.last_verified_date = date.today()

    audit = AdminAuditLog(
        admin_id=admin.id,
        action="VERIFY_SCHEME",
        target_type="Scheme",
        target_id=scheme.id,
        details={"status": status_label}
    )
    db.add(audit)
    db.commit()

    return {"message": f"Scheme status updated to {status_label}", "verification_date": str(date.today())}


@router.get("/data-quality")
def get_data_quality_report(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    schemes = db.query(Scheme).all()
    verified_count = sum(1 for s in schemes if s.verification_status == "verified")
    pending_count = sum(1 for s in schemes if s.verification_status == "pending_verification")
    outdated_count = sum(1 for s in schemes if s.verification_status == "outdated")

    date_records = db.query(SchemeDateRecord).filter(SchemeDateRecord.is_current_cycle == True).all()
    unannounced_deadlines = sum(1 for d in date_records if d.deadline_type == "unannounced" or not d.closing_date)
    fixed_deadlines = sum(1 for d in date_records if d.deadline_type == "fixed")

    return {
        "total_schemes": len(schemes),
        "verified_schemes": verified_count,
        "pending_verification": pending_count,
        "outdated_schemes": outdated_count,
        "fixed_deadlines_count": fixed_deadlines,
        "unannounced_deadlines_count": unannounced_deadlines,
        "data_freshness_rate": f"{(verified_count / max(1, len(schemes))) * 100:.1f}%",
        "last_audited": str(date.today())
    }


@router.get("/stats")
def get_aggregate_stats(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user_count = db.query(User).count()
    scheme_count = db.query(Scheme).count()
    rec_count = db.query(Recommendation).count()
    app_count = db.query(ApplicationTracker).count()

    # Aggregate status counts
    app_status_counts = {}
    apps = db.query(ApplicationTracker).all()
    for a in apps:
        app_status_counts[a.status] = app_status_counts.get(a.status, 0) + 1

    return {
        "total_registered_users": user_count,
        "total_schemes_published": scheme_count,
        "total_recommendations_computed": rec_count,
        "total_applications_tracked": app_count,
        "application_pipeline_summary": app_status_counts
    }
