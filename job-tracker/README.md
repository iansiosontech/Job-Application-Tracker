# 🎯 JobTracker AI

An AI-powered job application tracker that scores your resume against job descriptions, generates tailored cover letters, and organizes your search on a Kanban board. Built to replace the messy spreadsheet most people use while job hunting.

**Tech:** FastAPI · PostgreSQL · Next.js · Tailwind · Google Gemini · Docker
**Live demo:** available on request (DM me)

---

## ✨ Features

- **📄 Resume Upload & Parsing** — Upload a PDF resume; AI extracts your skills automatically. Supports multiple resume versions with a "Set Active" selector.
- **🔍 Job Description Analysis** — Paste any job description; AI extracts required skills, experience level, and requirements.
- **📊 Match Scoring** — Get a 0–100 match score between your active resume and any job, with a clear breakdown of matching vs. missing skills.
- **💡 Resume Suggestions** — AI recommends concrete improvements to better fit each role.
- **✍️ Cover Letter Generation** — One click generates a tailored cover letter referencing your real skills and the job requirements.
- **📋 Kanban Application Tracker** — Drag-and-drop board with five stages: Applied, Interview, Offer, Rejected, Ghosted. Cards show match scores.
- **📈 Dashboard** — Live stats (applications, interviews, offers, average match score), a status-breakdown donut chart, and a recent-applications feed.
- **🌑 Dark Mode** — Clean, terminal-inspired dark UI throughout.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | FastAPI, SQLAlchemy, Pydantic |
| **Database** | PostgreSQL (via Docker) |
| **AI** | Google Gemini (`gemini-2.5-flash-lite`) — easily swappable for Anthropic Claude |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Charts** | Recharts |
| **PDF Parsing** | pdfplumber |
| **Deployment** | Vercel (frontend) + Render (backend & database) |

---

## 🔑 Bring Your Own Key (BYOK)

This project uses **your own** Google Gemini API key — it's never bundled with the repo. Get a free key at [aistudio.google.com](https://aistudio.google.com) and add it to your backend `.env` (see setup below). This keeps the project free to run and your usage private to you.

> 💡 The AI layer is modular (`backend/app/services/ai_service.py`). Swapping Gemini for Anthropic Claude or OpenAI is a small, isolated change.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.12+
- Node.js 20+
- Docker Desktop
- A free [Google Gemini API key](https://aistudio.google.com)

### 1. Clone the repo
```bash
git clone https://github.com/iansiosontech/Job-Application-Tracker.git
cd Job-Application-Tracker/job-tracker
```

### 2. Backend setup
```bash
cd backend

# Create & activate a virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# → Open .env and add your own GEMINI_API_KEY
```

### 3. Start PostgreSQL (Docker)
```bash
docker run --name job-tracker-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=job_tracker \
  -p 5432:5432 \
  -d postgres:15
```

### 4. Create tables & run the API
```bash
python init_db.py
uvicorn app.main:app --reload
# → API:  http://localhost:8000
# → Docs: http://localhost:8000/docs
```

### 5. Frontend setup (new terminal)
```bash
cd frontend
npm install
cp .env.example .env.local
# → Ensure NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
# → App: http://localhost:3000
```

---

## 📁 Project Structure

```
job-tracker/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/routes/         # resume, jobs, applications, analysis endpoints
│   │   ├── core/               # config / settings
│   │   ├── db/                 # database session
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── services/           # AI + PDF parsing logic
│   │   └── main.py             # app entry point
│   ├── init_db.py              # creates tables
│   ├── Dockerfile
│   └── requirements.txt
│
└── frontend/                   # Next.js frontend
    └── src/
        ├── app/
        │   ├── dashboard/      # stats + charts
        │   ├── resume/         # upload & manage resumes
        │   ├── jobs/           # add jobs + run AI analysis
        │   └── tracker/        # Kanban board
        ├── components/         # shared UI (sidebar)
        └── lib/                # API client + utils
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/resume/upload` | Upload a PDF resume |
| `GET` | `/api/resume/` | List resumes |
| `GET` | `/api/resume/active` | Get the active resume |
| `PATCH` | `/api/resume/{id}/activate` | Set a resume as active |
| `DELETE` | `/api/resume/{id}` | Delete a resume |
| `POST` | `/api/jobs/` | Create a job (AI extracts skills) |
| `GET` | `/api/jobs/` | List jobs |
| `POST` | `/api/analysis/match` | Score resume vs. job |
| `POST` | `/api/analysis/{id}/cover-letter` | Generate a cover letter |
| `GET` | `/api/applications/kanban` | Kanban board data |
| `POST` | `/api/applications/` | Track a new application |
| `PATCH` | `/api/applications/{id}` | Update status |
| `DELETE` | `/api/applications/{id}` | Remove an application |

---

## 🗺️ Roadmap

- [ ] Job URL scraping (paste a LinkedIn/Indeed link → auto-extract description)
- [ ] Rejection pattern analysis (AI insights across applications)
- [ ] Follow-up reminders

---

## 👤 Author

**Kristoffer Ian Sioson**
- Portfolio: [iansiosontech.github.io/portfolio](https://iansiosontech.github.io/portfolio)
- GitHub: [@iansiosontech](https://github.com/iansiosontech)

---

## 📝 Build Notes

Built over several focused sessions in **June 2026** — from initial scaffold to a fully deployed, dark-themed, AI-powered application. The project was developed across two machines (macOS and Windows), migrated via GitHub, and deployed to production on Vercel + Render.

*This project was built as a portfolio piece to demonstrate full-stack development, AI integration, and end-to-end deployment.*