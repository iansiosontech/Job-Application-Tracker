from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import resume, jobs, applications, analysis
from app.db.database import engine, Base
from app.models import models  # ensures all models are registered with Base

app = FastAPI(
    title="AI Job Tracker API",
    description="Track job applications, score matches, generate cover letters",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS + ([settings.FRONTEND_URL] if settings.FRONTEND_URL else []),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # Creates any tables that don't exist yet (safe to run repeatedly)
    Base.metadata.create_all(bind=engine)


app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(applications.router, prefix="/api/applications", tags=["Applications"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])


@app.get("/")
async def root():
    return {"message": "AI Job Tracker API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}