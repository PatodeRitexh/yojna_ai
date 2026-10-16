from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import User, Recommendation
from app.recommendations.engine import run_recommendation_pipeline
from app.schemas.schemas import RecommendationResponse, RecommendationItem

router = APIRouter(prefix="/recommendations", tags=["AI Scheme Recommendations"])

@router.post("/generate", response_model=RecommendationResponse)
def generate_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recs = run_recommendation_pipeline(current_user, db)
    
    likely_count = sum(1 for r in recs if r["eligibility_status"] == "likely_eligible")
    potential_count = sum(1 for r in recs if r["eligibility_status"] == "potentially_eligible")
    
    return {
        "total_evaluated": len(recs),
        "likely_eligible_count": likely_count,
        "potentially_eligible_count": potential_count,
        "recommendations": recs
    }

@router.get("", response_model=RecommendationResponse)
def get_user_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if recommendations already exist
    existing = db.query(Recommendation).filter(Recommendation.user_id == current_user.id).first()
    if not existing:
        # Run pipeline if first time
        return generate_recommendations(current_user, db)
    
    # Otherwise run to ensure up to date with any profile/doc edits
    return generate_recommendations(current_user, db)
