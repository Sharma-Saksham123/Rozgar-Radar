"use client";

import { JobFilterOptions } from "@/lib/hirepulse/types";
import { RotateCcw, Globe2 } from "lucide-react";

interface HirePulseJobFiltersProps {
  filterOptions: JobFilterOptions | null;
  selectedWorkMode: string;
  selectedCompany: string;
  selectedEmploymentType: string;
  selectedSourceId: string;
  selectedSortBy: string;
  selectedLocationCategory: string;
  indiaFeedOnly: boolean;
  onWorkModeChange: (mode: string) => void;
  onCompanyChange: (company: string) => void;
  onEmploymentTypeChange: (type: string) => void;
  onSourceChange: (sourceId: string) => void;
  onSortByChange: (sortBy: string) => void;
  onLocationCategoryChange: (category: string) => void;
  onToggleIndiaFeed: () => void;
  onReset: () => void;
}

export function HirePulseJobFilters({
  filterOptions,
  selectedWorkMode,
  selectedCompany,
  selectedEmploymentType,
  selectedSourceId,
  selectedSortBy,
  selectedLocationCategory,
  indiaFeedOnly,
  onWorkModeChange,
  onCompanyChange,
  onEmploymentTypeChange,
  onSourceChange,
  onSortByChange,
  onLocationCategoryChange,
  onToggleIndiaFeed,
  onReset,
}: HirePulseJobFiltersProps) {
  const hasActiveFilters = Boolean(
    selectedWorkMode ||
    selectedCompany ||
    selectedEmploymentType ||
    selectedSourceId ||
    selectedLocationCategory ||
    indiaFeedOnly ||
    (selectedSortBy && selectedSortBy !== "verified")
  );

  return (
    <div className="w-full rounded-xl border border-gray-800 bg-black/60 backdrop-blur-md p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Work Mode & India Feed Toggle Pills */}
      <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
        {/* India Feed Highlight Switch */}
        <button
          onClick={onToggleIndiaFeed}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            indiaFeedOnly
              ? "bg-white text-black shadow-sm"
              : "bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700"
          }`}
          title="Filter for India Office, Remote India, and verified APAC/Worldwide feeds"
        >
          <span>🇮🇳</span>
          <span>India Feed</span>
          {filterOptions?.india_eligible_count !== undefined && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
              indiaFeedOnly ? "bg-gray-200 text-black" : "bg-gray-800 text-gray-300"
            }`}>
              {filterOptions.india_eligible_count}
            </span>
          )}
        </button>

        <div className="h-4 w-px bg-gray-800 hidden sm:block" />

        <span className="text-xs font-medium text-gray-400 mr-1 flex items-center gap-1">
          <Globe2 className="w-3.5 h-3.5" />
          Mode:
        </span>
        {[
          { label: "All", value: "" },
          { label: "Remote", value: "remote" },
          { label: "Hybrid", value: "hybrid" },
          { label: "On-site", value: "on_site" },
        ].map((item) => {
          const isActive = selectedWorkMode === item.value;
          return (
            <button
              key={item.value}
              onClick={() => onWorkModeChange(item.value)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                isActive
                  ? "bg-gray-800 text-white border border-gray-700"
                  : "bg-gray-950/60 text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Dropdown Filters */}
      <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
        {/* Company Dropdown */}
        <select
          value={selectedCompany}
          onChange={(e) => onCompanyChange(e.target.value)}
          className="text-xs bg-gray-950/80 border border-gray-800 text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-white/40 cursor-pointer"
        >
          <option value="" className="bg-black text-white">All Companies</option>
          {filterOptions?.companies.map((comp) => (
            <option key={comp} value={comp} className="bg-black text-white">
              {comp}
            </option>
          ))}
        </select>

        {/* Employment Type */}
        <select
          value={selectedEmploymentType}
          onChange={(e) => onEmploymentTypeChange(e.target.value)}
          className="text-xs bg-gray-950/80 border border-gray-800 text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-white/40 cursor-pointer"
        >
          <option value="" className="bg-black text-white">All Types</option>
          <option value="full_time" className="bg-black text-white">Full-time</option>
          <option value="part_time" className="bg-black text-white">Part-time</option>
          <option value="contract" className="bg-black text-white">Contract</option>
          <option value="internship" className="bg-black text-white">Internship</option>
        </select>

        {/* Source Dropdown */}
        <select
          value={selectedSourceId}
          onChange={(e) => onSourceChange(e.target.value)}
          className="text-xs bg-gray-950/80 border border-gray-800 text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-white/40 cursor-pointer"
        >
          <option value="" className="bg-black text-white">All Sources</option>
          {filterOptions?.sources.map((src) => (
            <option key={src.id} value={src.id} className="bg-black text-white">
              {src.name}
            </option>
          ))}
        </select>

        {/* Location Scope Dropdown */}
        <select
          value={selectedLocationCategory}
          onChange={(e) => onLocationCategoryChange(e.target.value)}
          className="text-xs bg-gray-950/80 border border-gray-800 text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-white/40 cursor-pointer"
        >
          <option value="" className="bg-black text-white">All Locations</option>
          <option value="india_office" className="bg-black text-white">🇮🇳 India Office</option>
          <option value="remote_india" className="bg-black text-white">🇮🇳 Remote (India)</option>
          <option value="apac_worldwide" className="bg-black text-white">🌏 APAC / Global</option>
          <option value="international_only" className="bg-black text-white">🌍 International</option>
        </select>

        {/* Sort By Dropdown */}
        <select
          value={selectedSortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="text-xs bg-gray-950/80 border border-gray-800 text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-white/40 cursor-pointer"
        >
          <option value="verified" className="bg-black text-white">ATS Verified First</option>
          <option value="newest" className="bg-black text-white">Newest First</option>
          <option value="salary_desc" className="bg-black text-white">Highest Salary</option>
          <option value="company" className="bg-black text-white">Company (A-Z)</option>
          <option value="title" className="bg-black text-white">Title (A-Z)</option>
        </select>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white font-medium px-2 py-1 transition-colors cursor-pointer"
            title="Reset filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
