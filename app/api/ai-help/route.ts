import { NextResponse } from "next/server";
import { z } from "zod";
import { getProfile, getSessionUser, listJobs } from "@/lib/data";
import { chat, isLlmConfigured } from "@/lib/llm";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  query: z.string().trim().min(1).max(500),
});

export async function POST(request: Request) {
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Query cannot be empty", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { query } = parsed.data;
  const user = await getSessionUser(request);
  const profile = user ? await getProfile(user.id) : null;
  const allJobs = await listJobs();

  // Try LLM if configured
  if (isLlmConfigured()) {
    try {
      const systemPrompt = `You are the Rozgar Radar AI Career & Eligibility Assistant.
You help Indian students and freshers understand job requirements, eligibility rules, and preparation tips.
User Profile:
${
  profile
    ? `- Degree: ${profile.degree ?? "Not set"}
- Branch: ${profile.branch ?? "Not set"}
- Batch: ${profile.graduation_year ?? "Not set"}
- Marks: ${profile.min_percentage ? profile.min_percentage + "%" : "Not set"}
- Skills: ${profile.skills?.length ? profile.skills.join(", ") : "None"}`
    : "No signed-in profile yet."
}

Available Jobs Summary (${allJobs.length} roles):
${allJobs
  .slice(0, 15)
  .map(
    (j) =>
      `• ${j.title} at ${j.company} (${j.location}) — Min Degree: ${j.min_degree}, Branches: ${j.allowed_branches.join(
        ", ",
      )}, Batch: ${j.grad_year_min}-${j.grad_year_max}, Min %: ${j.min_percentage}%, Skills: ${j.skills.join(", ")}`,
  )
  .join("\n")}

Respond concisely and helpfully in 2-4 sentences. Format clearly with markdown bullet points if listing roles.`;

      const response = await chat([
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ]);

      if (response && response.trim().length > 0) {
        return NextResponse.json({ reply: response });
      }
    } catch {
      // Fallback to rules-based logic below
    }
  }

  // Intelligent fallback assistant (offline / no LLM key needed)
  const q = query.toLowerCase();

  // 1. Skill search query
  const matchingSkillJobs = allJobs.filter((job) =>
    job.skills.some((skill) => q.includes(skill.toLowerCase())),
  );

  if (matchingSkillJobs.length > 0) {
    const list = matchingSkillJobs
      .slice(0, 4)
      .map((j) => `**${j.title}** at *${j.company}* (${j.skills.join(", ")})`)
      .join("\n• ");

    return NextResponse.json({
      reply: `I found ${matchingSkillJobs.length} opportunities matching your skill interest:\n\n• ${list}\n\nTip: Make sure your listed skills on your profile match these tags to increase your eligibility score.`,
      relatedJobIds: matchingSkillJobs.map((j) => j.id),
    });
  }

  // 2. Branch search
  const matchingBranchJobs = allJobs.filter((job) =>
    job.allowed_branches.some(
      (b) => q.includes(b.toLowerCase()) || b.toLowerCase() === "any",
    ),
  );

  if (q.includes("branch") || q.includes("cse") || q.includes("ece") || q.includes("it")) {
    const branchName = q.includes("cse")
      ? "CSE"
      : q.includes("ece")
        ? "ECE"
        : q.includes("it")
          ? "IT"
          : "your branch";
    const filtered = allJobs.filter(
      (j) =>
        j.allowed_branches.includes(branchName) ||
        j.allowed_branches.includes("Any"),
    );

    const list = filtered
      .slice(0, 4)
      .map(
        (j) =>
          `**${j.title}** at *${j.company}* (Min: ${j.min_percentage}%, Batches: ${j.grad_year_min}-${j.grad_year_max})`,
      )
      .join("\n• ");

    return NextResponse.json({
      reply: `For **${branchName}**, there are ${filtered.length} eligible openings on the radar:\n\n• ${list}\n\nClick **Run AI Match** above to calculate your exact verdict score across all criteria.`,
      relatedJobIds: filtered.map((j) => j.id),
    });
  }

  // 3. Eligibility inquiry
  if (q.includes("eligible") || q.includes("verdict") || q.includes("why") || q.includes("status")) {
    if (!profile) {
      return NextResponse.json({
        reply: `Eligibility verdicts are calculated by matching your **Degree, Branch, Graduation Year, and Aggregate Marks** against employer criteria. Sign in and fill your profile at **Onboarding** to see personalized scores for each role.`,
      });
    }

    return NextResponse.json({
      reply: `Your profile is evaluated against 4 hard rules:
1. **Degree cut-off** (e.g. B.Tech, B.Sc)
2. **Allowed branches** (e.g. CSE, IT, ECE)
3. **Graduation batch** (e.g. 2025 - 2026)
4. **Aggregate marks** (minimum % cut-off)

Skills add bonus ranking points. If any academic criterion fails, the role is marked *Not eligible*. If all pass, it is marked *Confirmed* or *Likely*.`,
    });
  }

  // 4. General advice / default helpful response
  return NextResponse.json({
    reply: `I can help you explore verified fresher roles. You can ask me:
• *"Which jobs require React or Python?"*
• *"Show me openings for CSE 2026 batch"*
• *"What percentage cut-off is needed for Infosys or TCS?"*
• *"How can I improve my match score?"*`,
  });
}
