from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.models import User
from app.schemas.schemas import ChatRequest, ChatResponse
from app.services.assistant_service import query_assistant

router = APIRouter(prefix="/assistant", tags=["AI Scheme Assistant"])

def get_optional_user(authorization: str | None = Header(None), db: Session = Depends(get_db)) -> User | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    return db.query(User).filter(User.id == user_id).first()

@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(
    chat_in: ChatRequest,
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    result = query_assistant(
        user_query=chat_in.message,
        db=db,
        user=current_user,
        scheme_id=chat_in.scheme_id
    )
    return result
