import { NextRequest, NextResponse } from "next/server";
import { queryJobByIdFromDb } from "@/lib/hirepulse/sqlite-service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = queryJobByIdFromDb(id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json(job);
  } catch (err: any) {
    console.error("Error in /api/hirepulse/jobs/[id]:", err);
    return NextResponse.json(
      { error: "Failed to fetch job", detail: err?.message },
      { status: 500 }
    );
  }
}
