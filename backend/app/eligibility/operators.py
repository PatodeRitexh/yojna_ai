from typing import Any

def op_eq(actual: Any, expected: Any) -> bool:
    if actual is None:
        return False
    if isinstance(actual, str) and isinstance(expected, str):
        return actual.strip().lower() == expected.strip().lower()
    return actual == expected

def op_neq(actual: Any, expected: Any) -> bool:
    if actual is None:
        return True
    return not op_eq(actual, expected)

def op_lte(actual: Any, expected: Any) -> bool:
    if actual is None:
        return False
    try:
        return float(actual) <= float(expected)
    except (ValueError, TypeError):
        return False

def op_gte(actual: Any, expected: Any) -> bool:
    if actual is None:
        return False
    try:
        return float(actual) >= float(expected)
    except (ValueError, TypeError):
        return False

def op_lt(actual: Any, expected: Any) -> bool:
    if actual is None:
        return False
    try:
        return float(actual) < float(expected)
    except (ValueError, TypeError):
        return False

def op_gt(actual: Any, expected: Any) -> bool:
    if actual is None:
        return False
    try:
        return float(actual) > float(expected)
    except (ValueError, TypeError):
        return False

def op_in(actual: Any, expected_list: list) -> bool:
    if actual is None:
        return False
    if not isinstance(expected_list, list):
        expected_list = [expected_list]
    
    # If actual is string, do case-insensitive comparison
    if isinstance(actual, str):
        actual_clean = actual.strip().lower()
        return any(isinstance(x, str) and x.strip().lower() == actual_clean for x in expected_list)
    return actual in expected_list

def op_contains(actual_list: list, expected: Any) -> bool:
    if actual_list is None:
        return False
    if not isinstance(actual_list, list):
        return False
    if isinstance(expected, str):
        expected_clean = expected.strip().lower()
        return any(isinstance(x, str) and x.strip().lower() == expected_clean for x in actual_list)
    return expected in actual_list

def op_is_true(actual: Any, _expected: Any = None) -> bool:
    return bool(actual) is True

def op_is_false(actual: Any, _expected: Any = None) -> bool:
    return bool(actual) is False

OPERATORS = {
    "==": op_eq,
    "eq": op_eq,
    "!=": op_neq,
    "neq": op_neq,
    "<=": op_lte,
    "lte": op_lte,
    ">=": op_gte,
    "gte": op_gte,
    "<": op_lt,
    "lt": op_lt,
    ">": op_gt,
    "gt": op_gt,
    "in": op_in,
    "contains": op_contains,
    "is_true": op_is_true,
    "is_false": op_is_false,
}
