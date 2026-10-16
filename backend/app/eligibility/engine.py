from typing import Any
from app.eligibility.operators import OPERATORS

class EligibilityEvaluationResult:
    def __init__(
        self,
        scheme_id: str,
        eligibility_status: str,  # likely_eligible, potentially_eligible, not_eligible, insufficient_data
        match_score: float,
        confidence_score: float,
        criteria_satisfied: list[str],
        criteria_pending: list[str],
        criteria_failed: list[str],
        missing_documents: list[str],
        summary_explanation: str
    ):
        self.scheme_id = scheme_id
        self.eligibility_status = eligibility_status
        self.match_score = round(match_score, 1)
        self.confidence_score = round(confidence_score, 2)
        self.criteria_satisfied = criteria_satisfied
        self.criteria_pending = criteria_pending
        self.criteria_failed = criteria_failed
        self.missing_documents = missing_documents
        self.summary_explanation = summary_explanation

    def to_dict(self) -> dict[str, Any]:
        return {
            "scheme_id": self.scheme_id,
            "eligibility_status": self.eligibility_status,
            "match_score": self.match_score,
            "confidence_score": self.confidence_score,
            "criteria_satisfied": self.criteria_satisfied,
            "criteria_pending": self.criteria_pending,
            "criteria_failed": self.criteria_failed,
            "missing_documents": self.missing_documents,
            "summary_explanation": self.summary_explanation,
        }


def format_rupees(val: float | int) -> str:
    try:
        val_int = int(val)
        s = str(val_int)
        if len(s) <= 3:
            return f"₹{s}"
        last3 = s[-3:]
        rest = s[:-3]
        groups = []
        while len(rest) > 2:
            groups.insert(0, rest[-2:])
            rest = rest[:-2]
        if rest:
            groups.insert(0, rest)
        return f"₹{','.join(groups)},{last3}"
    except Exception:
        return f"₹{val}"


class EligibilityEngine:
    """
    Deterministic rule engine that checks a user profile against structured scheme rules.
    Does not guess sensitive attributes and prioritizes confirmed data.
    """

    @staticmethod
    def evaluate(
        user_data: dict[str, Any],
        scheme_data: dict[str, Any],
        confirmed_doc_types: set[str] | None = None
    ) -> EligibilityEvaluationResult:
        if confirmed_doc_types is None:
            confirmed_doc_types = set()

        scheme_id = scheme_data.get("id", "unknown")
        rules = scheme_data.get("rules", [])
        required_docs = scheme_data.get("required_documents", [])
        applicable_states = scheme_data.get("applicable_states", ["All"])

        criteria_satisfied = []
        criteria_pending = []
        criteria_failed = []
        
        # 1. Check State Eligibility (Hard Rule)
        user_state = user_data.get("state")
        is_all_india = "All" in applicable_states or "All India" in applicable_states or not applicable_states
        if not is_all_india:
            if not user_state:
                criteria_pending.append(f"State residency required: {', '.join(applicable_states)}")
            elif user_state.strip().lower() not in [s.strip().lower() for s in applicable_states]:
                criteria_failed.append(
                    f"Scheme is restricted to residents of {', '.join(applicable_states)}. User is located in {user_state}."
                )
            else:
                criteria_satisfied.append(f"Resident of {user_state} satisfies state eligibility condition.")

        # 2. Check Structured Rules from scheme_data
        mandatory_count = 0
        satisfied_mandatory = 0

        for rule in rules:
            field = rule.get("field")
            op = rule.get("operator")
            expected_val = rule.get("value")
            is_mandatory = rule.get("mandatory", True)
            pass_msg = rule.get("reason_on_pass")
            fail_msg = rule.get("reason_on_fail")
            label = rule.get("label", field)

            if is_mandatory:
                mandatory_count += 1

            actual_val = user_data.get(field)
            
            # If user has not provided this data
            if actual_val is None or actual_val == "":
                if is_mandatory:
                    criteria_pending.append(
                        f"Missing profile detail: '{label}' is required to confirm full eligibility."
                    )
                else:
                    criteria_pending.append(f"Optional field '{label}' not specified.")
                continue

            # Evaluate operator
            eval_fn = OPERATORS.get(op)
            if not eval_fn:
                # Unknown operator, mark as pending manual check
                criteria_pending.append(f"Operator {op} for '{label}' requires manual verification.")
                continue

            passed = eval_fn(actual_val, expected_val)

            if passed:
                if is_mandatory:
                    satisfied_mandatory += 1
                msg = pass_msg or f"{label} criteria satisfied (value: {actual_val})."
                criteria_satisfied.append(msg)
            else:
                if is_mandatory:
                    msg = fail_msg or f"Did not meet {label} criteria (actual: {actual_val}, required: {op} {expected_val})."
                    criteria_failed.append(msg)
                else:
                    criteria_pending.append(f"Did not meet non-mandatory condition: {label}.")

        # 3. Check Required Documents
        missing_docs = []
        for doc in required_docs:
            doc_key = doc.lower().replace(" ", "_").replace("-", "_")
            # Check if any confirmed document matches the doc
            found = False
            for c_doc in confirmed_doc_types:
                if c_doc.lower() in doc_key or doc_key in c_doc.lower():
                    found = True
                    break
            if not found:
                missing_docs.append(doc)

        # 4. Determine Overall Eligibility Status & Match Score
        # Status logic:
        # If any mandatory criteria failed -> not_eligible
        # Else if missing core profile info -> insufficient_data or potentially_eligible
        # Else if all mandatory passed and no missing docs -> likely_eligible
        # Else if mandatory passed but missing documents or pending optional -> potentially_eligible

        total_rules = len(rules) + (0 if is_all_india else 1)
        total_satisfied = len(criteria_satisfied)

        if criteria_failed:
            status = "not_eligible"
            match_score = max(5.0, (total_satisfied / max(1, total_rules)) * 30.0)
            confidence = 0.95
            summary = f"Not eligible due to {len(criteria_failed)} mandatory condition(s) not being met."
        elif not criteria_satisfied and criteria_pending:
            status = "insufficient_data"
            match_score = 30.0
            confidence = 0.50
            summary = "Insufficient profile information to determine eligibility. Please update your profile."
        elif criteria_pending:
            status = "potentially_eligible"
            # Calculate match score based on what is satisfied vs pending
            score_ratio = total_satisfied / max(1, (total_satisfied + len(criteria_pending)))
            match_score = 50.0 + (score_ratio * 35.0)
            if missing_docs:
                match_score -= min(15.0, len(missing_docs) * 3.0)
            match_score = max(40.0, min(89.0, match_score))
            confidence = 0.75
            summary = f"Potentially eligible based on current profile details. {len(criteria_pending)} item(s) require verification or document submission."
        else:
            status = "likely_eligible"
            match_score = 90.0 + min(10.0, 10.0 if not missing_docs else 5.0)
            confidence = 0.95
            summary = "Likely eligible! All published mandatory criteria in your profile match this scheme."

        return EligibilityEvaluationResult(
            scheme_id=scheme_id,
            eligibility_status=status,
            match_score=match_score,
            confidence_score=confidence,
            criteria_satisfied=criteria_satisfied,
            criteria_pending=criteria_pending,
            criteria_failed=criteria_failed,
            missing_documents=missing_docs,
            summary_explanation=summary
        )
