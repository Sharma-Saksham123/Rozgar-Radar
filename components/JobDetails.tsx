"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api-client";
import {
  STATUS_LABEL,
  STATUS_STYLE,
  type JobWithMatch,
} from "@/lib/types";

interface JobDetailsProps {
  job: JobWithMatch;
  saved: boolean;
  onClose: () => void;
  onSavedChange: (jobId: string, saved: boolean) => void;
}

export default function JobDetails({
  job,
  saved,
  onClose,
  onSavedChange,
}: JobDetailsProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const match = job.match;
  const status = match?.status;

  async function toggleSave() {
    setBusy(true);
    setError(null);
    try {
      const response = await apiFetch("/api/saved", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: job.id }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Could not update saved jobs");
      }

      onSavedChange(job.id, !saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-slate-800 bg-slate-950/95 p-6 shadow-2xl sm:max-w-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold leading-snug text-white">{job.title}</h2>
            <p className="text-sm font-medium text-cyan-400">{job.company}</p>
            <p className="text-xs text-slate-400">{job.location}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-sm text-slate-300 transition hover:border-rose-400/60 hover:text-rose-300"
          >
            ✕
          </button>
        </div>

      {status ? (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLE[status]}`}
          >
            {STATUS_LABEL[status]}
          </span>
          <span className="text-xs text-slate-400">{match?.score}% match</span>
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          Run the AI match to see your eligibility for this role.
        </p>
      )}

      {match?.explanation && (
        <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-900/60 p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">
            AI explanation
          </p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-200">
            {match.explanation}
          </p>
        </div>
      )}

      {match?.reasons && match.reasons.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">
            Eligibility checks
          </p>
          <ul className="mt-2 space-y-2">
            {match.reasons.map((reason) => (
              <li
                key={reason.label}
                className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                      reason.passed
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-rose-500/20 text-rose-300"
                    }`}
                  >
                    {reason.passed ? "✓" : "✕"}
                  </span>
                  <span className="text-sm font-medium text-slate-200">
                    {reason.label}
                  </span>
                </div>
                <p className="mt-1 pl-6 text-xs leading-relaxed text-slate-400">
                  {reason.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">
          About this role
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {job.description}
        </p>
      </div>

      {job.skills.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">
            Skills
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {job.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-xs text-slate-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto space-y-2 pt-6">
        {error && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleSave}
            disabled={busy}
            className="flex-1 rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-200 transition hover:border-cyan-400/70 disabled:opacity-60"
          >
            {busy ? "Saving…" : saved ? "Remove from saved" : "Save job"}
          </button>
          <a
            href={job.apply_url}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-lg bg-cyan-500 px-4 py-2.5 text-center text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
          >
            Apply
          </a>
        </div>
      </div>
    </aside>
  </div>
);
}
