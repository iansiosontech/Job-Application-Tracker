"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Loader2, Plus, ChevronRight } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  extracted_skills?: string[];
  created_at: string;
}

interface Analysis {
  id: string;
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  resume_suggestions: string[];
  cover_letter?: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState({ title: "", company: "", description: "", url: "", location: "" });
  const [submitting, setSubmitting] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingCL, setGeneratingCL] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.listJobs().then(setJobs).catch(console.error);
  }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.company) return;
    setSubmitting(true);
    setError("");
    try {
      const job = await api.createJob(form);
      setJobs((prev) => [job, ...prev]);
      setForm({ title: "", company: "", description: "", url: "", location: "" });
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to create job");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnalyze = async (job: Job) => {
    setSelectedJob(job);
    setAnalysis(null);
    setAnalyzing(true);
    try {
      const resume = await api.getActiveResume();
      const result = await api.analyzeMatch(job.id, resume.id);
      setAnalysis(result);
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Analysis failed — make sure you have an active resume");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCoverLetter = async () => {
    if (!analysis) return;
    setGeneratingCL(true);
    try {
      const result = await api.generateCoverLetter(analysis.id);
      setAnalysis((prev) => prev ? { ...prev, cover_letter: result.cover_letter } : prev);
    } finally {
      setGeneratingCL(false);
    }
  };

  const scoreColor = (score: number) =>
    score >= 75 ? "text-green-600 bg-green-50" :
    score >= 50 ? "text-yellow-600 bg-yellow-50" :
    "text-red-600 bg-red-50";

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Jobs</h1>
      <p className="text-gray-500 mb-6">Paste a job description and get AI-powered match analysis</p>

      {/* Add Job Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-gray-800 mb-4">Add New Job</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Job Title *</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Software Engineer Intern"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Company *</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Acme Corp"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Remote / Taipei"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Job URL</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="https://..."
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1">Job Description (paste here for AI analysis)</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            rows={6}
            placeholder="Paste the full job description..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={submitting || !form.title || !form.company}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {submitting ? "Adding…" : "Add Job"}
        </button>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Jobs List */}
        <div className="col-span-2 space-y-2">
          <h2 className="font-semibold text-gray-800 mb-3">Saved Jobs ({jobs.length})</h2>
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => handleAnalyze(job)}
              className={`w-full text-left bg-white border rounded-xl p-4 hover:border-indigo-300 transition-colors ${
                selectedJob?.id === job.id ? "border-indigo-400 ring-1 ring-indigo-200" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{job.title}</p>
                  <p className="text-xs text-gray-500">{job.company}</p>
                  {job.location && <p className="text-xs text-gray-400">{job.location}</p>}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
              {job.extracted_skills && job.extracted_skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {job.extracted_skills.slice(0, 4).map((s) => (
                    <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              )}
            </button>
          ))}
          {jobs.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">No jobs yet — add one above</p>
          )}
        </div>

        {/* Analysis Panel */}
        <div className="col-span-3">
          {analyzing && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-gray-600 font-medium">Analyzing match…</p>
            </div>
          )}

          {analysis && !analyzing && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">{selectedJob?.title} @ {selectedJob?.company}</h2>
                <span className={`text-2xl font-bold px-3 py-1 rounded-lg ${scoreColor(analysis.match_score)}`}>
                  {analysis.match_score}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-green-700 mb-1.5">✓ Matching Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.matching_skills.map((s) => (
                      <span key={s} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-600 mb-1.5">✗ Missing Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.missing_skills.map((s) => (
                      <span key={s} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              {analysis.resume_suggestions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Resume Suggestions</p>
                  <ul className="space-y-1">
                    {analysis.resume_suggestions.map((s, i) => (
                      <li key={i} className="text-sm text-gray-600 flex gap-2">
                        <span className="text-indigo-400">→</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.cover_letter ? (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Cover Letter</p>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto font-sans">
                    {analysis.cover_letter}
                  </pre>
                </div>
              ) : (
                <button
                  onClick={handleCoverLetter}
                  disabled={generatingCL}
                  className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {generatingCL ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {generatingCL ? "Generating…" : "Generate Cover Letter"}
                </button>
              )}
            </div>
          )}

          {!analysis && !analyzing && (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-10 text-center">
              <p className="text-gray-400 text-sm">Click a job to run AI match analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
