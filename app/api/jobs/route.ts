import { NextResponse, type NextRequest } from "next/server";
import { getMatches, getSessionUser, listJobs } from "@/lib/data";
import type { JobWithMatch } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const limit = Math.min(Number(searchParams.get("limit") ?? 50) || 50, 200);

  const allJobs = await listJobs();

  const filtered = search
    ? allJobs.filter((job) => {
        const safe = search.replace(/[%,()]/g, " ").trim().toLowerCase();
        if (!safe) return true;
        return (
          job.title.toLowerCase().includes(safe) ||
          job.company.toLowerCase().includes(safe) ||
          job.location.toLowerCase().includes(safe)
        );
      })
    : allJobs;

  const jobs = filtered.slice(0, limit);

  // Attach the signed-in user's match verdicts (if any).
  const user = await getSessionUser(request);
  const matches = user ? await getMatches(user.id) : [];
  const matchByJob = new Map(matches.map((match) => [match.job_id, match]));

  const payload: JobWithMatch[] = jobs.map((job) => {
    const match = matchByJob.get(job.id);
    return match
      ? {
          ...job,
          match: {
            job_id: match.job_id,
            status: match.status,
            reasons: match.reasons ?? [],
            explanation: match.explanation ?? "",
            score: match.score ?? 0,
          },
        }
      : { ...job, match: null };
  });

  return NextResponse.json({ jobs: payload, count: payload.length });
}
