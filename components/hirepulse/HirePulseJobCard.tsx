"use client";

import { JobListing } from "@/lib/hirepulse/types";
import { MapPin, Building2, Calendar, ExternalLink, CheckCircle2, Clock, Banknote, Briefcase } from "lucide-react";

interface HirePulseJobCardProps {
  job: JobListing;
  onSelect: (job: JobListing) => void;
}

const PLATFORM_CONFIG: Record<string, { label: string; color: string }> = {
  greenhouse:      { label: "Greenhouse",      color: "bg-gray-800 text-gray-200 border-gray-700" },
  lever:           { label: "Lever",           color: "bg-gray-800 text-gray-200 border-gray-700" },
  ashby:           { label: "Ashby",           color: "bg-gray-800 text-gray-200 border-gray-700" },
  smartrecruiters: { label: "SmartRecruiters", color: "bg-gray-800 text-gray-200 border-gray-700" },
  workday:         { label: "Workday",         color: "bg-gray-800 text-gray-200 border-gray-700" },
  workable:        { label: "Workable",        color: "bg-gray-800 text-gray-200 border-gray-700" },
  recruitee:       { label: "Recruitee",       color: "bg-gray-800 text-gray-200 border-gray-700" },
  arbeitnow:       { label: "Arbeitnow",       color: "bg-gray-800 text-gray-200 border-gray-700" },
  aggregator:      { label: "Aggregator",      color: "bg-gray-800 text-gray-300 border-gray-700" },
};

const WORK_MODE_STYLES: Record<string, string> = {
  remote:       "bg-gray-800/80 text-gray-200 border-gray-700",
  hybrid:       "bg-gray-800/80 text-gray-200 border-gray-700",
  on_site:      "bg-gray-800/80 text-gray-200 border-gray-700",
  not_disclosed:"bg-gray-900 text-gray-400 border-gray-800",
};

const WORK_MODE_LABELS: Record<string, string> = {
  remote:       "Remote",
  hybrid:       "Hybrid",
  on_site:      "On-site",
  not_disclosed:"Flexible",
};

const EMP_TYPE_LABELS: Record<string, string> = {
  full_time:    "Full-time",
  part_time:    "Part-time",
  contract:     "Contract",
  internship:   "Internship",
  not_disclosed:"",
};

export function HirePulseJobCard({ job, onSelect }: HirePulseJobCardProps) {
  const hasRealPubDate = !!job.publication_date;
  const firstDate = job.publication_date || job.first_seen_at;
  const firstDateFormatted = firstDate
    ? new Date(firstDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const firstDateLabel = hasRealPubDate ? "Posted" : "First Seen";

  const lastDateFormatted = job.application_deadline
    ? new Date(job.application_deadline).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const platform = job.platform?.toLowerCase() || "aggregator";
  const platformCfg = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG["aggregator"];

  const workModeStyle = WORK_MODE_STYLES[job.work_mode] ?? WORK_MODE_STYLES["not_disclosed"];
  const workModeLabel = WORK_MODE_LABELS[job.work_mode] ?? job.work_mode;
  const empTypeLabel  = EMP_TYPE_LABELS[job.employment_type] ?? "";

  const salaryDisplay = job.salary_display && job.salary_display !== "Not disclosed"
    ? job.salary_display
    : "Competitive / Standard";

  return (
    <div
      className="group relative rounded-xl border border-gray-800 bg-black/60 p-5 sm:p-6
                 flex flex-col justify-between overflow-hidden backdrop-blur-sm
                 hover:border-gray-600 hover:bg-gray-950/80 transition-all duration-300"
    >
      <div className="flex flex-col gap-3">
        {/* Top row: Platform badge + work mode badge + freshness */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded border ${platformCfg.color}`}>
              {platformCfg.label}
            </span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${workModeStyle}`}>
              {workModeLabel}
            </span>
            {empTypeLabel && (
              <span className="text-[10px] text-gray-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-800 flex items-center gap-1">
                <Briefcase className="w-2.5 h-2.5" />
                {empTypeLabel}
              </span>
            )}
            {job.location_category === "india_office" && (
              <span className="text-[10px] font-medium text-gray-300 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded flex items-center gap-1">
                <span>🇮🇳</span>
                <span>India Office</span>
              </span>
            )}
            {job.location_category === "remote_india" && (
              <span className="text-[10px] font-medium text-gray-300 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded flex items-center gap-1">
                <span>🇮🇳</span>
                <span>Remote (India)</span>
              </span>
            )}
            {job.location_category === "apac_worldwide" && (
              <span className="text-[10px] font-medium text-gray-300 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded flex items-center gap-1">
                <span>🌏</span>
                <span>APAC / Global</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-300 shrink-0 font-medium">
            <CheckCircle2 className="w-3 h-3 text-white" />
            <span>Verified</span>
          </div>
        </div>

        {/* Job Title */}
        <h3
          onClick={() => onSelect(job)}
          className="text-base font-semibold text-white group-hover:text-white/90
                     transition-colors cursor-pointer line-clamp-2 leading-snug"
        >
          {job.title}
        </h3>

        {/* Company & Location */}
        <div className="flex flex-col gap-1 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 shrink-0 text-gray-500" />
            <span className="font-medium text-gray-200 truncate">{job.company_name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-500" />
            <span className="truncate">{job.location_display}</span>
          </div>
        </div>

        {/* Salary chip */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-900
                        border border-gray-800 text-gray-300 text-xs font-medium w-fit">
          <Banknote className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>{salaryDisplay}</span>
        </div>

        {/* Registration Dates */}
        {(firstDateFormatted || lastDateFormatted) && (
          <div className="pt-2.5 border-t border-gray-800/80 grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-gray-400 bg-gray-950/60 px-2.5 py-1.5 rounded-lg border border-gray-800">
              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-gray-500 block uppercase font-medium tracking-wider">{firstDateLabel}</span>
                <span className="font-medium text-white text-xs">{firstDateFormatted || "—"}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 bg-gray-950/60 px-2.5 py-1.5 rounded-lg border border-gray-800">
              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-gray-500 block uppercase font-medium tracking-wider">Deadline</span>
                <span className={`font-medium text-xs ${lastDateFormatted ? "text-gray-200" : "text-gray-500"}`}>
                  {lastDateFormatted || "Open until filled"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="pt-4 mt-3 flex items-center justify-between gap-3 border-t border-gray-800">
        <div className="text-[11px] text-gray-500 font-medium truncate">
          Official ATS Posting
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelect(job)}
            className="text-xs font-medium text-gray-400 hover:text-white px-2.5 py-1.5
                       rounded-md hover:bg-gray-800/60 transition-colors cursor-pointer"
          >
            Details
          </button>
          <a
            href={job.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-md
                       bg-white hover:bg-gray-200 text-black
                       shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            Apply
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
