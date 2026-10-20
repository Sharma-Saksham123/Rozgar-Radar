import { NextResponse } from "next/server";
import { queryFiltersFromDb } from "@/lib/hirepulse/sqlite-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const filters = queryFiltersFromDb();
    return NextResponse.json(filters);
  } catch (err: any) {
    console.error("Error in /api/hirepulse/filters:", err);
    return NextResponse.json(
      { error: "Failed to fetch filters", detail: err?.message },
      { status: 500 }
    );
  }
}
