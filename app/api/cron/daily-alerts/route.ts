import { NextResponse, type NextRequest } from "next/server";
import {
  hasAlertToday,
  listAllProfiles,
  listJobs,
  recordAlert,
  upsertMatches,
} from "@/lib/data";
import { matchAll } from "@/lib/matching";
import { sendDailyAlert, isEmailConfigured } from "@/lib/email";
import { serverEnv } from "@/lib/env";
import type { JobMatch } from "@/lib/types";
import type { AlertJob } from "@/lib/templates";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const TOP_N = 8;

function isAuthorized(request: NextRequest): boolean {
  const secret = serverEnv.cronSecret();
  if (!secret) {
    // No secret configured: allow local/manual runs only.
    return process.env.NODE_ENV !== "production";
  }
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  const profiles = await listAllProfiles();
  const jobs = await listJobs();

  const results: Array<{
    user_id: string;
    email: string;
    matched: number;
    emailed: boolean;
    skipped?: string;
    error?: string;
  }> = [];

  for (const profile of profiles) {
    const email = profile.email;

    if (!email) {
      results.push({
        user_id: profile.id,
        email: "",
        matched: 0,
        emailed: false,
        skipped: "no email on profile",
      });
      continue;
    }

    // Idempotency: one email per user per day.
    if (await hasAlertToday(profile.id)) {
      results.push({
        user_id: profile.id,
        email,
        matched: 0,
        emailed: false,
        skipped: "already sent today",
      });
      continue;
    }

    const matches = await matchAll(profile, jobs);

    if (matches.length > 0) {
      await upsertMatches(
        profile.id,
        matches.map((match) => ({
          job_id: match.job_id,
          status: match.status,
          reasons: match.reasons,
          explanation: match.explanation,
          score: match.score,
        })),
      );
    }

    const shortlist: AlertJob[] = matches
      .filter((match) => match.status === "confirmed" || match.status === "likely")
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_N)
      .map((match) => ({
        job: jobs.find((job) => job.id === match.job_id)!,
        match: {
          id: match.job_id,
          user_id: profile.id,
          job_id: match.job_id,
          status: match.status,
          reasons: match.reasons,
          explanation: match.explanation,
          score: match.score,
        } satisfies JobMatch,
      }))
      .filter((item) => Boolean(item.job));

    let emailed = false;
    let error: string | undefined;

    if (!isEmailConfigured()) {
      error = "RESEND_API_KEY is not configured";
    } else if (shortlist.length === 0) {
      error = "no eligible roles to report";
    } else {
      const sendResult = await sendDailyAlert(
        email,
        profile.full_name,
        shortlist,
        appUrl,
      );
      emailed = sendResult.sent;
      error = sendResult.error;
    }

    await recordAlert(profile.id, shortlist.length);

    results.push({
      user_id: profile.id,
      email,
      matched: matches.length,
      emailed,
      error,
    });
  }

  return NextResponse.json({
    ran_at: new Date().toISOString(),
    users: results.length,
    results,
  });
}
