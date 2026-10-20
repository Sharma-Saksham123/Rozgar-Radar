import { NextResponse } from "next/server";
import { z } from "zod";
import { isLocalMode, localSignIn } from "@/lib/data";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().trim().email(),
  full_name: z.string().trim().max(120).nullish(),
});

/**
 * Local-mode sign in. Only available when Supabase is not configured — with
 * Supabase the browser client handles auth directly.
 */
export async function POST(request: Request) {
  if (!isLocalMode()) {
    return NextResponse.json(
      { error: "Supabase is configured; use the standard auth flow." },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.flatten().fieldErrors;
    return NextResponse.json(
      {
        error: issues.email
          ? "A valid email is required"
          : "Invalid sign-in details",
        issues,
      },
      { status: 400 },
    );
  }

  const user = localSignIn(parsed.data.email, parsed.data.full_name ?? null);

  return NextResponse.json({
    user: { id: user.id, email: user.email, full_name: user.full_name },
  });
}
