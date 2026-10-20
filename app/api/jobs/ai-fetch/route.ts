import { NextResponse, type NextRequest } from "next/server";
import { getProfile, getSessionUser, listJobs, upsertMatches } from "@/lib/data";
import { queryJobsFromDb } from "@/lib/hirepulse/sqlite-service";
import { matchAll } from "@/lib/matching";
import type { Job, JobWithMatch, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const prompt = (body.prompt || body.query || "").trim();
    const mode = body.mode || "ai"; // "ai" | "ats" | "filter"
    const sourceId = body.source_id || undefined;
    const category = body.category || undefined;

    const user = await getSessionUser(request);
    let profile: Profile | null = null;
    if (user) {
      profile = await getProfile(user.id);
      if (!profile) {
        profile = {
          id: user.id,
          email: user.email,
          full_name: null,
          degree: "B.Tech",
          branch: "CSE",
          graduation_year: 2026,
          min_percentage: 60,
          skills: ["Java", "Python", "Problem Solving", "Web Development"],
          location: "India",
          created_at: new Date().toISOString(),
        };
      }
    }

    // 1. Fetch from SQLite ATS database (2,083+ jobs)
    const dbResult = queryJobsFromDb({
      keyword: prompt || category,
      source_id: sourceId,
      page_size: 30,
    });

    let jobsToReturn: Job[] = [];

    if (dbResult && dbResult.items.length > 0) {
      jobsToReturn = dbResult.items.map((item) => ({
        id: item.id,
        title: item.title,
        company: item.company_name,
        location: item.location_display,
        description: item.description_plain || item.description || "Official ATS job posting.",
        min_degree: "B.Tech",
        allowed_branches: ["CSE", "IT", "ECE", "Any"],
        grad_year_min: 2024,
        grad_year_max: 2027,
        min_percentage: 60,
        skills: ["Engineering", "Problem Solving"],
        apply_url: item.application_url,
        created_at: item.first_seen_at,
      }));
    } else {
      // Fallback to internal listJobs()
      const all = await listJobs();
      jobsToReturn = prompt
        ? all.filter(
            (j) =>
              j.title.toLowerCase().includes(prompt.toLowerCase()) ||
              j.company.toLowerCase().includes(prompt.toLowerCase()) ||
              j.description.toLowerCase().includes(prompt.toLowerCase()),
          )
        : all;
    }

    if (jobsToReturn.length === 0) {
      jobsToReturn = await listJobs();
    }

    // 2. If mode is "ai", run AI matching & explanation
    let matchedPayload: JobWithMatch[] = [];
    const summary: Record<string, number> = {};

    if (mode === "ai" && profile) {
      // Evaluate AI matches
      const matchResults = await matchAll(profile, jobsToReturn.slice(0, 25));
      const matchByJob = new Map(matchResults.map((m) => [m.job_id, m]));

      if (user) {
        try {
          await upsertMatches(
            user.id,
            matchResults.map((r) => ({
              job_id: r.job_id,
              status: r.status,
              reasons: r.reasons,
              explanation: r.explanation,
              score: r.score,
            })),
          );
        } catch (err) {
          console.warn("Could not upsert matches:", err);
        }
      }

      matchedPayload = jobsToReturn.slice(0, 25).map((job) => {
        const m = matchByJob.get(job.id);
        if (m) {
          summary[m.status] = (summary[m.status] ?? 0) + 1;
          return {
            ...job,
            match: {
              job_id: m.job_id,
              status: m.status,
              reasons: m.reasons,
              explanation: m.explanation,
              score: m.score,
            },
          };
        }
        return { ...job, match: null };
      });
    } else {
      matchedPayload = jobsToReturn.map((j) => ({ ...j, match: null }));
    }

    return NextResponse.json({
      success: true,
      mode,
      count: matchedPayload.length,
      jobs: matchedPayload,
      summary,
      message:
        mode === "ai"
          ? `AI fetched and evaluated ${matchedPayload.length} verified roles against your profile.`
          : `Fetched ${matchedPayload.length} live openings from ATS sources.`,
    });
  } catch (error: any) {
    console.error("Error in /api/jobs/ai-fetch:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs", detail: error?.message },
      { status: 500 },
    );
  }
}
