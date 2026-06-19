import google.generativeai as genai
import json
from app.core.config import settings

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