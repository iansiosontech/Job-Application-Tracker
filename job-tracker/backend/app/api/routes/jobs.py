from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Job
from app.schemas.schemas import JobCreate, JobResponse
from app.services.ai_service import extract_skills_from_job, fetch_job_from_url, extract_job_from_text
from typing import List

router = APIRouter()


@router.post("/", response_model=JobResponse)
def create_job(job_data: JobCreate, db: Session = Depends(get_db)):
    """Create a job entry. If description provided, AI extracts skills."""
    extracted_skills = []
    extracted_data = {}

    if job_data.description:
        try:
            extracted_data = extract_skills_from_job(job_data.description)
            extracted_skills = extracted_data.get("skills", [])
        except Exception as e:
            # Don't fail if AI extraction fails
            print(f"AI extraction failed: {e}")

    job = Job(
        title=job_data.title,
        company=job_data.company,
        description=job_data.description,
        url=job_data.url,
        location=job_data.location,
        salary_min=job_data.salary_min,
        salary_max=job_data.salary_max,
        extracted_skills=extracted_skills,
        extracted_data=extracted_data,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("/", response_model=List[JobResponse])
def list_jobs(db: Session = Depends(get_db)):
    """List all jobs."""
    return db.query(Job).order_by(Job.created_at.desc()).all()


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: str, db: Session = Depends(get_db)):
    """Get a specific job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.delete("/{job_id}")
def delete_job(job_id: str, db: Session = Depends(get_db)):
    """Delete a job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"message": "Job deleted"}

@router.post("/from-url", response_model=JobResponse)
def create_job_from_url(payload: dict, db: Session = Depends(get_db)):
    """Scrape a job posting URL, extract details with AI, and save it."""
    url = payload.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    # 1. Scrape the page text
    try:
        page_text = fetch_job_from_url(url)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    # 2. AI extracts structured job data
    try:
        extracted = extract_job_from_text(page_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI extraction failed: {e}")

    # 3. Save the job
    job = Job(
        title=extracted.get("title") or "Untitled Role",
        company=extracted.get("company") or "Unknown",
        description=extracted.get("description"),
        location=extracted.get("location"),
        url=url,
        extracted_skills=extracted.get("skills", []),
        extracted_data=extracted,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job