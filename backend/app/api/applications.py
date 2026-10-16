from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import User, ApplicationTracker, Scheme
from app.schemas.schemas import ApplicationTrackerCreate, ApplicationTrackerUpdate
from app.api.schemes import build_scheme_response

router = APIRouter(prefix="/applications", tags=["Application Tracker"])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_application_tracker(
    app_in: ApplicationTrackerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scheme = db.query(Scheme).filter(Scheme.id == app_in.scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    existing = db.query(ApplicationTracker).filter(
        ApplicationTracker.user_id == current_user.id,
        ApplicationTracker.scheme_id == app_in.scheme_id
    ).first()

    if existing:
        existing.status = app_in.status
        if app_in.applied_date:
            existing.applied_date = app_in.applied_date
        if app_in.reference_number:
            existing.reference_number = app_in.reference_number
        if app_in.notes:
            existing.notes = app_in.notes
        existing.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(existing)
        return {"message": "Application tracker updated", "id": existing.id}

    new_app = ApplicationTracker(
        user_id=current_user.id,
        scheme_id=app_in.scheme_id,
        status=app_in.status,
        applied_date=app_in.applied_date,
        reference_number=app_in.reference_number,
        notes=app_in.notes,
        portal_link=scheme.official_application_url
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return {"message": "Application tracked successfully", "id": new_app.id}

@router.get("", response_model=list[dict])
def get_user_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    apps = db.query(ApplicationTracker).filter(ApplicationTracker.user_id == current_user.id).order_by(ApplicationTracker.updated_at.desc()).all()
    results = []
    for a in apps:
        scheme_data = build_scheme_response(a.scheme, db)
        results.append({
            "id": a.id,
            "user_id": a.user_id,
            "scheme_id": a.scheme_id,
            "status": a.status,
            "applied_date": a.applied_date,
            "reference_number": a.reference_number,
            "notes": a.notes,
            "portal_link": a.portal_link,
            "updated_at": a.updated_at,
            "scheme": scheme_data
        })
    return results

@router.patch("/{tracker_id}")
def update_application_status(
    tracker_id: str,
    update_in: ApplicationTrackerUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app_record = db.query(ApplicationTracker).filter(ApplicationTracker.id == tracker_id).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application record not found")
        
    if app_record.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this application record")

    if update_in.status:
        app_record.status = update_in.status
    if update_in.applied_date is not None:
        app_record.applied_date = update_in.applied_date
    if update_in.reference_number is not None:
        app_record.reference_number = update_in.reference_number
    if update_in.notes is not None:
        app_record.notes = update_in.notes

    app_record.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(app_record)
    return {"message": "Application updated successfully"}

@router.delete("/{tracker_id}")
def delete_application_tracker(
    tracker_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app_record = db.query(ApplicationTracker).filter(ApplicationTracker.id == tracker_id).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application record not found")
        
    if app_record.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access")

    db.delete(app_record)
    db.commit()
    return {"message": "Application record removed"}
