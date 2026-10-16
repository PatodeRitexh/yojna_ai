# Yojana AI — Smart Government Scheme Finder

**The Right Scheme. The Right Opportunity.**

Yojana AI is a full-stack civic-tech platform developed as a Community Engagement Project (CEP). It helps citizens discover relevant Indian government schemes through profile-based eligibility evaluation, personalized recommendations, and a centralized scheme explorer.

> **Disclaimer:** Yojana AI is an academic project. Its recommendations are informational and do not guarantee eligibility or approval. Always verify scheme details and eligibility requirements through official government portals.

## Features

- **Citizen Authentication:** JWT-based authentication and password hashing.
- **Citizen Profile Wizard:** Personal, educational, financial, and eligibility-related profile information.
- **Document Vault:** PDF and image uploads with text extraction, OCR support, and citizen review of extracted information.
- **Eligibility Engine:** Rule-based evaluation of mandatory and optional scheme criteria.
- **Personalized Recommendations:** Likely Eligible, Potentially Eligible, Not Eligible, and Insufficient Data outcomes.
- **AI Scheme Assistant:** Retrieval-based assistance with natural-language responses and fallback guidance.
- **Scheme Explorer:** Browse and filter schemes by category, beneficiary, and government level.
- **Application Tracker:** Track applications and save personal notes and reference numbers.
- **Administrative Portal:** Scheme verification controls and data-quality metrics.

## Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide Icons

### Backend
- Python
- FastAPI
- Pydantic
- SQLAlchemy
- SQLite for local development, with PostgreSQL support where configured
- JWT authentication

### Document Processing and Testing
- pypdf
- Pillow
- Tesseract OCR, where configured
- pytest
- HTTPX

## Government Scheme Categories

The platform is designed to help citizens explore schemes related to:

- Education and scholarships
- Agriculture and farmers
- Healthcare
- Housing
- Social welfare

Example schemes include PM-KISAN, MahaDBT scholarships, Ayushman Bharat PM-JAY, National Scholarship Portal schemes, and Pradhan Mantri Awas Yojana.

**Note:** Eligibility criteria, benefits, deadlines, and scheme availability may change. Verify information using the relevant official government portal before applying.

## Project Structure

```text
cep/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── ...
├── .github/
│   └── workflows/
├── .gitignore
├── README.md
└── render.yaml
```

*The exact structure may differ depending on the current project configuration.*

## Prerequisites

- Python 3.10 or later
- Node.js 18 or later
- npm
- Git

Some document-scanning features may require additional system dependencies, such as Tesseract OCR.

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/PatodeRitexh/yojna_ai.git
cd yojna_ai
```

### 2. Start the backend

Open a terminal:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py
```

If PowerShell activation is unavailable, use the virtual environment's Python executable directly.

Backend API: `http://127.0.0.1:8000`

API documentation: `http://127.0.0.1:8000/docs`

### 3. Start the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend: `http://127.0.0.1:5173`

### 4. Configure the API URL

Configure the frontend's API base URL using the environment variable supported by the project:

`VITE_API_BASE_URL`

For local development, use the appropriate local backend API URL. For deployment, configure it with the public backend URL.

Never commit real API keys, passwords, or other secrets.

## Testing

Run the backend tests from the backend directory:

```powershell
$env:PYTHONPATH = "."
pytest app/tests -v
```

The project includes tests for API health, authentication, privacy protections, scheme filtering, document parsing, and eligibility rules.

Run the tests against the current codebase before reporting test results.

## Deployment

The frontend can be hosted on a static hosting service, while the FastAPI backend requires a Python-compatible web hosting service.

Deployment requires:

1. A publicly accessible frontend.
2. A deployed backend API.
3. Correct frontend API configuration.
4. Backend CORS configuration for the frontend domain.
5. Appropriate persistent database and file storage for production use.
6. Secure authentication and environment-based secrets.

Free hosting services may have resource limits, idle shutdowns, or temporary storage. Review the provider's current limits before relying on persistent data.

## Security and Privacy

- Never upload real Aadhaar numbers, PAN numbers, identity documents, or private citizen records to a public repository.
- Keep secrets and environment files out of Git.
- Use secure, environment-based credentials for administrator accounts.
- Restrict access to user profiles, documents, and application records.
- Use persistent, access-controlled storage for uploaded documents.
- Verify that masking and authorization protections work before deploying publicly.

## Responsible AI Notice

Yojana AI provides informational scheme discovery and eligibility guidance. It is not an official government platform and is not affiliated with any government department.

Recommendations may be incomplete or outdated. Citizens should confirm eligibility, required documents, deadlines, benefits, and application procedures through official government sources.

## Academic Project

Developed as a Community Engagement Project (CEP).

**Project:** Yojana AI — Smart Government Scheme Finder & AI-Based Recommendation Platform

**Repository:** https://github.com/PatodeRitexh/yojna_ai