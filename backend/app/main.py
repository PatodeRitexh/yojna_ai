from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.security import get_password_hash
from app.models.models import User
from app.scheme_ingestion.loader import seed_schemes_from_json

# Import API Routers
from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.documents import router as documents_router
from app.api.schemes import router as schemes_router
from app.api.recommendations import router as recommendations_router
from app.api.saved_schemes import router as saved_schemes_router
from app.api.applications import router as applications_router
from app.api.assistant import router as assistant_router
from app.api.admin import router as admin_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("yojana_ai")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize Database Tables
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    # 2. Seed Default Admin & Schemes
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL.lower()).first()
        if not admin:
            admin = User(
                email=settings.ADMIN_EMAIL.lower(),
                hashed_password=get_password_hash(settings.ADMIN_DEFAULT_PASSWORD),
                full_name="Yojana AI Administrator",
                role="admin",
                is_active=True
            )
            db.add(admin)
            db.commit()
            logger.info("Created default administrator: %s", settings.ADMIN_EMAIL)

        # Seed initial schemes
        seed_schemes_from_json(db, force=False)
    finally:
        db.close()

    yield
    logger.info("Yojana AI backend shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack AI-assisted welfare scheme discovery and eligibility platform for Indian citizens.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health & Meta endpoints
@app.get("/api/health")
def healthcheck():
    return {
        "status": "healthy",
        "service": "Yojana AI Backend",
        "database": "connected",
        "version": "1.0.0"
    }

# Register Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(profile_router, prefix=settings.API_V1_STR)
app.include_router(documents_router, prefix=settings.API_V1_STR)
app.include_router(schemes_router, prefix=settings.API_V1_STR)
app.include_router(recommendations_router, prefix=settings.API_V1_STR)
app.include_router(saved_schemes_router, prefix=settings.API_V1_STR)
app.include_router(applications_router, prefix=settings.API_V1_STR)
app.include_router(assistant_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
