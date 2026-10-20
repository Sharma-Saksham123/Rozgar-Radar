import { JobListResponse, JobFilterOptions, JobListing, SourceStatusSummary, SyncLogItem } from "./types";

const getApiBase = () => {
  if (process.env.NEXT_PUBLIC_HIREPULSE_API_URL) {
    return process.env.NEXT_PUBLIC_HIREPULSE_API_URL;
  }
  return "/api/hirepulse";
};

export interface FetchJobsParams {
  keyword?: string;
  company?: string;
  location?: string;
  work_mode?: string;
  employment_type?: string;
  source_id?: string;
  sort_by?: string;
  india_feed?: boolean;
  location_category?: string;
  page?: number;
  page_size?: number;
}

export async function fetchJobs(params: FetchJobsParams = {}): Promise<JobListResponse> {
  // If running on server, we can query SQLite directly for zero latency
  if (typeof window === "undefined") {
    try {
      const { queryJobsFromDb } = await import("./sqlite-service");
      return queryJobsFromDb(params);
    } catch {
      // fallback to fetch below
    }
  }

  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.company) query.set("company", params.company);
  if (params.location) query.set("location", params.location);
  if (params.work_mode) query.set("work_mode", params.work_mode);
  if (params.employment_type) query.set("employment_type", params.employment_type);
  if (params.source_id) query.set("source_id", params.source_id);
  if (params.sort_by) query.set("sort_by", params.sort_by);
  if (params.india_feed !== undefined) query.set("india_feed", params.india_feed ? "true" : "false");
  if (params.location_category) query.set("location_category", params.location_category);
  if (params.page) query.set("page", params.page.toString());
  if (params.page_size) query.set("page_size", params.page_size.toString());

  const base = getApiBase();
  const url = `${base}/jobs?${query.toString()}`;
  const res = await fetch(url, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchFilterOptions(): Promise<JobFilterOptions> {
  if (typeof window === "undefined") {
    try {
      const { queryFiltersFromDb } = await import("./sqlite-service");
      return queryFiltersFromDb();
    } catch {
      // fallback
    }
  }

  const base = getApiBase();
  const res = await fetch(`${base}/filters`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch filters: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchJobById(id: string): Promise<JobListing> {
  if (typeof window === "undefined") {
    try {
      const { queryJobByIdFromDb } = await import("./sqlite-service");
      const job = queryJobByIdFromDb(id);
      if (job) return job;
    } catch {
      // fallback
    }
  }

  const base = getApiBase();
  const res = await fetch(`${base}/jobs/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Job not found: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchSources(): Promise<SourceStatusSummary[]> {
  if (typeof window === "undefined") {
    try {
      const { querySourcesFromDb } = await import("./sqlite-service");
      return querySourcesFromDb();
    } catch {
      // fallback
    }
  }

  const base = getApiBase();
  const res = await fetch(`${base}/sources`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch sources: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchSyncLogs(): Promise<SyncLogItem[]> {
  if (typeof window === "undefined") {
    try {
      const { querySyncLogsFromDb } = await import("./sqlite-service");
      return querySyncLogsFromDb(20);
    } catch {
      // fallback
    }
  }

  const base = getApiBase();
  const res = await fetch(`${base}/sync/logs?limit=20`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch sync logs: ${res.statusText}`);
  }
  return res.json();
}

export async function triggerProtectedSync(sourceId?: string, adminKey?: string): Promise<any> {
  const base = getApiBase();
  const url = sourceId 
    ? `${base}/sync?source_id=${encodeURIComponent(sourceId)}`
    : `${base}/sync`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (adminKey) {
    headers["X-Admin-Key"] = adminKey;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Sync trigger failed with status ${res.status}`);
  }
  return res.json();
}

export interface SyncStatusData {
  is_sync_running: boolean;
  cadence_hours: number;
  cadence_seconds: number;
  last_sync_at: string | null;
  next_sync_at: string;
  seconds_remaining: number;
}

export async function fetchSyncStatus(): Promise<SyncStatusData> {
  const base = getApiBase();
  const res = await fetch(`${base}/sync/status`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch sync status: ${res.statusText}`);
  }
  return res.json();
}
