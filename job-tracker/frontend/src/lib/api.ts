import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

export const api = {
  // Resume
  uploadResume: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await client.post("/api/resume/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  listResumes: async () => {
    const { data } = await client.get("/api/resume/");
    return data;
  },
  getActiveResume: async () => {
    const { data } = await client.get("/api/resume/active");
    return data;
  },

  // Jobs
  createJob: async (job: {
    title: string;
    company: string;
    description?: string;
    url?: string;
    location?: string;
  }) => {
    const { data } = await client.post("/api/jobs/", job);
    return data;
  },
  listJobs: async () => {
    const { data } = await client.get("/api/jobs/");
    return data;
  },

  // Analysis
  analyzeMatch: async (jobId: string, resumeId: string) => {
    const { data } = await client.post("/api/analysis/match", {
      job_id: jobId,
      resume_id: resumeId,
    });
    return data;
  },
  generateCoverLetter: async (analysisId: string) => {
    const { data } = await client.post(`/api/analysis/${analysisId}/cover-letter`);
    return data;
  },

  // Applications / Kanban
  createApplication: async (jobId: string) => {
    const { data } = await client.post("/api/applications/", { job_id: jobId });
    return data;
  },
  getKanban: async () => {
    const { data } = await client.get("/api/applications/kanban");
    return data;
  },
  updateApplication: async (
    appId: string,
    update: { status?: string; notes?: string }
  ) => {
    const { data } = await client.patch(`/api/applications/${appId}`, update);
    return data;
  },
};
