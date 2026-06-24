import google.generativeai as genai
import json
from app.core.config import settings
import httpx
from bs4 import BeautifulSoup

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash-lite")


def extract_skills_from_job(job_description: str) -> dict:
    prompt = f"""Analyze this job description and extract structured data.

Job Description:
{job_description}

Return ONLY a JSON object with this exact structure (no markdown, no extra text):
{{
  "skills": ["skill1", "skill2"],
  "requirements": ["requirement1"],
  "nice_to_have": ["nice1"],
  "experience_years": 2,
  "role_level": "junior|mid|senior|lead",
  "remote": true
}}"""

    response = model.generate_content(prompt)
    text = response.text.strip().replace("```json", "").replace("```", "")
    return json.loads(text)


def extract_skills_from_resume(resume_text: str) -> list:
    prompt = f"""Extract all technical and professional skills from this resume.

Resume:
{resume_text[:4000]}

Return ONLY a JSON array, no markdown, no extra text:
["skill1", "skill2", "skill3"]"""

    response = model.generate_content(prompt)
    text = response.text.strip().replace("```json", "").replace("```", "")
    return json.loads(text)


def analyze_match(resume_text: str, job_description: str, job_skills: list) -> dict:
    prompt = f"""You are an expert resume analyst. Compare this resume against the job description.

RESUME:
{resume_text[:3000]}

JOB DESCRIPTION:
{job_description[:2000]}

JOB REQUIRED SKILLS: {json.dumps(job_skills)}

Return ONLY a JSON object (no markdown):
{{
  "match_score": 75,
  "matching_skills": ["Python", "Git"],
  "missing_skills": ["Docker", "Kubernetes"],
  "resume_suggestions": [
    "Highlight your FastAPI REST API projects"
  ],
  "summary": "Strong Python background, but missing containerization experience"
}}"""

    response = model.generate_content(prompt)
    text = response.text.strip().replace("```json", "").replace("```", "")
    return json.loads(text)


def generate_cover_letter(resume_text: str, job_title: str, company: str, job_description: str) -> str:
    prompt = f"""Write a compelling, personalized cover letter for this job application.

APPLICANT RESUME:
{resume_text[:2500]}

JOB TITLE: {job_title}
COMPANY: {company}
JOB DESCRIPTION:
{job_description[:1500]}

Write a professional cover letter (3-4 paragraphs). Be specific and connect resume skills to job requirements. Return only the cover letter text."""

    response = model.generate_content(prompt)
    return response.text.strip()

def fetch_job_from_url(url: str) -> str:
    """Fetch a job posting URL and return cleaned readable text."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    }
    try:
        resp = httpx.get(url, headers=headers, timeout=15, follow_redirects=True)
        resp.raise_for_status()
    except Exception as e:
        raise ValueError(f"Could not fetch the URL: {e}")

    soup = BeautifulSoup(resp.text, "html.parser")

    for tag in soup(["script", "style", "nav", "footer", "header", "noscript"]):
        tag.decompose()

    text = soup.get_text(separator="\n")
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    cleaned = "\n".join(lines)

    if len(cleaned) < 100:
        raise ValueError("Page returned too little text — it may require login or block scraping.")

    return cleaned[:8000]


def extract_job_from_text(page_text: str) -> dict:
    """Use AI to pull structured job info from scraped page text."""
    prompt = f"""Below is the raw text of a job posting web page. Extract the job details.

PAGE TEXT:
{page_text}

Return ONLY a JSON object (no markdown):
{{
  "title": "job title",
  "company": "company name",
  "location": "location or null",
  "description": "a clean 2-4 paragraph summary of the role and requirements",
  "skills": ["skill1", "skill2"]
}}

If you cannot find a field, use null. Extract real skills mentioned in the posting."""

    response = model.generate_content(prompt)
    text = response.text.strip().replace("```json", "").replace("```", "")
    return json.loads(text)