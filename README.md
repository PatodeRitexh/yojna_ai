# Yojana AI — Smart Government Scheme Finder & AI-Based Recommendation Platform
> **"The Right Scheme. The Right Opportunity."**
> Government benefits, made easier to discover.

An Indian college-level Community Engagement Project (CEP) delivering a full-stack, civic-tech welfare discovery platform. Evaluates citizen eligibility using deterministic rules grounded in published Government Resolutions (GRs) and official guidelines for Central Government and Government of Maharashtra schemes.

---

## 🌟 Key Features

1. **Secure Citizen Authentication & Privacy Isolation**:
   - JWT-based authentication with bcrypt password hashing.
   - Strict owner-only authorization: Citizens cannot view or access another user's documents or profile.
   - PII Data Minimization: Full 12-digit Aadhaar and PAN numbers are automatically masked (`XXXX-XXXX-1234`).
   - Private storage: Uploaded documents are stored in unexposed server directories and never indexed or publicly accessible.

2. **Multi-Step Citizen Profile Wizard**:
   - Covers personal, educational (stream, course level, status), occupation, household income, farmer status, and social category.
   - Dynamic profile completeness score with helpful suggestions.
   - "Prefer not to say" support on sensitive fields with explicit contextual rationale.

3. **Document Vault & OCR Scanner**:
   - Supports PDF, PNG, and JPG files up to 10MB.
   - Automated text extraction (pure Python `pypdf` for documents and `PIL`/Tesseract OCR for scans).
   - Structured entity extraction: Annual income, social category, issue date, issuing authority (Tahsildar, SDO).
   - Human-in-the-Loop Confirmation: Citizens review and edit extracted values before synchronizing with their profile.
   - Status pipeline: *Uploaded → Processing → Review Required → Verified by Citizen*.

4. **Deterministic Eligibility Rules Engine**:
   - Structured JSON rule schema supporting explicit logical operators (`<=`, `>=`, `==`, `in`, `contains`).
   - Evaluates mandatory vs. optional conditions.
   - Categorizes outcomes into:
     - `Likely Eligible`: All published mandatory criteria satisfied.
     - `Potentially Eligible`: Meets profile criteria, but requires document submission or specific confirmation.
     - `Not Eligible`: Hard criteria failed (e.g. income above threshold or state residency restriction).
     - `Insufficient Data`: Critical profile fields missing.

5. **AI Recommendation Pipeline & Conversational Assistant**:
   - Ranks matching schemes by relevance score and completeness.
   - Personalized natural language explanations generated via Gemini API (when configured) or deterministic template fallback.
   - In-app **Yojana AI Assistant**: Conversational agent providing RAG retrieval over verified scheme database records with official links and clear disclaimers.

6. **Application Tracker & Saved Schemes**:
   - Citizen tracking pipeline: *Interested → Preparing Documents → Ready to Apply → Applied → Awaiting Response → Approved → Rejected*.
   - Stores user application reference numbers, submission dates, and private notes.
   - Direct links to official government application portals (e.g. MahaDBT, PM-KISAN, NSP).

7. **Administrative Portal**:
   - Protected role-based admin endpoints (`admin@yojanaai.gov.in`).
   - Scheme verification toggle (*Verified*, *Pending Verification*, *Outdated*).
   - Data quality metrics, deadline audits, and aggregate analytics without exposing personal citizen PII.

---

## 🏛️ Verified Indian Government Scheme Dataset

| Scheme Name | Level | Category | Key Eligibility | Benefit |
|-------------|-------|----------|-----------------|---------|
| **PM-KISAN** | Central | Agriculture | Landholding farmer family | ₹6,000 / year in 3 installments |
| **MahaDBT Rajarshi Shahu Maharaj (EBC)** | Maharashtra | Education | Resident of MH, Studying higher ed, Income ≤ ₹8 Lakhs | 50% tuition & exam fee reimbursement |
| **MahaDBT Post-Matric OBC Scholarship** | Maharashtra | Education | Resident of MH, OBC category, Income ≤ ₹1.5 Lakhs | 100% tuition & monthly maintenance |
| **MahaDBT Post-Matric SC Scholarship** | Maharashtra / Central | Education | SC category, Income ≤ ₹2.5 Lakhs, Studying | 100% fees + up to ₹13,500 allowance |
| **Ayushman Bharat PM-JAY** | Central | Healthcare | Low-income / SECC deprivation | ₹5,00,000 cashless hospital cover / yr |
| **Central Sector Scholarship (NSP)** | Central | Education | Regular college student, Income ≤ ₹4.5L, Age ≤ 25 | ₹12,000 to ₹20,000 / annum |
| **Pradhan Mantri Awas Yojana (PMAY-G)** | Central | Housing | Rural resident, Income ≤ ₹3 Lakhs | ₹1,20,000 to ₹1,30,000 grant |
| **IGNOAPS Senior Citizen Pension (NSAP)** | Central / State | Social Welfare | Age ≥ 60, BPL household (Income ≤ ₹1L) | Monthly DBT pension |
| **IGNDPS Disability Pension (NSAP)** | Central | Social Welfare | Age 18-59, Disability ≥ 80%, BPL | Monthly DBT pension |
| **Maharashtra Free Higher Education for Girls** | Maharashtra | Education | Female, Resident of MH, Income ≤ ₹8 Lakhs | 100% fee waiver for higher education |

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, React Router v6.
- **Backend**: Python 3.13, FastAPI, Pydantic v2, SQLAlchemy ORM, SQLite / PostgreSQL.
- **Security**: JWT (`python-jose`), bcrypt password hashing, input sanitization, file extension/MIME verification.
- **Document Processing**: `pypdf`, `Pillow`, regular expression entity parser, PII masking.
- **Testing**: `pytest`, `httpx`, FastAPI `TestClient`.

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- Node.js v18+ and npm

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run automated tests
pytest app/tests -v

# Start FastAPI backend server
python run.py
# Backend runs at http://127.0.0.1:8000
# OpenAPI Docs: http://127.0.0.1:8000/docs
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend runs at http://127.0.0.1:5173
```

---

## 🔑 Default Credentials for Evaluation

- **Administrator**:
  - Email: `admin@yojanaai.gov.in`
  - Password: `Admin@YojanaAI2026`
- **Citizen Account**:
  - Click "Register" on the top navigation bar to create a citizen account, or click "Fill Admin" on the login screen.

---

## 🧪 Automated Test Suite

Run tests anytime with:
```bash
cd backend
$env:PYTHONPATH = "."
.\venv\Scripts\pytest app/tests -v
```

**Results (10/10 Passing)**:
- `test_healthcheck`: PASSED
- `test_aadhaar_pii_masking`: PASSED (masks full Aadhaar & PAN)
- `test_entity_parser`: PASSED (extracts income, category, date, Tahsildar)
- `test_user_registration_login_and_security`: PASSED (validates JWT, profile, and cross-user 403 authorization isolation)
- `test_scheme_catalog_and_filters`: PASSED (verifies category and dates)
- `test_operators`: PASSED (checks `<=`, `>=`, `==`, `in`)
- `test_maharashtra_student_ebc_eligible`: PASSED (student with matching income qualifies)
- `test_income_above_threshold_ineligible`: PASSED (fails income limit)
- `test_missing_critical_profile_info`: PASSED (flags pending criteria)
- `test_state_restriction_fail`: PASSED (flags non-resident)

---

## 🛡️ Responsible AI & Ethical Civic-Tech Notice

*Yojana AI is an academic project designed for community welfare. It does not replace official government decision-making. No citizen is guaranteed approval; final eligibility is determined exclusively by competent government authorities.*
