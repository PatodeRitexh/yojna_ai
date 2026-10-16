import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine, SessionLocal
from app.scheme_ingestion.loader import seed_schemes_from_json
from app.document_processing.extractor import mask_sensitive_data, parse_structured_entities

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_schemes_from_json(db, force=False)
    finally:
        db.close()

def test_healthcheck():
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

def test_aadhaar_pii_masking():
    raw_text = "Applicant Aadhaar Number: 4321 8765 1234, PAN: ABCDE1234F"
    masked = mask_sensitive_data(raw_text)
    assert "4321 8765 1234" not in masked
    assert "XXXX-XXXX-1234" in masked
    assert "XXXXX1234X" in masked

def test_entity_parser():
    sample_text = (
        "GOVERNMENT OF MAHARASHTRA\n"
        "Office of the Tahsildar, Pune\n"
        "INCOME CERTIFICATE\n"
        "This is to certify that annual income of Ramesh Patil is Rs. 1,40,000/-\n"
        "Category: OBC\n"
        "Date of Issue: 15/04/2024\n"
    )
    entities = parse_structured_entities(sample_text, "income_certificate")
    assert entities.get("income_amount") == 140000.0
    assert entities.get("category") == "obc"
    assert entities.get("issuing_authority") == "Tahsildar"
    assert entities.get("issue_date") == "2024-04-15"

def test_user_registration_login_and_security():
    with TestClient(app) as client:
        # 1. Register User 1
        u1_email = "student1@test.com"
        reg_resp = client.post("/api/auth/register", json={
            "email": u1_email,
            "password": "Password123!",
            "full_name": "Rohan Deshmukh"
        })
        if reg_resp.status_code == 201:
            token1 = reg_resp.json()["access_token"]
        else:
            login_resp = client.post("/api/auth/login", json={"email": u1_email, "password": "Password123!"})
            token1 = login_resp.json()["access_token"]

        headers1 = {"Authorization": f"Bearer {token1}"}

        # 2. Update Profile for User 1
        prof_resp = client.put("/api/profile", headers=headers1, json={
            "state": "Maharashtra",
            "district": "Pune",
            "education_level": "undergraduate",
            "education_status": "studying",
            "course_stream": "Engineering",
            "occupation": "student",
            "annual_family_income": 120000,
            "category": "obc"
        })
        assert prof_resp.status_code == 200
        assert prof_resp.json()["occupation"] == "student"

        # 3. Check profile completion
        comp_resp = client.get("/api/profile/completion", headers=headers1)
        assert comp_resp.status_code == 200
        assert comp_resp.json()["percentage"] > 50

        # 4. Generate recommendations
        rec_resp = client.post("/api/recommendations/generate", headers=headers1)
        assert rec_resp.status_code == 200
        data = rec_resp.json()
        assert data["total_evaluated"] > 0
        assert data["likely_eligible_count"] >= 1

        # 5. Register User 2 to test Cross-User Document Authorization Isolation
        u2_email = "citizen2@test.com"
        reg2 = client.post("/api/auth/register", json={
            "email": u2_email,
            "password": "Password123!",
            "full_name": "Priya Sharma"
        })
        if reg2.status_code == 201:
            token2 = reg2.json()["access_token"]
        else:
            token2 = client.post("/api/auth/login", json={"email": u2_email, "password": "Password123!"}).json()["access_token"]

        headers2 = {"Authorization": f"Bearer {token2}"}

        # User 1 uploads a mock document
        files = {"file": ("test_cert.pdf", b"%PDF-1.4 mock content Annual Income: Rs. 150000", "application/pdf")}
        upload_resp = client.post("/api/documents/upload", headers=headers1, files=files, data={"document_type": "income_certificate"})
        assert upload_resp.status_code == 201
        doc_id = upload_resp.json()["id"]

        # User 2 attempts to access User 1's private document -> MUST RETURN 403 FORBIDDEN
        forbidden_resp = client.get(f"/api/documents/{doc_id}/status", headers=headers2)
        assert forbidden_resp.status_code == 403
        assert "Unauthorized" in forbidden_resp.json()["detail"]

        # User 2 attempts to confirm User 1's document -> MUST RETURN 403 FORBIDDEN
        forbidden_confirm = client.post(f"/api/documents/{doc_id}/confirm-extracted-data", headers=headers2, json={"confirmed_fields": {}})
        assert forbidden_confirm.status_code == 403

        # Clean up User 1's document
        del_resp = client.delete(f"/api/documents/{doc_id}", headers=headers1)
        assert del_resp.status_code == 200

def test_scheme_catalog_and_filters():
    with TestClient(app) as client:
        resp = client.get("/api/schemes")
        assert resp.status_code == 200
        schemes = resp.json()
        assert len(schemes) >= 5

        # Check that PM-KISAN exists with valid dates
        pm_kisan = next((s for s in schemes if s["id"] == "pm-kisan"), None)
        assert pm_kisan is not None
        assert pm_kisan["date_info"] is not None
        assert "Continuous" in pm_kisan["date_info"]["status_label"]

        # Filter by category=education
        edu_resp = client.get("/api/schemes?category=education")
        assert edu_resp.status_code == 200
        for s in edu_resp.json():
            assert s["category"] == "education"

def test_production_security_validation():
    from app.core.config import Settings
    
    # In production without a 32+ char key, Settings must raise ValueError
    with pytest.raises(ValueError) as excinfo:
        Settings(ENVIRONMENT="production", SECRET_KEY="short-key")
    assert "SECRET_KEY of at least 32 characters" in str(excinfo.value)

    # In production with a valid strong key, Settings validates
    valid_settings = Settings(
        ENVIRONMENT="production",
        SECRET_KEY="a" * 32,
        ADMIN_DEFAULT_PASSWORD="SecurePassword123!"
    )
    assert valid_settings.SECRET_KEY == "a" * 32

def test_cors_configuration_no_wildcard_with_credentials():
    from app.main import build_cors_origins
    
    origins = build_cors_origins()
    assert "*" not in origins
    assert "http://localhost:5173" in origins
    assert "http://127.0.0.1:5173" in origins
