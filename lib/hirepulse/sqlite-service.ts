import path from "path";
import fs from "fs";
import type {
  JobListing,
  JobListResponse,
  JobFilterOptions,
  SourceStatusSummary,
  SyncLogItem,
} from "./types";

// Find SQLite DB file at project root or backend
function getDbPath(): string {
  const rootPath = path.resolve(process.cwd(), "jobs.db");
  if (fs.existsSync(rootPath)) return rootPath;
  const backendPath = path.resolve(process.cwd(), "backend", "jobs.db");
  if (fs.existsSync(backendPath)) return backendPath;
  return rootPath;
}

let dbInstance: any = null;

function getDb(): any {
  if (dbInstance) return dbInstance;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DatabaseSync } = require("node:sqlite");
    const dbPath = getDbPath();
    dbInstance = new DatabaseSync(dbPath, { readOnly: true });
    return dbInstance;
  } catch (err) {
    console.warn("Could not open node:sqlite DatabaseSync:", err);
    return null;
  }
}

export function formatSalaryDisplay(
  min: number | null,
  max: number | null,
  currency: string | null,
  period: string | null
): string {
  if (min === null || min === undefined) {
    return "Competitive / Industry Standard";
  }

  const currCode = (currency || "INR").toUpperCase();
  const currSymbols: Record<string, string> = {
    USD: "$",
    INR: "₹",
    EUR: "€",
    GBP: "£",
  };
  const sym = currSymbols[currCode] ?? `${currCode} `;

  // If INR and under 100, treated as Lakhs per Annum (LPA)
  if (currCode === "INR" && min < 100) {
    if (max && max <= 200) {
      return `₹${min.toFixed(1)} – ₹${max.toFixed(1)} LPA`;
    } else if (max && max > 200) {
      return `₹${min.toFixed(1)} LPA+`;
    }
    return `₹${min.toFixed(1)} LPA`;
  }

  const periodStr = period ? `/${period}` : "/yr";
  if (max !== null && max !== undefined && max > min) {
    return `${sym}${min.toLocaleString()} – ${sym}${max.toLocaleString()} ${periodStr}`.trim();
  }
  return `${sym}${min.toLocaleString()}+ ${periodStr}`.trim();
}

export function formatLocationDisplay(
  raw: string | null,
  city: string | null,
  country: string | null
): string {
  if (raw && raw.trim()) return raw.trim();
  const parts = [city, country].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  return "Location Flexible / Not Disclosed";
}

export function formatLocationBadge(category: string | null): string {
  const map: Record<string, string> = {
    india_office: "🇮🇳 India Office",
    remote_india: "🌐 Remote (India Eligible)",
    apac_worldwide: "🌏 Global / Remote",
    international_only: "✈️ International",
  };
  return map[category || ""] ?? "Global";
}

function rowToJobListing(row: any, sourceNameMap: Map<string, { name: string; platform: string }>): JobListing {
  const sourceMeta = sourceNameMap.get(row.source_id);
  const salaryDisplay = formatSalaryDisplay(
    row.salary_min,
    row.salary_max,
    row.salary_currency,
    row.salary_pay_period
  );
  const locationDisplay = formatLocationDisplay(
    row.location_raw,
    row.city,
    row.country
  );
  const locationBadge = formatLocationBadge(row.location_category);

  return {
    id: String(row.id),
    source_id: String(row.source_id),
    provider_job_id: row.provider_job_id ?? undefined,
    title: row.title || "Untitled Opportunity",
    company_name: row.company_name || "Company",
    company_domain: row.company_domain ?? undefined,
    location_raw: row.location_raw ?? undefined,
    city: row.city ?? undefined,
    country: row.country ?? undefined,
    work_mode: row.work_mode || "not_disclosed",
    employment_type: row.employment_type || "not_disclosed",
    department: row.department ?? undefined,
    salary_min: row.salary_min !== null ? Number(row.salary_min) : undefined,
    salary_max: row.salary_max !== null ? Number(row.salary_max) : undefined,
    salary_currency: row.salary_currency ?? undefined,
    salary_pay_period: row.salary_pay_period ?? undefined,
    salary_display: salaryDisplay,
    location_display: locationDisplay,
    location_badge: locationBadge,
    application_url: row.application_url || row.canonical_url || "#",
    publication_date: row.publication_date ?? undefined,
    application_deadline: row.application_deadline ?? undefined,
    first_seen_at: row.first_seen_at || row.created_at || new Date().toISOString(),
    last_seen_at: row.last_seen_at || row.updated_at || new Date().toISOString(),
    last_checked_at: row.last_checked_at || new Date().toISOString(),
    freshness_status: row.freshness_status || "active",
    is_duplicate: Boolean(row.is_duplicate),
    source_name: sourceMeta?.name || row.source_id,
    platform: sourceMeta?.platform || undefined,
    description: row.description ?? undefined,
    description_plain: row.description_plain ?? undefined,
    required_qualifications: row.required_qualifications ?? undefined,
    location_category: row.location_category || "international_only",
    is_india_eligible: Boolean(row.is_india_eligible),
    location_eligibility_reason: row.location_eligibility_reason ?? undefined,
  };
}

