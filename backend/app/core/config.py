import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "Yojana AI — Smart Government Scheme Finder"
    PROJECT_TAGLINE: str = "The Right Scheme. The Right Opportunity."
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "yojana-ai-super-secret-production-key-change-in-env-2026-secure"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/yojana_ai.db"
    
    # File Storage
    UPLOAD_DIRECTORY: str = str(UPLOAD_DIR)
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: list[str] = [".pdf", ".png", ".jpg", ".jpeg"]
    ALLOWED_MIME_TYPES: list[str] = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg"
    ]
    
    # AI / LLM Integration (Backend-only)
    GEMINI_API_KEY: str | None = None
    AI_MODEL_NAME: str = "gemini-1.5-flash"
    
    # Admin defaults (securely configured)
    ADMIN_EMAIL: str = "admin@yojanaai.gov.in"
    ADMIN_DEFAULT_PASSWORD: str = "Admin@YojanaAI2026"
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
