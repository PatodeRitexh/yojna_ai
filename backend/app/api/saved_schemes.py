from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import User, SavedScheme, Scheme
from app.schemas.schemas import SavedSchemeResponse
from app.api.schemes import build_scheme_response

router = APIRouter(prefix="/saved-schemes", tags=["Saved Schemes"])

@router.post("/{scheme_id}", status_code=status.HTTP_201_CREATED)
def save_scheme(
    scheme_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
        
    existing = db.query(SavedScheme).filter(
        SavedScheme.user_id == current_user.id,
        SavedScheme.scheme_id == scheme_id
    ).first()
    if existing:
        return {"message": "Scheme already saved", "id": existing.id}

    saved = SavedScheme(user_id=current_user.id, scheme_id=scheme_id)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return {"message": "Scheme saved successfully", "id": saved.id}

@router.get("", response_model=list[dict])
def get_saved_schemes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved_items = db.query(SavedScheme).filter(SavedScheme.user_id == current_user.id).all()
    results = []
    for item in saved_items:
        scheme_data = build_scheme_response(item.scheme, db)
        results.append({
            "id": item.id,
            "user_id": item.user_id,
            "scheme_id": item.scheme_id,
            "created_at": item.created_at,
            "scheme": scheme_data
        })
    return results

@router.delete("/{scheme_id}")
def unsave_scheme(
    scheme_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved = db.query(SavedScheme).filter(
        SavedScheme.user_id == current_user.id,
        SavedScheme.scheme_id == scheme_id
    ).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Saved scheme record not found")
        
    db.delete(saved)
    db.commit()
    return {"message": "Scheme removed from saved list"}
