import pytest
from app.eligibility.engine import EligibilityEngine
from app.eligibility.operators import OPERATORS

def test_operators():
    assert OPERATORS["=="]("Maharashtra", "maharashtra") is True
    assert OPERATORS["=="]("Maharashtra", "Gujarat") is False
    assert OPERATORS["<="](150000, 200000) is True
    assert OPERATORS["<="](250000, 200000) is False
    assert OPERATORS[">="](65, 60) is True
    assert OPERATORS["in"]("obc", ["obc", "sc", "st"]) is True
    assert OPERATORS["in"]("general", ["obc", "sc", "st"]) is False

def test_maharashtra_student_ebc_eligible():
    scheme_data = {
        "id": "maha-ebc-shikshan-shulkh",
        "applicable_states": ["Maharashtra"],
        "required_documents": ["Domicile Certificate", "Income Certificate"],
        "rules": [
            {"field": "state", "operator": "==", "value": "Maharashtra", "mandatory": True, "label": "State"},
            {"field": "education_status", "operator": "==", "value": "studying", "mandatory": True, "label": "Student Status"},
            {"field": "annual_family_income", "operator": "<=", "value": 800000, "mandatory": True, "label": "Income Ceiling"}
        ]
    }
    
    # Matching student
    user_data = {
        "state": "Maharashtra",
        "education_status": "studying",
        "annual_family_income": 350000,
        "occupation": "student"
    }
    
    res = EligibilityEngine.evaluate(user_data, scheme_data, confirmed_doc_types={"domicile_certificate", "income_certificate"})
    assert res.eligibility_status == "likely_eligible"
    assert res.match_score >= 90.0
    assert len(res.criteria_satisfied) >= 3
    assert len(res.criteria_failed) == 0

def test_income_above_threshold_ineligible():
    scheme_data = {
        "id": "maha-post-matric-obc",
        "applicable_states": ["Maharashtra"],
        "rules": [
            {"field": "annual_family_income", "operator": "<=", "value": 150000, "mandatory": True, "label": "Annual Income"}
        ]
    }
    
    # Income exceeds 150000
    user_data = {
        "state": "Maharashtra",
        "annual_family_income": 250000
    }
    
    res = EligibilityEngine.evaluate(user_data, scheme_data)
    assert res.eligibility_status == "not_eligible"
    assert len(res.criteria_failed) == 1
    assert "exceeds" in res.criteria_failed[0].lower() or "did not meet" in res.criteria_failed[0].lower()

def test_missing_critical_profile_info():
    scheme_data = {
        "id": "test-farmer-scheme",
        "applicable_states": ["All India"],
        "rules": [
            {"field": "is_farmer", "operator": "==", "value": True, "mandatory": True, "label": "Farmer Status"}
        ]
    }
    
    # Missing is_farmer in profile
    user_data = {
        "state": "Maharashtra"
    }
    
    res = EligibilityEngine.evaluate(user_data, scheme_data)
    assert res.eligibility_status in ["potentially_eligible", "insufficient_data"]
    assert any("Missing profile detail" in p for p in res.criteria_pending)

def test_state_restriction_fail():
    scheme_data = {
        "id": "maha-scheme",
        "applicable_states": ["Maharashtra"],
        "rules": []
    }
    
    user_data = {
        "state": "Karnataka"
    }
    
    res = EligibilityEngine.evaluate(user_data, scheme_data)
    assert res.eligibility_status == "not_eligible"
    assert any("restricted to residents of Maharashtra" in f for f in res.criteria_failed)
