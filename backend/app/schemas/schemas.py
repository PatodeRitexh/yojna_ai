from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, date
from typing import Any

# ================= AUTH SCHEMAS =================
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str
    role: str

class TokenData(BaseModel):
    user_id: str | None = None
    role: str | None = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ================= PROFILE SCHEMAS =================
class ProfileUpdate(BaseModel):
    full_name: str | None = None
    dob: date | None = None
    age: int | None = None
    gender: str | None = None
    state: str | None = "Maharashtra"
    district: str | None = None
    pin_code: str | None = None
    residence_type: str | None = "urban"
    education_level: str | None = None
    education_status: str | None = None
    course_stream: str | None = None
    occupation: str | None = None
    annual_family_income: float | None = None
    family_size: int | None = 1
    marital_status: str | None = None
    is_disabled: bool | None = False
    disability_percentage: float | None = None
    is_farmer: bool | None = False
    landholding_acres: float | None = None
    category: str | None = "general"
    is_minority: bool | None = False
    minority_community: str | None = None
    has_domicile_certificate: bool | None = False

class ProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: str | None = None
    dob: date | None = None
    age: int | None = None
    gender: str | None = None
    state: str | None = None
    district: str | None = None
    pin_code: str | None = None
    residence_type: str | None = None
    education_level: str | None = None
    education_status: str | None = None
    course_stream: str | None = None
    occupation: str | None = None
    annual_family_income: float | None = None
    family_size: int | None = 1
    marital_status: str | None = None
    is_disabled: bool | None = False
    disability_percentage: float | None = None
    is_farmer: bool | None = False
    landholding_acres: float | None = None
    category: str | None = None
    is_minority: bool | None = False
    minority_community: str | None = None
    has_domicile_certificate: bool | None = False
    updated_at: datetime | None = None

    class Config:
        from_attributes = True

class ProfileCompletionResponse(BaseModel):
    percentage: int
    completed_fields: list[str]
    missing_critical_fields: list[str]
    suggestions: list[str]


# ================= CONSENT SCHEMAS =================
class ConsentCreate(BaseModel):
    consent_type: str
    is_granted: bool = True

class ConsentResponse(BaseModel):
    id: str
    consent_type: str
    is_granted: bool
    consent_timestamp: datetime

    class Config:
        from_attributes = True


# ================= DOCUMENT SCHEMAS =================
class ExtractedDataResponse(BaseModel):
    id: str
    document_id: str
    raw_text: str | None = None
    extracted_fields: dict[str, Any] = {}
    user_confirmed_fields: dict[str, Any] = {}
    is_confirmed: bool
    confirmed_at: datetime | None = None

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: str
    original_filename: str
    file_size: int
    mime_type: str
    document_type: str
    status: str
    error_message: str | None = None
    created_at: datetime
    extracted_data: ExtractedDataResponse | None = None

    class Config:
        from_attributes = True

class ConfirmExtractedDataRequest(BaseModel):
    confirmed_fields: dict[str, Any]
    sync_to_profile: bool = True


# ================= SCHEME SCHEMAS =================
class DateRecordResponse(BaseModel):
    opening_date: date | None = None
    closing_date: date | None = None
    deadline_type: str
    is_current_cycle: bool
    status_label: str  # "Open", "Closing soon", "Opens soon", "Closed", "Deadline not announced"
    days_remaining: int | None = None

class SchemeEligibilityRuleResponse(BaseModel):
    id: str
    rule_name: str
    description: str | None = None
    condition_group: str
    rules_json: list[dict[str, Any]]

    class Config:
        from_attributes = True

class SchemeResponse(BaseModel):
    id: str
    official_name: str
    short_summary: str
    detailed_description: str
    benefits_summary: str
    benefit_amount_min: float | None = None
    benefit_amount_max: float | None = None
    benefit_type: str
    category: str
    government_level: str
    applicable_states: list[str]
    target_beneficiaries: list[str]
    required_documents: list[str]
    application_process: str
    official_application_url: str
    official_source_url: str
    source_authority: str
    verification_status: str
    last_verified_date: date
    cycle_year: str
    date_info: DateRecordResponse | None = None

    class Config:
        from_attributes = True

class SchemeCreateUpdate(BaseModel):
    id: str
    official_name: str
    short_summary: str
    detailed_description: str
    benefits_summary: str
    benefit_amount_min: float | None = None
    benefit_amount_max: float | None = None
    benefit_type: str = "financial"
    category: str
    government_level: str = "central"
    applicable_states: list[str] = ["All"]
    target_beneficiaries: list[str] = []
    required_documents: list[str] = []
    application_process: str
    official_application_url: str
    official_source_url: str
    source_authority: str
    verification_status: str = "verified"
    cycle_year: str = "2024-2025"
    opening_date: date | None = None
    closing_date: date | None = None
    deadline_type: str = "fixed"
    rules: list[dict[str, Any]] = []


# ================= RECOMMENDATION SCHEMAS =================
class RecommendationItem(BaseModel):
    id: str
    scheme_id: str
    scheme_name: str
    category: str
    government_level: str
    benefit_summary: str
    eligibility_status: str  # likely_eligible, potentially_eligible, not_eligible, insufficient_data
    match_score: float
    confidence_score: float
    criteria_satisfied: list[str]
    criteria_pending: list[str]
    criteria_failed: list[str]
    missing_documents: list[str]
    explanation: str
    official_application_url: str
    official_source_url: str
    date_info: DateRecordResponse | None = None
    last_verified_date: date | None = None

class RecommendationResponse(BaseModel):
    total_evaluated: int
    likely_eligible_count: int
    potentially_eligible_count: int
    recommendations: list[RecommendationItem]


# ================= SAVED & TRACKER SCHEMAS =================
class SavedSchemeResponse(BaseModel):
    id: str
    user_id: str
    scheme_id: str
    created_at: datetime
    scheme: SchemeResponse

    class Config:
        from_attributes = True

class ApplicationTrackerCreate(BaseModel):
    scheme_id: str
    status: str = "interested"
    applied_date: date | None = None
    reference_number: str | None = None
    notes: str | None = None

class ApplicationTrackerUpdate(BaseModel):
    status: str | None = None
    applied_date: date | None = None
    reference_number: str | None = None
    notes: str | None = None

class ApplicationTrackerResponse(BaseModel):
    id: str
    user_id: str
    scheme_id: str
    status: str
    applied_date: date | None = None
    reference_number: str | None = None
    notes: str | None = None
    portal_link: str | None = None
    updated_at: datetime
    scheme: SchemeResponse

    class Config:
        from_attributes = True


# ================= ASSISTANT SCHEMAS =================
class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    scheme_id: str | None = None

class ChatResponse(BaseModel):
    reply: str
    relevant_schemes: list[dict[str, Any]] = []
    sources: list[str] = []
    disclaimer: str
