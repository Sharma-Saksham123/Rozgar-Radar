import { NextRequest, NextResponse } from "next/server";
import { querySourcesFromDb } from "@/lib/hirepulse/sqlite-service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get("source_id");

    const sources = querySourcesFromDb();
    const targetSource = sourceId ? sources.find((s) => s.id === sourceId) : null;

    return NextResponse.json({
      status: "success",
      message: sourceId
        ? `Sync initiated for source: ${targetSource?.name || sourceId}`
        : "Full multi-source ingestion sync initiated across all active sources",
      timestamp: new Date().toISOString(),
      details: {
        source_id: sourceId || "all",
        active_sources: sources.filter((s) => s.is_active).length,
      },
    });
  } catch (err: any) {
    console.error("Error in /api/hirepulse/sync:", err);
    return NextResponse.json(
      { error: "Sync failed to start", detail: err?.message },
      { status: 500 }
    );
  }
}
