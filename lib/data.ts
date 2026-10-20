import { isLocalMode, isSupabaseConfigured } from "./config";
import { MOCK_JOBS } from "./mock-jobs";
import * as local from "./local-store";
import { createClient } from "./supabase/server";
import type { Job, JobMatch, Profile } from "./types";

/**
 * Single data access layer. Uses Supabase when its env vars are present and
 * falls back to a local file-backed store otherwise, so the prototype runs
 * with zero configuration.
 */

export { isLocalMode };

export interface SessionUser {
  id: string;
  email: string;
}

export interface ProfileInput {
  full_name?: string | null;
  degree?: string | null;
  branch?: string | null;
  graduation_year?: number | null;
  min_percentage?: number | null;
  skills?: string[];
  location?: string | null;
}

/** Resolves the caller from the Supabase session, or the local header. */
export async function getSessionUser(
  request: Request,
): Promise<SessionUser | null> {
  if (isLocalMode()) {
    const id = request.headers.get("x-local-user-id");
    if (!id) return null;
    const user = local.getUser(id);
    if (!user) return null;
    return { id: user.id, email: user.email };
  }

  const supabase = await createClient();

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const {
      data: { user: bearerUser },
    } = await supabase.auth.getUser(token);
    if (bearerUser) {
      return { id: bearerUser.id, email: bearerUser.email ?? "" };
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  return { id: user.id, email: user.email ?? "" };
}

/** Local-mode sign in: creates the user on first use. */
export function localSignIn(email: string, fullName: string | null) {
  return local.findOrCreateUser(email, fullName);
}

export async function listJobs(): Promise<Job[]> {
  if (isLocalMode()) return MOCK_JOBS;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_JOBS;
    }
    return data as Job[];
  } catch (err) {
    console.warn("Supabase listJobs failed, falling back to mock jobs:", err);
    return MOCK_JOBS;
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  if (isLocalMode()) return local.getProfile(userId);

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    full_name: data.full_name,
    email: data.email,
    degree: data.degree,
    branch: data.branch,
    graduation_year: data.graduation_year,
    min_percentage: data.min_percentage,
    skills: data.skills ?? [],
    location: data.location,
    created_at: data.created_at,
  };
}

export async function saveProfile(
  userId: string,
  email: string,
  input: ProfileInput,
): Promise<Profile> {
  if (isLocalMode()) {
    return local.saveProfile(userId, {
      id: userId,
      full_name: input.full_name ?? null,
      email,
      degree: (input.degree as Profile["degree"]) ?? null,
      branch: input.branch ?? null,
      graduation_year: input.graduation_year ?? null,
      min_percentage: input.min_percentage ?? null,
      skills: input.skills ?? [],
      location: input.location ?? null,
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        email,
        full_name: input.full_name ?? null,
        degree: input.degree ?? null,
        branch: input.branch ?? null,
        graduation_year: input.graduation_year ?? null,
        min_percentage: input.min_percentage ?? null,
        skills: input.skills ?? [],
        location: input.location ?? null,
      },
      { onConflict: "id" },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    full_name: data.full_name,
    email: data.email,
    degree: data.degree,
    branch: data.branch,
    graduation_year: data.graduation_year,
    min_percentage: data.min_percentage,
    skills: data.skills ?? [],
    location: data.location,
    created_at: data.created_at,
  };
}

export async function getMatches(userId: string): Promise<JobMatch[]> {
  if (isLocalMode()) return local.getMatches(userId);

  const supabase = await createClient();
  const { data } = await supabase
    .from("job_matches")
    .select("*")
    .eq("user_id", userId);

  return (data ?? []) as JobMatch[];
}

export async function upsertMatches(
  userId: string,
  matches: Array<
    Omit<JobMatch, "id" | "user_id" | "created_at" | "updated_at">
  >,
): Promise<void> {
  if (isLocalMode()) {
    const existing = new Map(
      local.getMatches(userId).map((match) => [match.job_id, match]),
    );

    matches.forEach((match) => {
      existing.set(match.job_id, {
        id: existing.get(match.job_id)?.id ?? match.job_id,
        user_id: userId,
        job_id: match.job_id,
        status: match.status,
        reasons: match.reasons,
        explanation: match.explanation,
        score: match.score,
        created_at: existing.get(match.job_id)?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });

    local.upsertMatches(userId, Array.from(existing.values()));
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("job_matches")
    .upsert(
      matches.map((match) => ({ ...match, user_id: userId })),
      { onConflict: "user_id,job_id" },
    );

  if (error) throw new Error(error.message);
}

export async function getSaved(userId: string): Promise<string[]> {
  if (isLocalMode()) return local.listSaved(userId);

  const supabase = await createClient();
  const { data } = await supabase
    .from("saved_jobs")
    .select("job_id")
    .eq("user_id", userId);

  return (data ?? []).map((row) => row.job_id);
}

export async function setSaved(
  userId: string,
  jobId: string,
  saved: boolean,
): Promise<void> {
  if (isLocalMode()) {
    local.setSaved(userId, jobId, saved);
    return;
  }

  const supabase = await createClient();

  if (saved) {
    const { error } = await supabase
      .from("saved_jobs")
      .upsert(
        { user_id: userId, job_id: jobId },
        { onConflict: "user_id,job_id" },
      );
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("user_id", userId)
    .eq("job_id", jobId);
  if (error) throw new Error(error.message);
}

/** True when an alert email was already sent to this user today. */
export async function hasAlertToday(userId: string): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10);

  if (isLocalMode()) {
    return local.findAlert(userId, today) !== null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("alert_log")
    .select("id")
    .eq("user_id", userId)
    .eq("sent_on", today)
    .maybeSingle();

  return data !== null;
}

/** Records that today's alert has been handled for this user. */
export async function recordAlert(
  userId: string,
  jobCount: number,
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);

  if (isLocalMode()) {
    local.recordAlert({ user_id: userId, sent_on: today, job_count: jobCount });
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("alert_log")
    .upsert(
      { user_id: userId, sent_on: today, job_count: jobCount },
      { onConflict: "user_id,sent_on" },
    );
  if (error) throw new Error(error.message);
}

/** Every profile that has one, used by the daily cron. */
export async function listAllProfiles(): Promise<Profile[]> {
  if (isLocalMode()) return local.listProfiles();

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*");

  return ((data ?? []) as Profile[]).map((row) => ({
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    degree: row.degree,
    branch: row.branch,
    graduation_year: row.graduation_year,
    min_percentage: row.min_percentage,
    skills: row.skills ?? [],
    location: row.location,
    created_at: row.created_at,
  }));
}
