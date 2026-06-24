"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Loader2, Plus, ChevronRight, Check } from "lucide-react";

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

const inputClass =
  "w-full bg-[#0d0d14] border border-white/[0.1] text-white rounded-lg px-3 py-2 text-sm placeholder:text-[#5a5a64] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState({ title: "", company: "", description: "", url: "", location: "" });
  const [submitting, setSubmitting] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingCL, setGeneratingCL] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [tracked, setTracked] = useState(false);
  const [error, setError] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState("");

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

  const handleScrapeUrl = async () => {
    if (!jobUrl.trim()) return;
    setScraping(true);
    setScrapeError("");
    try {
      const job = await api.createJobFromUrl(jobUrl.trim());
      setJobs((prev) => [job, ...prev]);
      setJobUrl("");
    } catch (e: any) {
      setScrapeError(e?.response?.data?.detail || "Couldn't scrape that URL — try pasting the description manually.");
    } finally {
      setScraping(false);
    }
  };

  const handleAnalyze = async (job: Job) => {
    setSelectedJob(job);
    setAnalysis(null);
    setTracked(false);
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

  const handleTrack = async () => {
    if (!selectedJob) return;
    setTracking(true);
    try {
      await api.createApplication(selectedJob.id);
      setTracked(true);
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Failed to add to tracker");
    } finally {
      setTracking(false);
    }
  };

  const scoreColor = (score: number) =>
    score >= 75 ? "text-green-400 bg-green-500/15" :
    score >= 50 ? "text-yellow-400 bg-yellow-500/15" :
    "text-red-400 bg-red-500/15";

  return (
    <div className="p-8 max-w-5xl min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-1">Jobs</h1>
      <p className="text-[#8b8b96] mb-6">Paste a job description and get AI-powered match analysis</p>

      {/* Scrape from URL */}
      <div className="bg-[#16161f] border border-white/[0.08] rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-white mb-1">Import from URL</h2>
        <p className="text-xs text-[#8b8b96] mb-4">Paste a job posting link — AI will extract the details automatically. Works best with company career pages (Greenhouse, Lever, etc.).</p>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-[#0d0d14] border border-white/[0.1] text-white rounded-lg px-3 py-2 text-sm placeholder:text-[#5a5a64] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            placeholder="https://jobs.example.com/role/12345"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
          />
          <button
            onClick={handleScrapeUrl}
            disabled={scraping || !jobUrl.trim()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {scraping ? "Importing…" : "Import"}
          </button>
        </div>
        {scrapeError && <p className="text-red-400 text-sm mt-2">{scrapeError}</p>}
      </div>

      {/* Add Job Form */}
      <div className="bg-[#16161f] border border-white/[0.08] rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-white mb-4">Add New Job</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-[#8b8b96] mb-1">Job Title *</label>
            <input className={inputClass} placeholder="Software Engineer Intern" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b8b96] mb-1">Company *</label>
            <input className={inputClass} placeholder="Acme Corp" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b8b96] mb-1">Location</label>
            <input className={inputClass} placeholder="Remote / Taipei" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b8b96] mb-1">Job URL</label>
            <input className={inputClass} placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-[#8b8b96] mb-1">Job Description (paste here for AI analysis)</label>
          <textarea className={`${inputClass} resize-none`} rows={6} placeholder="Paste the full job description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={submitting || !form.title || !form.company}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {submitting ? "Adding…" : "Add Job"}
        </button>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Jobs List */}
        <div className="col-span-2 space-y-2">
          <h2 className="font-semibold text-white mb-3">Saved Jobs ({jobs.length})</h2>
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => handleAnalyze(job)}
              className={`w-full text-left bg-[#16161f] border rounded-xl p-4 hover:border-indigo-500/40 transition-colors ${
                selectedJob?.id === job.id ? "border-indigo-500/50 ring-1 ring-indigo-500/20" : "border-white/[0.08]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white text-sm">{job.title}</p>
                  <p className="text-xs text-[#8b8b96]">{job.company}</p>
                  {job.location && <p className="text-xs text-[#5a5a64]">{job.location}</p>}
                </div>
                <ChevronRight className="w-4 h-4 text-[#5a5a64]" />
              </div>
              {job.extracted_skills && job.extracted_skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {job.extracted_skills.slice(0, 4).map((s) => (
                    <span key={s} className="text-xs bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              )}
            </button>
          ))}
          {jobs.length === 0 && (
            <p className="text-[#5a5a64] text-sm text-center py-8">No jobs yet — add one above</p>
          )}
        </div>

        {/* Analysis Panel */}
        <div className="col-span-3">
          {analyzing && (
            <div className="bg-[#16161f] border border-white/[0.08] rounded-xl p-8 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-[#8b8b96] font-medium">Analyzing match…</p>
            </div>
          )}

          {analysis && !analyzing && (
            <div className="bg-[#16161f] border border-white/[0.08] rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">{selectedJob?.title} @ {selectedJob?.company}</h2>
                <span className={`text-2xl font-bold px-3 py-1 rounded-lg ${scoreColor(analysis.match_score)}`}>
                  {analysis.match_score}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-green-400 mb-1.5">✓ Matching Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.matching_skills.map((s) => (
                      <span key={s} className="text-xs bg-green-500/15 text-green-300 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-400 mb-1.5">✗ Missing Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.missing_skills.map((s) => (
                      <span key={s} className="text-xs bg-red-500/15 text-red-300 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              {analysis.resume_suggestions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#c0c0c8] mb-2">Resume Suggestions</p>
                  <ul className="space-y-1">
                    {analysis.resume_suggestions.map((s, i) => (
                      <li key={i} className="text-sm text-[#8b8b96] flex gap-2">
                        <span className="text-indigo-400">→</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.cover_letter ? (
                <div>
                  <p className="text-xs font-semibold text-[#c0c0c8] mb-2">Cover Letter</p>
                  <pre className="text-sm text-[#c0c0c8] whitespace-pre-wrap bg-[#0d0d14] border border-white/[0.06] rounded-lg p-4 max-h-48 overflow-y-auto font-sans">
                    {analysis.cover_letter}
                  </pre>
                </div>
              ) : (
                <button
                  onClick={handleCoverLetter}
                  disabled={generatingCL}
                  className="flex items-center gap-2 bg-white/[0.06] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/[0.1] disabled:opacity-50 transition-colors border border-white/[0.08]"
                >
                  {generatingCL ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {generatingCL ? "Generating…" : "Generate Cover Letter"}
                </button>
              )}

              {/* Track this Application */}
              <div className="pt-2 border-t border-white/[0.06]">
                {tracked ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                    <Check className="w-4 h-4" />
                    Added to your tracker — check the Tracker board!
                  </div>
                ) : (
                  <button
                    onClick={handleTrack}
                    disabled={tracking}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    {tracking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {tracking ? "Adding…" : "Track this Application"}
                  </button>
                )}
              </div>
            </div>
          )}

          {!analysis && !analyzing && (
            <div className="bg-[#16161f]/50 border border-dashed border-white/[0.1] rounded-xl p-10 text-center">
              <p className="text-[#5a5a64] text-sm">Click a job to run AI match analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}