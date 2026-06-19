from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Resume, User
from app.schemas.schemas import ResumeResponse
from app.services.resume_service import extract_text_from_pdf, save_upload
from app.services.ai_service import extract_skills_from_resume
from typing import List
import os

router = APIRouter()

# TODO: Replace with real Clerk auth
MOCK_USER_ID = "mock-user-123"


def get_or_create_mock_user(db: Session) -> User:
    user = db.query(User).filter(User.clerk_id == MOCK_USER_ID).first()
    if not user:
        user = User(clerk_id=MOCK_USER_ID, email="dev@example.com", full_name="Dev User")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a PDF resume, extract text and skills."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    user = get_or_create_mock_user(db)

    # Save file
    file_path = save_upload(contents, file.filename, user.id)

    # Extract text
    raw_text = extract_text_from_pdf(file_path)
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    # Extract skills with AI
    extracted_skills = extract_skills_from_resume(raw_text)

    # Deactivate previous resumes
    db.query(Resume).filter(Resume.user_id == user.id).update({"is_active": False})

    # Get next version
    count = db.query(Resume).filter(Resume.user_id == user.id).count()

    resume = Resume(
        user_id=user.id,
        filename=file.filename,
        file_path=file_path,
        raw_text=raw_text,
        extracted_skills=extracted_skills,
        is_active=True,
        version=count + 1,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


@router.get("/", response_model=List[ResumeResponse])
def list_resumes(db: Session = Depends(get_db)):
    """List all resumes for the current user."""
    user = get_or_create_mock_user(db)
    resumes = db.query(Resume).filter(Resume.user_id == user.id).order_by(Resume.created_at.desc()).all()
    return resumes


@router.get("/active", response_model=ResumeResponse)
def get_active_resume(db: Session = Depends(get_db)):
    """Get the user's currently active resume."""
    user = get_or_create_mock_user(db)
    resume = db.query(Resume).filter(Resume.user_id == user.id, Resume.is_active == True).first()
    if not resume:
        raise HTTPException(status_code=404, detail="No active resume found")
    return resume


@router.delete("/{resume_id}")
def delete_resume(resume_id: str, db: Session = Depends(get_db)):
    """Delete a resume and its linked analyses."""
    from app.models.models import JobAnalysis
    user = get_or_create_mock_user(db)
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Remove linked analyses first (avoids foreign key constraint error)
    db.query(JobAnalysis).filter(JobAnalysis.resume_id == resume_id).delete()

    if os.path.exists(resume.file_path):
        os.remove(resume.file_path)

    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted"}
