import uuid
from datetime import datetime, timezone, date
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, ForeignKey,
    DateTime, Date, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="user", nullable=False)  # "user", "admin"
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    consents = relationship("UserConsent", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("UploadedDocument", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    saved_schemes = relationship("SavedScheme", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("ApplicationTracker", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Personal
    full_name = Column(String(255), nullable=True)
    dob = Column(Date, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(50), nullable=True)  # male, female, other, prefer_not_to_say
    
    # Location
    state = Column(String(100), default="Maharashtra", nullable=True)
    district = Column(String(100), nullable=True)
    pin_code = Column(String(10), nullable=True)
    residence_type = Column(String(50), default="urban", nullable=True)  # rural, urban, semi_urban
    
    # Education
    education_level = Column(String(100), nullable=True)  # below_10th, 10th_pass, 12th_pass, undergraduate, postgraduate, diploma, doctorate, other
    education_status = Column(String(50), nullable=True)  # studying, completed, dropout, never_enrolled
    course_stream = Column(String(100), nullable=True)  # Engineering, Medicine, Arts, Commerce, Science, etc.
    
    # Occupation & Financial
    occupation = Column(String(100), nullable=True)  # student, farmer, agricultural_laborer, salaried, self_employed, unemployed, etc.
    annual_family_income = Column(Float, nullable=True)  # in INR
    family_size = Column(Integer, default=1, nullable=True)
    marital_status = Column(String(50), nullable=True)  # single, married, widowed, divorced, prefer_not_to_say
    
    # Special criteria
    is_disabled = Column(Boolean, default=False, nullable=True)
    disability_percentage = Column(Float, nullable=True)
    is_farmer = Column(Boolean, default=False, nullable=True)
    landholding_acres = Column(Float, nullable=True)
    
    # Category / Caste (explicit declaration)
    category = Column(String(50), default="general", nullable=True)  # general, obc, sc, st, ews, vjnt, sbc, other
    is_minority = Column(Boolean, default=False, nullable=True)
    minority_community = Column(String(100), nullable=True)  # Muslim, Christian, Sikh, Buddhist, Jain, Parsi
    has_domicile_certificate = Column(Boolean, default=False, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="profile")


class UserConsent(Base):
    __tablename__ = "user_consents"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    consent_type = Column(String(100), nullable=False)  # "document_processing", "profile_analysis", "notifications"
    is_granted = Column(Boolean, default=True, nullable=False)
    consent_timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    ip_address = Column(String(45), nullable=True)
    
    user = relationship("User", back_populates="consents")


class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"
    
    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    document_type = Column(String(100), nullable=False)  # income_certificate, caste_certificate, domicile_certificate, marksheet, etc.
    status = Column(String(50), default="uploaded", nullable=False)  # uploaded, processing, review_required, verified_by_user, failed
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="documents")
    extracted_data = relationship("ExtractedDocumentData", back_populates="document", uselist=False, cascade="all, delete-orphan")


class ExtractedDocumentData(Base):
    __tablename__ = "extracted_document_data"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("uploaded_documents.id", ondelete="CASCADE"), unique=True, nullable=False)
    raw_text = Column(Text, nullable=True)  # sanitized / redacted text
    extracted_fields = Column(JSON, default=dict)  # extracted fields e.g. {"income_amount": 120000, "applicant_name": "..."}
    user_confirmed_fields = Column(JSON, default=dict)  # fields confirmed or edited by user
    is_confirmed = Column(Boolean, default=False, nullable=False)
    confirmed_at = Column(DateTime, nullable=True)
    
    document = relationship("UploadedDocument", back_populates="extracted_data")


class Scheme(Base):
    __tablename__ = "schemes"
    
    id = Column(String(100), primary_key=True, index=True)  # slug or clean ID
    official_name = Column(String(300), nullable=False, index=True)
    short_summary = Column(Text, nullable=False)
    detailed_description = Column(Text, nullable=False)
    benefits_summary = Column(Text, nullable=False)
    benefit_amount_min = Column(Float, nullable=True)
    benefit_amount_max = Column(Float, nullable=True)
    benefit_type = Column(String(50), default="financial")  # financial, scholarship, insurance, subsidy, pension, housing
    category = Column(String(100), nullable=False, index=True)  # education, agriculture, healthcare, housing, social_welfare, women_child, employment
    government_level = Column(String(50), default="central", nullable=False)  # central, state
    applicable_states = Column(JSON, default=list)  # ["Maharashtra"] or ["All"]
    target_beneficiaries = Column(JSON, default=list)  # ["students", "farmers", "women", "sc_st", "bpl"]
    required_documents = Column(JSON, default=list)
    application_process = Column(Text, nullable=False)
    official_application_url = Column(String(500), nullable=False)
    official_source_url = Column(String(500), nullable=False)
    source_authority = Column(String(300), nullable=False)
    verification_status = Column(String(50), default="verified", nullable=False)  # verified, pending_verification, outdated
    last_verified_date = Column(Date, nullable=False, default=date.today)
    cycle_year = Column(String(50), default="2024-2025")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    eligibility_rules = relationship("SchemeEligibilityRule", back_populates="scheme", cascade="all, delete-orphan")
    date_records = relationship("SchemeDateRecord", back_populates="scheme", cascade="all, delete-orphan")


class SchemeEligibilityRule(Base):
    __tablename__ = "scheme_eligibility_rules"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    scheme_id = Column(String(100), ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    condition_group = Column(String(50), default="mandatory", nullable=False)  # mandatory, optional
    rules_json = Column(JSON, nullable=False)  # list of condition objects with field, op, value, etc.
    
    scheme = relationship("Scheme", back_populates="eligibility_rules")


class SchemeDateRecord(Base):
    __tablename__ = "scheme_date_records"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    scheme_id = Column(String(100), ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    opening_date = Column(Date, nullable=True)
    closing_date = Column(Date, nullable=True)
    deadline_type = Column(String(50), default="fixed", nullable=False)  # fixed, unannounced, continuous, cycle_based
    source_reference = Column(String(500), nullable=True)
    is_current_cycle = Column(Boolean, default=True, nullable=False)
    verification_timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    scheme = relationship("Scheme", back_populates="date_records")


class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scheme_id = Column(String(100), ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    eligibility_status = Column(String(50), nullable=False)  # likely_eligible, potentially_eligible, not_eligible, insufficient_data
    match_score = Column(Float, default=0.0, nullable=False)
    criteria_satisfied = Column(JSON, default=list)
    criteria_pending = Column(JSON, default=list)
    criteria_failed = Column(JSON, default=list)
    missing_documents = Column(JSON, default=list)
    explanation = Column(Text, nullable=False)
    confidence_score = Column(Float, default=1.0)
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="recommendations")
    scheme = relationship("Scheme")


class SavedScheme(Base):
    __tablename__ = "saved_schemes"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scheme_id = Column(String(100), ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="saved_schemes")
    scheme = relationship("Scheme")


class ApplicationTracker(Base):
    __tablename__ = "application_trackers"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scheme_id = Column(String(100), ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="interested", nullable=False)
    # interested, preparing_documents, ready_to_apply, applied, awaiting_response, approved, rejected, closed_or_expired
    applied_date = Column(Date, nullable=True)
    reference_number = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    portal_link = Column(String(500), nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="applications")
    scheme = relationship("Scheme")


class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    admin_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    target_type = Column(String(100), nullable=False)
    target_id = Column(String(100), nullable=False)
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
