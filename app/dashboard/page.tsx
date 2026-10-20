"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { getSessionUserId } from "@/lib/session";
import {
  STATUS_LABEL,
  STATUS_STYLE,
  type JobWithMatch,
  type MatchStatus,
  type Profile,
} from "@/lib/types";
import {
  Sparkles,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Bot,
  Layers,
  Globe,
  SlidersHorizontal,
} from "lucide-react";

const FILTERS: Array<{ key: "all" | MatchStatus; label: string }> = [
  { key: "all", label: "All" },
  { key: "confirmed", label: "Confirmed" },
  { key: "likely", label: "Likely" },
  { key: "needs_review", label: "Needs review" },
  { key: "not_eligible", label: "Not eligible" },
];

const QUICK_CATEGORIES = [
  { label: "All Roles", value: "all" },
  { label: "Software Engineer", value: "Software Engineer" },
  { label: "Frontend / React", value: "Frontend" },
  { label: "Backend / Python", value: "Backend" },
  { label: "Data & AI / ML", value: "Data" },
  { label: "Remote (India)", value: "Remote" },
];

const ATS_SOURCES = [
  { id: "all", label: "All Connected ATS Sources" },
  { id: "greenhouse", label: "Greenhouse Direct ATS" },
  { id: "lever", label: "Lever Direct ATS" },
  { id: "ashby", label: "Ashby Portals" },
  { id: "workday", label: "Workday Enterprise" },
  { id: "smartrecruiters", label: "SmartRecruiters" },
  { id: "jobicy", label: "Jobicy Feed" },
];

