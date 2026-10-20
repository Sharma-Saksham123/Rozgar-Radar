import { NextResponse } from "next/server";
import { z } from "zod";
import { getProfile, getSessionUser, listJobs, upsertMatches } from "@/lib/data";
import { matchAll } from "@/lib/matching";
import type { MatchResult } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const requestSchema = z.object({
  job_ids: z.array(z.string().uuid()).max(200).optional(),
});

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown = {};
  try {
    const text = await request.text();
    body = text ? JSON.parse(text) : {};
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  let profile = await getProfile(user.id);
  if (!profile) {
    profile = {
      id: user.id,
      email: user.email,
      full_name: null,
      degree: "B.Tech",
      branch: "CSE",
      graduation_year: 2026,
      min_percentage: 60,
      skills: ["Java", "Python", "SQL", "Problem Solving"],
      location: "India",
      created_at: new Date().toISOString(),
    };
  }

  const allJobs = await listJobs();
  const jobs = parsed.data.job_ids?.length
    ? allJobs.filter((job) => parsed.data.job_ids!.includes(job.id))
    : allJobs;

  if (jobs.length === 0) {
    return NextResponse.json({ matches: [], count: 0, summary: {} });
  }

  const results = await matchAll(profile, jobs);

  try {
    await upsertMatches(
      user.id,
      results.map((result) => ({
        job_id: result.job_id,
        status: result.status,
        reasons: result.reasons,
        explanation: result.explanation,
        score: result.score,
      })),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to save matches",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }

  const summary = results.reduce<Record<string, number>>((acc, result) => {
    acc[result.status] = (acc[result.status] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    matches: results satisfies MatchResult[],
    count: results.length,
    summary,
  });
}
