from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Job
from app.schemas.schemas import JobCreate, JobResponse
from app.services.ai_service import extract_skills_from_job
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
