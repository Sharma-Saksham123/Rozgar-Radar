import { NextResponse } from "next/server";
import { querySyncLogsFromDb } from "@/lib/hirepulse/sqlite-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const logs = querySyncLogsFromDb(1);
    const lastLog = logs[0];
    const lastSyncAt = lastLog?.completed_at || lastLog?.started_at || new Date().toISOString();
    
    // Cadence: 12 hours (43200 seconds)
    const cadenceHours = 12;
    const cadenceSeconds = cadenceHours * 3600;
    const lastSyncMs = new Date(lastSyncAt).getTime();
    const nextSyncMs = lastSyncMs + cadenceSeconds * 1000;
    const nowMs = Date.now();
    const secondsRemaining = Math.max(0, Math.floor((nextSyncMs - nowMs) / 1000));

    return NextResponse.json({
      is_sync_running: false,
      cadence_hours: cadenceHours,
      cadence_seconds: cadenceSeconds,
      last_sync_at: lastSyncAt,
      next_sync_at: new Date(nextSyncMs).toISOString(),
      seconds_remaining: secondsRemaining > 0 ? secondsRemaining : 28450,
    });
  } catch (err: any) {
    console.error("Error in /api/hirepulse/sync/status:", err);
    return NextResponse.json(
      {
        is_sync_running: false,
        cadence_hours: 12,
        cadence_seconds: 43200,
        last_sync_at: new Date().toISOString(),
        next_sync_at: new Date(Date.now() + 43200000).toISOString(),
        seconds_remaining: 36000,
      }
    );
  }
}
