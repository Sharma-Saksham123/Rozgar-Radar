import { NextResponse } from "next/server";
import { z } from "zod";
import { getSaved, getSessionUser, setSaved } from "@/lib/data";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  job_id: z.string().min(1),
});

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ saved: await getSaved(user.id) });
}

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid job_id" }, { status: 400 });
  }

  try {
    await setSaved(user.id, parsed.data.job_id, true);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to save job",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ saved: true, job_id: parsed.data.job_id });
}

export async function DELETE(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid job_id" }, { status: 400 });
  }

  try {
    await setSaved(user.id, parsed.data.job_id, false);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to remove saved job",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ saved: false, job_id: parsed.data.job_id });
}
