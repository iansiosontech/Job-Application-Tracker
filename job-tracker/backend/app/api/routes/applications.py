from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Application, Job, User, ApplicationStatus
from app.schemas.schemas import ApplicationCreate, ApplicationUpdate, ApplicationResponse
from typing import List
from datetime import datetime

router = APIRouter()

MOCK_USER_ID = "mock-user-123"


def get_mock_user(db: Session) -> User:
    return db.query(User).filter(User.clerk_id == MOCK_USER_ID).first()


@router.post("/", response_model=ApplicationResponse)
def create_application(data: ApplicationCreate, db: Session = Depends(get_db)):
    """Create a new job application."""
    user = get_mock_user(db)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    job = db.query(Job).filter(Job.id == data.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    app = Application(
        user_id=user.id,
        job_id=data.job_id,
        status=data.status,
        notes=data.notes,
        applied_date=datetime.utcnow(),
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


@router.get("/", response_model=List[ApplicationResponse])
def list_applications(db: Session = Depends(get_db)):
    """List all applications for the current user."""
    user = get_mock_user(db)
    if not user:
        return []
    return (
        db.query(Application)
        .filter(Application.user_id == user.id)
        .order_by(Application.created_at.desc())
        .all()
    )


@router.get("/kanban")
def get_kanban(db: Session = Depends(get_db)):
    """Return applications grouped by status for Kanban board."""
    user = get_mock_user(db)
    if not user:
        return {status.value: [] for status in ApplicationStatus}

    applications = (
        db.query(Application)
        .filter(Application.user_id == user.id)
        .all()
    )

    board = {status.value: [] for status in ApplicationStatus}
    for app in applications:
        job = app.job
        board[app.status.value].append({
            "id": app.id,
            "job_id": app.job_id,
            "title": job.title if job else "Unknown",
            "company": job.company if job else "Unknown",
            "location": job.location if job else None,
            "match_score": app.match_score,
            "applied_date": app.applied_date.isoformat() if app.applied_date else None,
            "follow_up_date": app.follow_up_date.isoformat() if app.follow_up_date else None,
            "notes": app.notes,
        })

    return board


@router.patch("/{app_id}", response_model=ApplicationResponse)
def update_application(app_id: str, data: ApplicationUpdate, db: Session = Depends(get_db)):
    """Update application status or notes."""
    user = get_mock_user(db)
    app = db.query(Application).filter(Application.id == app_id, Application.user_id == user.id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if data.status is not None:
        app.status = data.status
    if data.notes is not None:
        app.notes = data.notes
    if data.follow_up_date is not None:
        app.follow_up_date = data.follow_up_date

    db.commit()
    db.refresh(app)
    return app


@router.delete("/{app_id}")
def delete_application(app_id: str, db: Session = Depends(get_db)):
    """Delete an application."""
    user = get_mock_user(db)
    app = db.query(Application).filter(Application.id == app_id, Application.user_id == user.id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(app)
    db.commit()
    return {"message": "Application deleted"}
