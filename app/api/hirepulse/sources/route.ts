import { NextResponse } from "next/server";
import { querySourcesFromDb } from "@/lib/hirepulse/sqlite-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sources = querySourcesFromDb();
    return NextResponse.json(sources);
  } catch (err: any) {
    console.error("Error in /api/hirepulse/sources:", err);
    return NextResponse.json(
      { error: "Failed to fetch sources", detail: err?.message },
      { status: 500 }
    );
  }
}