export interface QueryJobsParams {
  keyword?: string;
  company?: string;
  location?: string;
  work_mode?: string;
  employment_type?: string;
  source_id?: string;
  sort_by?: string;
  location_category?: string;
  page?: number;
  page_size?: number;
}

export function queryJobsFromDb(params: QueryJobsParams = {}): JobListResponse {
  const db = getDb();
  if (!db) {
    return { total: 0, page: 1, page_size: 20, total_pages: 0, items: [] };
  }

  // Build sources lookup
  const sources = db.prepare("SELECT id, name, ats_platform FROM job_sources").all() as any[];
  const sourceMap = new Map<string, { name: string; platform: string }>();
  for (const s of sources) {
    sourceMap.set(s.id, { name: s.name, platform: s.ats_platform });
  }

  const conditions: string[] = ["is_duplicate = 0"];
  const args: any[] = [];

  if (params.keyword && params.keyword.trim()) {
    const term = `%${params.keyword.trim().toLowerCase()}%`;
    conditions.push(
      "(LOWER(title) LIKE ? OR LOWER(company_name) LIKE ? OR LOWER(COALESCE(description_plain, '')) LIKE ? OR LOWER(COALESCE(location_raw, '')) LIKE ?)"
    );
    args.push(term, term, term, term);
  }

  if (params.company && params.company.trim()) {
    conditions.push("LOWER(company_name) = ?");
    args.push(params.company.trim().toLowerCase());
  }

  if (params.location && params.location.trim()) {
    const locTerm = `%${params.location.trim().toLowerCase()}%`;
    conditions.push("(LOWER(COALESCE(location_raw, '')) LIKE ? OR LOWER(COALESCE(city, '')) LIKE ?)");
    args.push(locTerm, locTerm);
  }

  if (params.work_mode && params.work_mode.trim()) {
    conditions.push("work_mode = ?");
    args.push(params.work_mode.trim().toLowerCase());
  }

  if (params.employment_type && params.employment_type.trim()) {
    conditions.push("employment_type = ?");
    args.push(params.employment_type.trim().toLowerCase());
  }

  if (params.source_id && params.source_id.trim()) {
    conditions.push("source_id = ?");
    args.push(params.source_id.trim());
  }

  if (params.location_category && params.location_category.trim()) {
    conditions.push("location_category = ?");
    args.push(params.location_category.trim());
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Count query
  const countSql = `SELECT COUNT(*) as cnt FROM job_listings ${whereClause}`;
  const countRow = db.prepare(countSql).get(...args) as { cnt: number };
  const total = countRow?.cnt ?? 0;

  // Sorting
  let orderBy = "ORDER BY created_at DESC";
  switch (params.sort_by) {
    case "salary_desc":
      orderBy = "ORDER BY salary_min DESC NULLS LAST, created_at DESC";
      break;
    case "company":
      orderBy = "ORDER BY company_name ASC, created_at DESC";
      break;
    case "title":
      orderBy = "ORDER BY title ASC";
      break;
    case "verified":
    case "newest":
    default:
      orderBy = "ORDER BY publication_date DESC NULLS LAST, created_at DESC";
      break;
  }

  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(1, params.page_size || 20));
  const offset = (page - 1) * pageSize;
  const totalPages = Math.ceil(total / pageSize);

  const selectSql = `
    SELECT * FROM job_listings
    ${whereClause}
    ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const rows = db.prepare(selectSql).all(...args, pageSize, offset) as any[];
  const items = rows.map((r) => rowToJobListing(r, sourceMap));

  return {
    total,
    page,
    page_size: pageSize,
    total_pages: totalPages,
    items,
  };
}

export function queryJobByIdFromDb(id: string): JobListing | null {
  const db = getDb();
  if (!db) return null;

  const sources = db.prepare("SELECT id, name, ats_platform FROM job_sources").all() as any[];
  const sourceMap = new Map<string, { name: string; platform: string }>();
  for (const s of sources) {
    sourceMap.set(s.id, { name: s.name, platform: s.ats_platform });
  }

  const row = db.prepare("SELECT * FROM job_listings WHERE id = ?").get(id);
  if (!row) return null;
  return rowToJobListing(row, sourceMap);
}

export function queryFiltersFromDb(): JobFilterOptions {
  const db = getDb();
  if (!db) {
    return {
      companies: [],
      locations: [],
      work_modes: ["remote", "hybrid", "on_site"],
      employment_types: ["full_time", "internship", "contract"],
      sources: [],
    };
  }

  const companiesRows = db.prepare(
    "SELECT DISTINCT company_name FROM job_listings WHERE is_duplicate = 0 AND company_name IS NOT NULL ORDER BY company_name ASC LIMIT 100"
  ).all() as any[];

  const sourcesRows = db.prepare(
    "SELECT DISTINCT js.id, js.name FROM job_sources js JOIN job_listings jl ON js.id = jl.source_id WHERE jl.is_duplicate = 0 ORDER BY js.name ASC"
  ).all() as any[];

  const indiaEligibleCountRow = db.prepare(
    "SELECT COUNT(*) as cnt FROM job_listings WHERE is_duplicate = 0 AND is_india_eligible = 1"
  ).get() as { cnt: number };

  return {
    companies: companiesRows.map((r) => r.company_name),
    locations: ["Bengaluru", "Delhi NCR", "Pune", "Hyderabad", "Mumbai", "Remote"],
    work_modes: ["remote", "hybrid", "on_site", "not_disclosed"],
    employment_types: ["full_time", "part_time", "contract", "internship"],
    sources: sourcesRows.map((r) => ({ id: r.id, name: r.name })),
    location_categories: ["india_office", "remote_india", "apac_worldwide", "international_only"],
    india_eligible_count: indiaEligibleCountRow?.cnt ?? 0,
  };
}

export function querySourcesFromDb(): SourceStatusSummary[] {
  const db = getDb();
  if (!db) return [];

  const rows = db.prepare(`
    SELECT
      js.id,
      js.name,
      js.source_type,
      js.ats_platform,
      js.official_domain,
      js.career_page_url,
      js.permission_status,
      js.auth_requirement,
      js.rate_limit_notes,
      js.last_sync_at,
      js.last_successful_sync_at,
      js.sync_status,
      js.last_error,
      js.is_active,
      COUNT(jl.id) as total_jobs_count
    FROM job_sources js
    LEFT JOIN job_listings jl ON js.id = jl.source_id AND jl.is_duplicate = 0
    GROUP BY js.id
    ORDER BY js.name ASC
  `).all() as any[];

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    source_type: r.source_type || "ats",
    ats_platform: r.ats_platform ?? undefined,
    official_domain: r.official_domain ?? undefined,
    career_page_url: r.career_page_url ?? undefined,
    permission_status: r.permission_status || "approved",
    auth_requirement: r.auth_requirement || "none",
    rate_limit_notes: r.rate_limit_notes ?? undefined,
    last_sync_at: r.last_sync_at ?? undefined,
    last_successful_sync_at: r.last_successful_sync_at ?? undefined,
    sync_status: r.sync_status || "never_run",
    last_error: r.last_error ?? undefined,
    is_active: Boolean(r.is_active),
    total_jobs: Number(r.total_jobs_count || 0),
    india_jobs: Number(r.total_jobs_count || 0),
  }));
}

export function querySyncLogsFromDb(limit = 20): SyncLogItem[] {
  const db = getDb();
  if (!db) return [];

  const rows = db.prepare(`
    SELECT
      sl.*,
      js.name as source_name
    FROM sync_logs sl
    LEFT JOIN job_sources js ON sl.source_id = js.id
    ORDER BY sl.started_at DESC
    LIMIT ?
  `).all(limit) as any[];

  return rows.map((r) => ({
    id: r.id,
    source_id: r.source_id,
    source_name: r.source_name || r.source_id,
    trigger_type: r.sync_trigger || "scheduled",
    status: r.status || "success",
    started_at: r.started_at,
    completed_at: r.completed_at ?? undefined,
    duration_ms: Math.round(Number(r.duration_seconds || 1) * 1000),
    jobs_fetched: Number(r.jobs_fetched || 0),
    jobs_created: Number(r.jobs_created || 0),
    jobs_updated: Number(r.jobs_updated || 0),
    duplicates_found: Number(r.duplicates_detected || 0),
    error_message: r.error_message ?? undefined,
  }));
}
