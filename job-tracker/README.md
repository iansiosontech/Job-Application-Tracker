# AI Job Tracker

Track job applications, score matches against your resume, generate cover letters — powered by Claude AI.

## Project Structure

```
job-tracker/
├── backend/          # FastAPI + PostgreSQL
└── frontend/         # Next.js + Tailwind + Shadcn
```

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and fill in your env
cp .env.example .env
# → Add your ANTHROPIC_API_KEY and DATABASE_URL

# Start PostgreSQL (via Docker)
docker run --name job-tracker-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=job_tracker \
  -p 5432:5432 \
  -d postgres:15

# Create tables
python init_db.py

# Run the API
uvicorn app.main:app --reload
# → http://localhost:8000
# → Docs: http://localhost:8000/docs
```

### 2. Frontend Setup

```bash
cd frontend

npm install

cp .env.example .env.local
# → Add NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
# → http://localhost:3000
```

## MVP Features

| Feature | Status |
|---|---|
| Resume PDF upload + skill extraction | ✅ |
| Job description analysis (AI extracts skills) | ✅ |
| Match score + missing skills | ✅ |
| Resume improvement suggestions | ✅ |
| Cover letter generation | ✅ |
| Kanban application tracker (drag & drop) | ✅ |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/resume/upload` | Upload PDF resume |
| GET | `/api/resume/active` | Get active resume |
| POST | `/api/jobs/` | Create job (AI extracts skills) |
| GET | `/api/jobs/` | List all jobs |
| POST | `/api/analysis/match` | Score resume vs job |
| POST | `/api/analysis/{id}/cover-letter` | Generate cover letter |
| GET | `/api/applications/kanban` | Kanban board data |
| PATCH | `/api/applications/{id}` | Update status |

## Next Steps (Phase 2)

- [ ] Add Clerk authentication
- [ ] Follow-up reminders / email notifications  
- [ ] Rejection pattern analysis
- [ ] Application notes & history
- [ ] Job URL scraping