export default function DashboardPage() {
  const [jobs, setJobs] = useState<JobWithMatch[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [filter, setFilter] = useState<"all" | MatchStatus>("all");
  const [tab, setTab] = useState<"matches" | "saved">("matches");
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Job fetching & AI state
  const [fetching, setFetching] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [fetchMessage, setFetchMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const userId = await getSessionUserId();
        if (cancelled) return;

        if (!userId) {
          setLoading(false);
          return;
        }
        setAuthed(true);

        const [jobsRes, savedRes, profileRes] = await Promise.all([
          apiFetch("/api/jobs"),
          apiFetch("/api/saved"),
          apiFetch("/api/profile"),
        ]);

        if (jobsRes.ok) {
          const payload = await jobsRes.json();
          if (!cancelled) setJobs(payload.jobs ?? []);
        }
        if (savedRes.ok) {
          const payload = await savedRes.json();
          if (!cancelled) setSavedIds(payload.saved ?? []);
        }
        if (profileRes.ok) {
          const payload = await profileRes.json();
          if (!cancelled) setProfile(payload.profile ?? null);
        }
      } catch {
        setError("Could not load your dashboard. Check your setup.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  // AI Smart Job Fetch handler
  const handleAiFetch = async (customPrompt?: string) => {
    setFetching(true);
    setError(null);
    setFetchMessage(null);
    const queryToUse = customPrompt !== undefined ? customPrompt : aiPrompt;

    try {
      const res = await apiFetch("/api/jobs/ai-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "ai",
          prompt: queryToUse,
          source_id: selectedSource !== "all" ? selectedSource : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("AI Fetch failed. Please try again.");
      }

      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);
        setTab("matches");
        setFetchMessage(
          data.message ||
            `AI evaluated and fetched ${data.jobs.length} jobs against your profile criteria.`
        );
      }
    } catch (err: any) {
      setError(err?.message || "Failed to run AI job fetch.");
    } finally {
      setFetching(false);
    }
  };

  // Direct ATS Source Ingestion Fetch handler
  const handleAtsSyncFetch = async (sourceId?: string) => {
    setFetching(true);
    setError(null);
    setFetchMessage(null);
    const src = sourceId || selectedSource;

    try {
      const res = await apiFetch("/api/jobs/ai-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "ats",
          source_id: src !== "all" ? src : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("ATS Fetch failed.");
      }

      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);
        setFetchMessage(
          `Successfully fetched ${data.jobs.length} verified openings from official ATS endpoints.`
        );
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch from ATS sources.");
    } finally {
      setFetching(false);
    }
  };

  // Quick category fetch
  const handleCategoryFetch = async (cat: string) => {
    setActiveCategory(cat);
    setFetching(true);
    setError(null);
    setFetchMessage(null);

    try {
      const res = await apiFetch("/api/jobs/ai-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "category",
          category: cat !== "all" ? cat : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Category fetch failed.");
      }

      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);
        setFetchMessage(
          `Fetched ${data.jobs.length} roles for "${cat}".`
        );
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch roles.");
    } finally {
      setFetching(false);
    }
  };

  // Toggle save job
  const handleToggleSave = async (jobId: string) => {
    const isSaved = savedIds.includes(jobId);
    const newSaved = isSaved
      ? savedIds.filter((id) => id !== jobId)
      : [...savedIds, jobId];
    setSavedIds(newSaved);

    try {
      await apiFetch("/api/saved", {
        method: isSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId }),
      });
    } catch {
      // rollback if needed
    }
  };

  const matchedJobs = useMemo(
    () => jobs.filter((job) => job.match !== null && job.match !== undefined),
    [jobs],
  );

  const savedJobs = useMemo(
    () => jobs.filter((job) => savedIds.includes(job.id)),
    [jobs, savedIds],
  );

  const counts = useMemo(() => {
    const acc: Record<string, number> = {};
    matchedJobs.forEach((job) => {
      const status = job.match!.status;
      acc[status] = (acc[status] ?? 0) + 1;
    });
    return acc;
  }, [matchedJobs]);

  const visibleJobs = useMemo(() => {
    const source = tab === "saved" ? savedJobs : (matchedJobs.length > 0 ? matchedJobs : jobs);
    if (filter === "all") return source;
    return source.filter((job) => job.match?.status === filter);
  }, [tab, savedJobs, matchedJobs, jobs, filter]);

  if (!loading && !authed) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-gray-800 bg-black/80 backdrop-blur-md p-10 text-center shadow-2xl">
        <h1
          className="text-xl font-medium text-white tracking-tight"
          style={{ letterSpacing: "-0.04em" }}
        >
          Sign in to access your dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Your saved jobs, AI matches, and live ATS feeds are saved in your account.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-gradient-to-b from-white via-white/95 to-white/60 text-black px-5 py-2.5 text-xs font-medium transition hover:scale-105 active:scale-95 shadow-md"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header title */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-medium tracking-tight text-white"
            style={{ letterSpacing: "-0.04em" }}
          >
            Candidate Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time multi-source ATS ingestion with AI-driven eligibility matching.
          </p>
        </div>

        {profile && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Profile:</span>
            <span className="text-xs font-medium text-white bg-gray-900 border border-gray-800 px-2.5 py-1 rounded-md">
              {profile.degree || "B.Tech"} • {profile.branch || "CSE"} • {profile.graduation_year || "2026"}
            </span>
            <Link
              href="/onboarding"
              className="text-xs text-gray-400 hover:text-white underline underline-offset-4 ml-1"
            >
              Edit
            </Link>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">✕</button>
        </div>
      )}

      {fetchMessage && (
        <div className="rounded-xl border border-gray-800 bg-gray-950/80 px-4 py-3 text-xs text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{fetchMessage}</span>
          <button onClick={() => setFetchMessage(null)} className="ml-auto text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {/* ======================================================== */}
      {/* JOB FETCH & AI DISCOVERY CONTROL CENTER                   */}
      {/* ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: AI Smart Job Fetch */}
        <div className="rounded-2xl border border-gray-800 bg-black/80 backdrop-blur-md p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gray-800 text-white border border-gray-700">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">AI Smart Job Fetch</h2>
                  <p className="text-[11px] text-gray-400">Evaluates eligibility & plain-English fit</p>
                </div>
              </div>
              <span className="text-[10px] font-medium text-gray-300 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-white" />
                AI Powered
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Enter any requirement or career goal. The AI engine checks your academic cut-offs, skills, and batch against verified employer postings.
            </p>

            {/* AI Search input */}
            <div className="relative mb-3">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Remote Python developer roles, fresher roles with lenient cutoff..."
                className="w-full pl-3.5 pr-28 py-2.5 bg-gray-950/80 border border-gray-800 rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20 transition"
                onKeyDown={(e) => e.key === "Enter" && handleAiFetch()}
              />
              <button
                onClick={() => handleAiFetch()}
                disabled={fetching}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-gradient-to-b from-white via-white/95 to-white/60 text-black text-xs font-medium rounded-lg hover:scale-105 active:scale-95 disabled:opacity-50 transition cursor-pointer flex items-center gap-1 shadow-sm"
              >
                {fetching ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-black" />
                ) : (
                  <Sparkles className="w-3 h-3 text-black" />
                )}
                <span>AI Fetch</span>
              </button>
            </div>

            {/* Quick AI preset prompts */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <button
                onClick={() => handleAiFetch("AI Match All Roles Against My Profile")}
                disabled={fetching}
                className="rounded-md border border-gray-800 bg-gray-900/60 px-2.5 py-1 text-gray-300 hover:text-white hover:border-gray-700 transition cursor-pointer"
              >
                ⚡ Match All against my profile
              </button>
              <button
                onClick={() => handleAiFetch("Fresher and entry level software roles")}
                disabled={fetching}
                className="rounded-md border border-gray-800 bg-gray-900/60 px-2.5 py-1 text-gray-300 hover:text-white hover:border-gray-700 transition cursor-pointer"
              >
                🎯 Top fresher roles
              </button>
              <button
                onClick={() => handleAiFetch("Remote India eligible positions")}
                disabled={fetching}
                className="rounded-md border border-gray-800 bg-gray-900/60 px-2.5 py-1 text-gray-300 hover:text-white hover:border-gray-700 transition cursor-pointer"
              >
                🌐 Remote India
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Direct ATS Multi-Source Ingestion Fetch */}
        <div className="rounded-2xl border border-gray-800 bg-black/80 backdrop-blur-md p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gray-800 text-white border border-gray-700">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Direct ATS Feed Fetch</h2>
                  <p className="text-[11px] text-gray-400">Greenhouse, Lever, Ashby, Workday APIs</p>
                </div>
              </div>
              <span className="text-[10px] font-medium text-gray-300 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                2,083+ Live
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Select specific enterprise applicant tracking system sources or sync directly to fetch recent openings without third-party aggregator delay.
            </p>

            {/* ATS Source dropdown & Fetch button */}
            <div className="flex items-center gap-2 mb-3">
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="flex-1 bg-gray-950/80 border border-gray-800 text-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-white/50 cursor-pointer"
              >
                {ATS_SOURCES.map((src) => (
                  <option key={src.id} value={src.id} className="bg-black text-white">
                    {src.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleAtsSyncFetch()}
                disabled={fetching}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-xs font-medium rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${fetching ? "animate-spin text-white" : ""}`} />
                <span>Fetch ATS</span>
              </button>
            </div>

            {/* Quick Category Pills */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {QUICK_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryFetch(cat.value)}
                  disabled={fetching}
                  className={`rounded-md px-2.5 py-1 transition cursor-pointer border ${
                    activeCategory === cat.value
                      ? "bg-white text-black font-medium border-white"
                      : "bg-gray-900/60 text-gray-400 hover:text-white border-gray-800"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* ELIGIBILITY STATS COUNTERS                                */}
      {/* ======================================================== */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FILTERS.filter((f) => f.key !== "all").map((f) => (
          <div key={f.key} className="rounded-xl border border-gray-800 bg-black/60 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
              {f.label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {counts[f.key] ?? 0}
            </p>
          </div>
        ))}
      </section>

      {/* ======================================================== */}
      {/* RESULTS LIST & TABS                                      */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-gray-800 bg-gray-950/70 p-0.5">
              {(["matches", "saved"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`rounded-md px-4 py-1.5 text-xs font-medium transition cursor-pointer ${
                    tab === key
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {key === "matches" ? `Results (${visibleJobs.length})` : `Saved (${savedIds.length})`}
                </button>
              ))}
            </div>

            {tab === "matches" && (
              <div className="flex flex-wrap gap-1.5">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition cursor-pointer ${
                      filter === f.key
                        ? "border-gray-600 bg-gray-800 text-white"
                        : "border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500">
            Total Available Postings: <strong className="text-white">{jobs.length}</strong>
          </div>
        </div>

        {loading || fetching ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
            <RefreshCw className="w-7 h-7 animate-spin text-white" />
            <p className="text-sm font-medium text-white">
              {fetching ? "Fetching and analyzing jobs..." : "Loading your dashboard..."}
            </p>
            <p className="text-xs text-gray-500">Checking ATS repositories and profile rules</p>
          </div>
        ) : visibleJobs.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-black/60 px-4 py-12 text-center text-sm text-gray-400">
            {tab === "saved"
              ? "No saved jobs yet. Click the bookmark icon on any card below to save it."
              : "No jobs match this filter. Click 'AI Fetch' or 'Fetch ATS' above to refresh openings."}
          </div>
        ) : (
          <ul className="space-y-3">
            {visibleJobs.map((job) => {
              const isSaved = savedIds.includes(job.id);
              return (
                <li
                  key={job.id}
                  className="rounded-xl border border-gray-800 bg-black/60 p-5 backdrop-blur-sm hover:border-gray-700 transition"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs text-gray-400 font-medium">{job.company}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-xs text-gray-500">{job.location}</span>
                        {job.min_degree && (
                          <span className="text-[10px] font-medium bg-gray-900 border border-gray-800 text-gray-300 px-2 py-0.5 rounded">
                            {job.min_degree}
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-white text-base leading-snug">{job.title}</h3>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {job.match && (
                        <>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLE[job.match.status]}`}
                          >
                            {STATUS_LABEL[job.match.status]}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            {job.match.score}%
                          </span>
                        </>
                      )}

                      <button
                        onClick={() => handleToggleSave(job.id)}
                        title={isSaved ? "Remove from saved" : "Save role"}
                        className="p-1.5 rounded-lg border border-gray-800 bg-gray-900/60 hover:bg-gray-800 text-gray-400 hover:text-white transition cursor-pointer"
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-4 h-4 text-white" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>

                      <a
                        href={job.apply_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md bg-white hover:bg-gray-200 text-black px-3.5 py-1.5 text-xs font-medium transition flex items-center gap-1 shadow-sm active:scale-95"
                      >
                        <span>Apply</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {job.match?.explanation && (
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-300 border-t border-gray-800/80 pt-2.5">
                      {job.match.explanation}
                    </p>
                  )}

                  {job.match?.reasons && job.match.reasons.length > 0 && (
                    <ul className="mt-3 grid gap-1.5 sm:grid-cols-2 pt-2 border-t border-gray-800/50">
                      {job.match.reasons.map((reason) => (
                        <li
                          key={reason.label}
                          className="flex items-start gap-2 text-xs text-gray-400"
                        >
                          <span
                            className={`mt-0.5 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                              reason.passed
                                ? "bg-white/20 text-white"
                                : "bg-rose-500/20 text-rose-300"
                            }`}
                          >
                            {reason.passed ? "✓" : "✕"}
                          </span>
                          <span>
                            <span className="text-gray-300 font-medium">{reason.label}:</span>{" "}
                            {reason.detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
