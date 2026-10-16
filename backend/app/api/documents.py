import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.config import settings
from app.models.models import User, UploadedDocument, ExtractedDocumentData, UserProfile
from app.schemas.schemas import DocumentResponse, ConfirmExtractedDataRequest
from app.document_processing.extractor import process_document_file

router = APIRouter(prefix="/documents", tags=["Document Vault & Scanner"])

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("income_certificate"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{file_ext}'. Allowed formats: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # 2. Validate MIME type
    if file.content_type not in settings.ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported MIME type '{file.content_type}'."
        )

    # 3. Read content and check size limit (10MB)
    contents = await file.read()
    file_size = len(contents)
    if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum size limit of {settings.MAX_FILE_SIZE_MB}MB."
        )

    # 4. Generate safe internal filename
    safe_filename = f"{uuid.uuid4().hex}{file_ext}"
    storage_path = Path(settings.UPLOAD_DIRECTORY) / safe_filename

    with open(storage_path, "wb") as f:
        f.write(contents)

    # 5. Create database record
    doc = UploadedDocument(
        user_id=current_user.id,
        original_filename=file.filename,
        stored_filename=safe_filename,
        file_path=str(storage_path),
        file_size=file_size,
        mime_type=file.content_type,
        document_type=document_type,
        status="processing"
    )
    db.add(doc)
    db.flush()

    # 6. Extract text and structured data
    try:
        raw_text, entities = process_document_file(
            file_path=str(storage_path),
            mime_type=file.content_type,
            document_type=document_type
        )
        
        extracted_record = ExtractedDocumentData(
            document_id=doc.id,
            raw_text=raw_text[:2000] if raw_text else "",  # store brief preview for audit
            extracted_fields=entities,
            is_confirmed=False
        )
        db.add(extracted_record)
        doc.status = "review_required" if entities else "verified_by_user"
    except Exception as e:
        doc.status = "failed"
        doc.error_message = f"Text extraction failed: {str(e)}"

    db.commit()
    db.refresh(doc)
    return doc


@router.get("", response_model=list[DocumentResponse])
def get_user_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    docs = db.query(UploadedDocument).filter(UploadedDocument.user_id == current_user.id).order_by(UploadedDocument.created_at.desc()).all()
    return docs


@router.get("/{document_id}/status", response_model=DocumentResponse)
def get_document_status(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(UploadedDocument).filter(UploadedDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Strict Authorization check
    if doc.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this document")
    
    return doc


@router.post("/{document_id}/confirm-extracted-data", response_model=DocumentResponse)
def confirm_extracted_data(
    document_id: str,
    confirm_in: ConfirmExtractedDataRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(UploadedDocument).filter(UploadedDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Strict Authorization check
    if doc.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this document")
    
    extracted = doc.extracted_data
    if not extracted:
        extracted = ExtractedDocumentData(document_id=doc.id)
        db.add(extracted)

    extracted.user_confirmed_fields = confirm_in.confirmed_fields
    extracted.is_confirmed = True
    extracted.confirmed_at = datetime.now(timezone.utc)
    doc.status = "verified_by_user"

    # Synchronize confirmed fields into User Profile if requested
    if confirm_in.sync_to_profile:
        profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
        if profile:
            if "income_amount" in confirm_in.confirmed_fields:
                try:
                    profile.annual_family_income = float(confirm_in.confirmed_fields["income_amount"])
                except (ValueError, TypeError):
                    pass
            if "category" in confirm_in.confirmed_fields:
                profile.category = confirm_in.confirmed_fields["category"]
            if "state" in confirm_in.confirmed_fields:
                profile.state = confirm_in.confirmed_fields["state"]
            if doc.document_type == "domicile_certificate":
                profile.has_domicile_certificate = True

    db.commit()
    db.refresh(doc)
    return doc


@router.delete("/{document_id}", status_code=status.HTTP_200_OK)
def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(UploadedDocument).filter(UploadedDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Strict Authorization check
    if doc.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this document")
    
    # Delete file from storage
    try:
        if os.path.exists(doc.file_path):
            os.remove(doc.file_path)
    except Exception:
        pass

    db.delete(doc)
    db.commit()
    return {"message": "Document and its extracted data deleted successfully"}
