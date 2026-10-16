import re
import os
import logging
from pathlib import Path
from pypdf import PdfReader
from PIL import Image

logger = logging.getLogger(__name__)

# Sensitive pattern masking (Aadhaar, Account numbers)
AADHAAR_REGEX = re.compile(r'\b\d{4}\s?\d{4}\s?(\d{4})\b')
PAN_REGEX = re.compile(r'\b[A-Z]{5}(\d{4})[A-Z]\b')

def mask_sensitive_data(text: str) -> str:
    """Masks full Aadhaar and PAN numbers to protect citizen privacy."""
    # Mask 12-digit Aadhaar to XXXX-XXXX-1234
    text = AADHAAR_REGEX.sub(r'XXXX-XXXX-\1', text)
    # Mask PAN to XXXXX1234X
    text = PAN_REGEX.sub(r'XXXXX\1X', text)
    return text


def extract_text_from_pdf(file_path: str) -> str:
    extracted_text = []
    try:
        reader = PdfReader(file_path)
        for page in reader.pages:
            t = page.extract_text()
            if t:
                extracted_text.append(t)
    except Exception as e:
        logger.warning("Error reading PDF %s: %s", file_path, e)
    return "\n".join(extracted_text)


def extract_text_from_image(file_path: str) -> str:
    # Try pytesseract if available on system
    try:
        import pytesseract
        img = Image.open(file_path)
        text = pytesseract.image_to_string(img)
        return text
    except Exception as e:
        logger.info("OCR engine not available or failed for %s: %s. Continuing with metadata extraction.", file_path, e)
        return ""


def parse_structured_entities(text: str, document_type: str) -> dict:
    """
    Parses structured government certificate entities from extracted text
    (e.g., annual income, category, issue dates, issuing authority).
    """
    fields = {}
    if not text:
        return fields

    # 1. Income detection
    # Matches: "Annual Income: Rs. 1,20,000", "Income: ₹ 80,000", "annual income of Ramesh Patil is Rs. 1,40,000/-"
    income_match = re.search(
        r'(?:annual\s+income|family\s+income|income|वार्षिक\s+उत्पन्न|उत्पन्न)[^0-9\n\r]*?(?:rs\.?|₹|inr)?\s*([0-9]{1,2}(?:,[0-9]{2,3})+(?:\.[0-9]{2})?|[0-9]{4,7})',
        text,
        re.IGNORECASE
    )
    if income_match:
        raw_val = income_match.group(1).replace(",", "")
        try:
            val = float(raw_val)
            if 1000 <= val <= 10000000:
                fields["income_amount"] = val
        except ValueError:
            pass

    # 2. Category / Caste detection
    for cat in ["SC", "ST", "OBC", "EWS", "VJNT", "SBC", "OPEN", "GENERAL"]:
        if re.search(r'\b' + cat + r'\b', text, re.IGNORECASE):
            fields["category"] = cat.lower() if cat.lower() != "open" else "general"
            break

    # 3. Date detection (DD/MM/YYYY or YYYY-MM-DD)
    date_match = re.search(r'\b(0[1-9]|[12][0-9]|3[01])[-/.](0[1-9]|1[012])[-/.](20[12][0-9])\b', text)
    if date_match:
        d, m, y = date_match.groups()
        fields["issue_date"] = f"{y}-{m}-{d}"
    else:
        iso_match = re.search(r'\b(20[12][0-9])[-/.](0[1-9]|1[012])[-/.](0[1-9]|[12][0-9]|3[01])\b', text)
        if iso_match:
            y, m, d = iso_match.groups()
            fields["issue_date"] = f"{y}-{m}-{d}"

    # 4. Issuing Authority detection
    authorities = [
        "Tahsildar", "Tahasildar", "Sub-Divisional Officer", "Collector",
        "Competent Authority", "Executive Magistrate", "Principal", "Dean", "Registrar"
    ]
    for auth in authorities:
        if auth.lower() in text.lower():
            fields["issuing_authority"] = auth
            break

    # 5. Domicile confirmation
    if "domicile" in text.lower() or "resident of maharashtra" in text.lower() or "महाराष्ट्र शासन" in text:
        fields["state"] = "Maharashtra"

    return fields


def process_document_file(file_path: str, mime_type: str, document_type: str) -> tuple[str, dict]:
    """
    Main extraction pipeline:
    Extracts text, masks PII, and parses structured fields.
    """
    raw_text = ""
    if "pdf" in mime_type:
        raw_text = extract_text_from_pdf(file_path)
    elif "image" in mime_type:
        raw_text = extract_text_from_image(file_path)
    
    # Clean and mask text
    sanitized_text = mask_sensitive_data(raw_text)
    structured_fields = parse_structured_entities(sanitized_text, document_type)
    
    return sanitized_text, structured_fields
