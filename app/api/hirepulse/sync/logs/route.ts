import { NextRequest, NextResponse } from "next/server";
import { querySyncLogsFromDb } from "@/lib/hirepulse/sqlite-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 20;
    const logs = querySyncLogsFromDb(limit);
    return NextResponse.json(logs);
  } catch (err: any) {
    console.error("Error in /api/hirepulse/sync/logs:", err);
    return NextResponse.json(
      { error: "Failed to fetch sync logs", detail: err?.message },
      { status: 500 }
    );
  }
}
