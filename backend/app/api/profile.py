from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import User, UserProfile
from app.schemas.schemas import ProfileUpdate, ProfileResponse, ProfileCompletionResponse

router = APIRouter(prefix="/profile", tags=["User Profile"])

def calculate_completion(profile: UserProfile) -> dict:
    tracked_fields = [
        ("dob", "Date of Birth"),
        ("gender", "Gender"),
        ("state", "State"),
        ("district", "District"),
        ("residence_type", "Residence Type (Urban/Rural)"),
        ("education_level", "Education Level"),
        ("education_status", "Current Education Status"),
        ("occupation", "Occupation"),
        ("annual_family_income", "Annual Family Income"),
        ("category", "Social Category (General/OBC/SC/ST/EWS)")
    ]

    completed = []
    missing = []
    for field_name, label in tracked_fields:
        val = getattr(profile, field_name, None)
        if val is not None and val != "":
            completed.append(label)
        else:
            missing.append(label)

    percentage = int((len(completed) / len(tracked_fields)) * 100)
    
    suggestions = []
    if not profile.annual_family_income:
        suggestions.append("Add your annual family income to unlock income-based scholarships and subsidies.")
    if not profile.education_status or not profile.occupation:
        suggestions.append("Specify your education or occupation to see student and professional opportunities.")
    if not profile.district:
        suggestions.append("Set your district for localized municipal and district-level assistance.")

    return {
        "percentage": percentage,
        "completed_fields": completed,
        "missing_critical_fields": missing,
        "suggestions": suggestions
    }

@router.get("", response_model=ProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id, full_name=current_user.full_name)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("", response_model=ProfileResponse)
def update_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    update_data = profile_in.model_dump(exclude_unset=True)

    # Recalculate age if DOB is provided
    if "dob" in update_data and update_data["dob"]:
        today = date.today()
        dob_val = update_data["dob"]
        age = today.year - dob_val.year - ((today.month, today.day) < (dob_val.month, dob_val.day))
        update_data["age"] = max(0, age)

    for field, value in update_data.items():
        setattr(profile, field, value)

    # Sync full name to user table if provided
    if profile_in.full_name and profile_in.full_name != current_user.full_name:
        current_user.full_name = profile_in.full_name

    db.commit()
    db.refresh(profile)
    return profile

@router.get("/completion", response_model=ProfileCompletionResponse)
def get_profile_completion(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        return ProfileCompletionResponse(
            percentage=0,
            completed_fields=[],
            missing_critical_fields=["All profile fields"],
            suggestions=["Please complete your initial profile to unlock scheme matching."]
        )
    comp = calculate_completion(profile)
    return ProfileCompletionResponse(**comp)
