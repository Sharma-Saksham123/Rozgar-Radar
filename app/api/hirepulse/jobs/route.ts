import { NextRequest, NextResponse } from "next/server";
import { queryJobsFromDb } from "@/lib/hirepulse/sqlite-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const keyword = searchParams.get("keyword") || undefined;
    const company = searchParams.get("company") || undefined;
    const location = searchParams.get("location") || undefined;
    const work_mode = searchParams.get("work_mode") || undefined;
    const employment_type = searchParams.get("employment_type") || undefined;
    const source_id = searchParams.get("source_id") || undefined;
    const sort_by = searchParams.get("sort_by") || undefined;
    const location_category = searchParams.get("location_category") || undefined;
    const page = Number(searchParams.get("page")) || 1;
    const page_size = Number(searchParams.get("page_size")) || 20;

    const data = queryJobsFromDb({
      keyword,
      company,
      location,
      work_mode,
      employment_type,
      source_id,
      sort_by,
      location_category,
      page,
      page_size,
    });

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Error in /api/hirepulse/jobs:", err);
    return NextResponse.json(
      { error: "Failed to query jobs", detail: err?.message },
      { status: 500 }
    );
  }
}
