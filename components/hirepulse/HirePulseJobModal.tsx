"use client";

import { JobListing } from "@/lib/hirepulse/types";
import { X, ExternalLink, MapPin, ShieldCheck, Banknote, Clock, Globe, Calendar } from "lucide-react";

interface HirePulseJobModalProps {
  job: JobListing | null;
  onClose: () => void;
}

const PLATFORM_COLORS: Record<string, string> = {
  greenhouse:      "bg-gray-800 text-gray-200 border-gray-700",
  lever:           "bg-gray-800 text-gray-200 border-gray-700",
  ashby:           "bg-gray-800 text-gray-200 border-gray-700",
  smartrecruiters: "bg-gray-800 text-gray-200 border-gray-700",
  workday:         "bg-gray-800 text-gray-200 border-gray-700",
  workable:        "bg-gray-800 text-gray-200 border-gray-700",
  recruitee:       "bg-gray-800 text-gray-200 border-gray-700",
  arbeitnow:       "bg-gray-800 text-gray-200 border-gray-700",
  aggregator:      "bg-gray-800 text-gray-300 border-gray-700",
};

const WORK_MODE_LABELS: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  on_site: "On-site",
  not_disclosed: "Flexible",
};

const WORK_MODE_STYLES: Record<string, string> = {
  remote:       "bg-gray-800/80 text-gray-200 border-gray-700",
  hybrid:       "bg-gray-800/80 text-gray-200 border-gray-700",
  on_site:      "bg-gray-800/80 text-gray-200 border-gray-700",
  not_disclosed:"bg-gray-900 text-gray-400 border-gray-800",
};

const EMP_TYPE_LABELS: Record<string, string> = {
  full_time:    "Full-time",
  part_time:    "Part-time",
  contract:     "Contract",
  internship:   "Internship",
  not_disclosed:"Not Disclosed",
};

export function HirePulseJobModal({ job, onClose }: HirePulseJobModalProps) {
  if (!job) return null;

  const hasRealPubDate = !!job.publication_date;
  const pubDate = job.publication_date || job.first_seen_at;
  const pubDateFormatted = pubDate
    ? new Date(pubDate).toLocaleDateString(undefined, {
        month: "short", day: "numeric", year: "numeric",
      })
    : "—";
  const pubDateLabel = hasRealPubDate ? "Posted" : "First Seen";

  const lastChecked = new Date(job.last_checked_at).toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const platform = job.platform?.toLowerCase() || "aggregator";
  const platformLabel = (job.source_name || platform).toUpperCase();
  const platformStyle = PLATFORM_COLORS[platform] || PLATFORM_COLORS["aggregator"];
  const workModeLabel = WORK_MODE_LABELS[job.work_mode] ?? job.work_mode;
  const workModeStyle = WORK_MODE_STYLES[job.work_mode] ?? WORK_MODE_STYLES["not_disclosed"];
  const empTypeLabel = EMP_TYPE_LABELS[job.employment_type] ?? job.employment_type.replace("_", " ");
  const hasSalary = job.salary_display !== "Not disclosed";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl bg-black/95 border border-gray-800
                      rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-800 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`text-[10px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded border ${platformStyle}`}>
                {platformLabel}
              </span>
              <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded border ${workModeStyle}`}>
                {workModeLabel}
              </span>
              {job.employment_type !== "not_disclosed" && (
                <span className="text-[11px] text-gray-400 bg-gray-900 px-2.5 py-0.5 rounded border border-gray-800">
                  {empTypeLabel}
                </span>
              )}
              {job.location_category === "india_office" && (
                <span className="text-[11px] font-medium text-gray-300 bg-gray-900 border border-gray-800 px-2.5 py-0.5 rounded flex items-center gap-1">
                  <span>🇮🇳</span>
                  <span>India Office</span>
                </span>
              )}
              {job.location_category === "remote_india" && (
                <span className="text-[11px] font-medium text-gray-300 bg-gray-900 border border-gray-800 px-2.5 py-0.5 rounded flex items-center gap-1">
                  <span>🇮🇳</span>
                  <span>Remote (India)</span>
                </span>
              )}
              {job.location_category === "apac_worldwide" && (
                <span className="text-[11px] font-medium text-gray-300 bg-gray-900 border border-gray-800 px-2.5 py-0.5 rounded flex items-center gap-1">
                  <span>🌏</span>
                  <span>APAC / Global</span>
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-semibold text-white leading-snug mb-2">
              {job.title}
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="font-semibold text-white">{job.company_name}</span>
              <span className="flex items-center gap-1 text-gray-400 text-xs">
                <MapPin className="w-3.5 h-3.5 text-gray-500" />
                {job.location_display}
              </span>
              {hasSalary && (
                <span className="flex items-center gap-1 text-gray-300 font-medium text-xs">
                  <Banknote className="w-3.5 h-3.5 text-gray-400" />
                  {job.salary_display}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-gray-300 text-sm leading-relaxed">
          {/* Source attribution row */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-950/60 border border-gray-800 text-xs flex-wrap">
            <div className="flex items-center gap-2 text-gray-300">
              <ShieldCheck className="w-4 h-4 text-white shrink-0" />
              <span>
                Source: <strong className="text-white">{job.source_name || job.source_id}</strong>
                {platform !== "aggregator" && <span className="text-gray-400"> (ATS Direct Feed)</span>}
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-500" />
                Verified {lastChecked}
              </span>
            </div>
          </div>

          {/* Registration & Compensation Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-gray-950/60 border border-gray-800 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <span className="text-[10px] text-gray-500 block uppercase font-medium">{pubDateLabel}:</span>
                <span className="font-semibold text-white">{pubDateFormatted}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <span className="text-[10px] text-gray-500 block uppercase font-medium">Deadline:</span>
                <span className={`font-semibold ${job.application_deadline ? "text-white" : "text-gray-500"}`}>
                  {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Open until filled"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <span className="text-[10px] text-gray-500 block uppercase font-medium">Salary / CTC:</span>
                <span className="font-semibold text-white">
                  {job.salary_display && job.salary_display !== "Not disclosed" ? job.salary_display : "Competitive / Industry Standard"}
                </span>
              </div>
            </div>
          </div>

          {/* Job description */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Job Description & Details
            </h4>
            {job.description ? (
              <div
                className="prose prose-invert max-w-none prose-sm prose-p:leading-relaxed
                           prose-headings:text-white prose-headings:font-semibold
                           prose-li:text-gray-300 prose-strong:text-white"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            ) : job.description_plain ? (
              <p className="whitespace-pre-line text-gray-300">{job.description_plain}</p>
            ) : (
              <p className="text-gray-500 italic text-sm">
                No detailed description is included in this feed.
                View the complete listing on the company&apos;s official career page.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-gray-800 bg-black/60 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[11px] text-gray-500 hidden sm:block">
            Always verify credentials independently before applying.
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white
                         rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            <a
              href={job.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-b from-white via-white/95 to-white/60
                         text-black font-medium text-xs rounded-lg shadow-md
                         transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Globe className="w-3.5 h-3.5" />
              Apply on Official Site
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
