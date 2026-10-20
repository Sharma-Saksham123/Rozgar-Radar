import { NextResponse } from "next/server";
import { z } from "zod";
import { getProfile, getSessionUser, saveProfile } from "@/lib/data";

export const dynamic = "force-dynamic";

const profileSchema = z.object({
  full_name: z.string().trim().min(1).max(120).optional(),
  degree: z
    .enum([
      "10",
      "12",
      "Diploma",
      "B.Tech",
      "B.E",
      "B.Sc",
      "B.Com",
      "BBA",
      "MCA",
      "M.Tech",
      "M.Sc",
      "Other",
    ])
    .optional(),
  branch: z.string().trim().max(80).optional(),
  graduation_year: z.coerce.number().int().min(1990).max(2100).optional(),
  min_percentage: z.coerce.number().min(0).max(100).optional(),
  skills: z.array(z.string().trim().min(1).max(40)).max(40).optional(),
  location: z.string().trim().max(120).optional(),
});

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const profile = await getProfile(user.id);
  return NextResponse.json({ profile });
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

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid profile", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const profile = await saveProfile(user.id, user.email, parsed.data);
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to save profile",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
