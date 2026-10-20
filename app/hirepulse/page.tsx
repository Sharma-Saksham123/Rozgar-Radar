"use client";

import { useState, useEffect } from "react";
import { HirePulseHero } from "@/components/hirepulse/HirePulseHero";
import { HirePulseSearchBar } from "@/components/hirepulse/HirePulseSearchBar";
import { HirePulseJobFilters } from "@/components/hirepulse/HirePulseJobFilters";
import { HirePulseJobCard } from "@/components/hirepulse/HirePulseJobCard";
import { HirePulseJobModal } from "@/components/hirepulse/HirePulseJobModal";
import { HirePulseEmbedModal } from "@/components/hirepulse/HirePulseEmbedModal";
import { HirePulseSyncBanner } from "@/components/hirepulse/HirePulseSyncBanner";
import { fetchJobs, fetchFilterOptions } from "@/lib/hirepulse/api";
import { JobListing, JobFilterOptions } from "@/lib/hirepulse/types";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Code2 } from "lucide-react";

export default function HirePulsePage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [company, setCompany] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [sortBy, setSortBy] = useState("verified");
  const [indiaFeed, setIndiaFeed] = useState(true);
  const [locationCategory, setLocationCategory] = useState("");
  const [filterOptions, setFilterOptions] = useState<JobFilterOptions | null>(null);

  // Modals state
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshFeed = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Load filter options on mount
  useEffect(() => {
    fetchFilterOptions()
      .then(setFilterOptions)
      .catch((err) => console.error("Error loading filter options:", err));
  }, []);

  // Fetch jobs whenever query parameters change
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    fetchJobs({
      keyword,
      location,
      work_mode: workMode,
      company,
      employment_type: employmentType,
      source_id: sourceId,
      sort_by: sortBy,
      india_feed: indiaFeed ? true : undefined,
      location_category: locationCategory || undefined,
      page: currentPage,
      page_size: 12,
    })
      .then((data) => {
        if (!isCancelled) {
          setJobs(data.items);
          setTotalJobs(data.total);
          setTotalPages(data.total_pages);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message || "Failed to load jobs");
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [keyword, location, workMode, company, employmentType, sourceId, sortBy, indiaFeed, locationCategory, currentPage, refreshKey]);

  const handleSearch = (kw: string, loc: string) => {
    setKeyword(kw);
    setLocation(loc);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setKeyword("");
    setLocation("");
    setWorkMode("");
    setCompany("");
    setEmploymentType("");
    setSourceId("");
    setSortBy("verified");
    setIndiaFeed(true);
    setLocationCategory("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero section */}
      <HirePulseHero totalJobs={totalJobs} totalSources={filterOptions?.sources.length || 8} />

      {/* Automated 12-Hour Sync Banner */}
      <HirePulseSyncBanner
        onRefreshFeed={handleRefreshFeed}
        isRefreshingFeed={loading}
      />

      {/* Search Bar */}
      <div className="mb-6 -mt-2">
        <HirePulseSearchBar
          initialKeyword={keyword}
          initialLocation={location}
          onSearch={handleSearch}
        />
      </div>

      {/* Filter controls */}
      <HirePulseJobFilters
        filterOptions={filterOptions}
        selectedWorkMode={workMode}
        selectedCompany={company}
        selectedEmploymentType={employmentType}
        selectedSourceId={sourceId}
        selectedSortBy={sortBy}
        selectedLocationCategory={locationCategory}
        indiaFeedOnly={indiaFeed}
        onWorkModeChange={(m) => { setWorkMode(m); setCurrentPage(1); }}
        onCompanyChange={(c) => { setCompany(c); setCurrentPage(1); }}
        onEmploymentTypeChange={(t) => { setEmploymentType(t); setCurrentPage(1); }}
        onSourceChange={(s) => { setSourceId(s); setCurrentPage(1); }}
        onSortByChange={(s) => { setSortBy(s); setCurrentPage(1); }}
        onLocationCategoryChange={(cat) => { setLocationCategory(cat); setCurrentPage(1); }}
        onToggleIndiaFeed={() => { setIndiaFeed((prev) => !prev); setCurrentPage(1); }}
        onReset={handleResetFilters}
      />

      {/* Results summary bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs sm:text-sm text-gray-400">
        <div>
          Showing <strong className="text-white">{jobs.length}</strong> of{" "}
          <strong className="text-white">{totalJobs}</strong> verified openings
          {indiaFeed && <span className="text-white font-medium"> (🇮🇳 India feed)</span>}
          {locationCategory && <span className="text-gray-300 font-medium"> ({locationCategory.replace('_', ' ')})</span>}
          {keyword && <span> matching &ldquo;{keyword}&rdquo;</span>}
          {location && <span> in &ldquo;{location}&rdquo;</span>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEmbedOpen(true)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Embed widget</span>
          </button>
          <span>•</span>
          <div>Page {currentPage} of {totalPages}</div>
        </div>
      </div>

      {/* Job Listings Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
          <p className="text-sm">Fetching verified job listings from ATS database...</p>
        </div>
      ) : error ? (
        <div className="py-16 rounded-2xl border border-gray-800 bg-black/60 text-center p-8 max-w-xl mx-auto backdrop-blur-sm">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white mb-1">Unable to Load Jobs</h3>
          <p className="text-sm text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => handleResetFilters()}
            className="px-4 py-2 bg-white hover:bg-gray-200 text-black rounded-lg text-xs font-medium cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-20 rounded-2xl border border-gray-800 bg-black/60 text-center p-8 max-w-md mx-auto backdrop-blur-sm">
          <h3 className="text-lg font-medium text-white mb-2">No Matches Found</h3>
          <p className="text-sm text-gray-400 mb-6">
            We couldn&apos;t find any verified listings matching your specific criteria.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-white hover:bg-gray-200 text-black rounded-lg text-xs font-medium cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {jobs.map((job) => (
            <HirePulseJobCard
              key={job.id}
              job={job}
              onSelect={(j) => setSelectedJob(j)}
            />
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {!loading && totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-xs font-medium text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <span className="text-xs font-medium text-gray-400 px-3">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-xs font-medium text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Detail slide-over modal */}
      <HirePulseJobModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />

      {/* Website Integration / Embed modal */}
      <HirePulseEmbedModal
        isOpen={isEmbedOpen}
        onClose={() => setIsEmbedOpen(false)}
      />
    </div>
  );
}
