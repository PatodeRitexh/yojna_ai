import os
import logging
from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import model_validator

logger = logging.getLogger("yojana_ai.config")

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "Yojana AI — Smart Government Scheme Finder"
    PROJECT_TAGLINE: str = "The Right Scheme. The Right Opportunity."
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"  # "development", "production", "test"
    
    # Security: Secret key for JWT encoding (must be set in production)
    SECRET_KEY: str = ""
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
    
    # Admin defaults (must be configured via private environment variables)
    ADMIN_EMAIL: str = "admin@yojanaai.gov.in"
    ADMIN_DEFAULT_PASSWORD: str | None = None

    # CORS configuration
    FRONTEND_URL: str | None = None
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @model_validator(mode="after")
    def validate_environment_and_secrets(self):
        # In production, enforce non-empty, strong SECRET_KEY
        if self.ENVIRONMENT.lower() == "production":
            if not self.SECRET_KEY or len(self.SECRET_KEY) < 32:
                raise ValueError(
                    "Production deployment requires a secure SECRET_KEY of at least 32 characters set via environment variables."
                )
        else:
            # Fallback for local development if not specified in .env
            if not self.SECRET_KEY:
                self.SECRET_KEY = "yojana-ai-dev-secret-key-change-in-production-12345"
        return self
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
