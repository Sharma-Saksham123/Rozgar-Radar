import { chatJson, isLlmConfigured } from "./llm";
import {
  evaluate,
  mergeRequirements,
  requirementsFromJob,
  type Requirements,
} from "./rules";
import type { Job, MatchResult, Profile } from "./types";

const SYSTEM_PROMPT = `You are an eligibility analyst for an Indian student/fresher job platform.
You do TWO things and nothing else:
1. Extract the hard requirements from the job description.
2. Write a two-line explanation for the candidate.

Never decide eligibility yourself. Do not output a verdict or score.
Always reply with a single JSON object, no markdown, in exactly this shape:
{
  "requirements": {
    "min_degree": string | null,
    "allowed_branches": string[],
    "grad_year_min": number | null,
    "grad_year_max": number | null,
    "min_percentage": number | null,
    "skills": string[]
  },
  "explanation": string
}

Rules for extraction:
- min_degree: one of "10","12","Diploma","B.Tech","B.E","B.Sc","B.Com","BBA","MCA","M.Tech","M.Sc", or null.
- allowed_branches: short codes like CSE, IT, ECE, EEE, Mechanical, Civil, AI-ML, Statistics, Mathematics, Economics, Commerce, Finance. Use ["Any"] if the description says any branch. Use [] if not stated.
- grad_year_min / grad_year_max: the eligible graduating batch range. null if not stated.
- min_percentage: the numeric cut-off, null if not stated.
- skills: short skill names only, [] if not stated.

Rules for explanation:
- Exactly two short sentences, separated by a newline, plain English, under 220 characters total.
- Sentence 1: why the candidate fits (or does not fit) this role, referencing their degree/branch/batch.
- Sentence 2: the single most useful next step (what to highlight, skill to add, or the deadline to watch).
- Never mention the words Confirmed, Likely, Not eligible or Needs review.`;

interface LlmMatchPayload {
  requirements?: Partial<Requirements>;
  explanation?: string;
}

function profileSummary(profile: Profile): string {
  return [
    `Degree: ${profile.degree ?? "not provided"}`,
    `Branch: ${profile.branch ?? "not provided"}`,
    `Graduation year: ${profile.graduation_year ?? "not provided"}`,
    `Aggregate: ${profile.min_percentage != null ? `${profile.min_percentage}%` : "not provided"}`,
    `Skills: ${profile.skills.length ? profile.skills.join(", ") : "not provided"}`,
    `Preferred location: ${profile.location ?? "not provided"}`,
  ].join("\n");
}

function jobSummary(job: Job): string {
  return [
    `Title: ${job.title}`,
    `Company: ${job.company}`,
    `Location: ${job.location}`,
    `Description: ${job.description}`,
  ].join("\n");
}

/** Deterministic explanation used when the LLM is unavailable or fails. */
function fallbackExplanation(job: Job, result: MatchResult): string {
  const failed = result.reasons.filter((r) => !r.passed);
  const first = failed[0];

  if (result.status === "not_eligible") {
    return `${job.title} at ${job.company} does not meet one requirement.\n${first?.detail ?? "Check the role requirements before applying."}`;
  }

  if (result.status === "needs_review") {
    return `${job.title} at ${job.company} needs one detail from your profile.\n${first?.detail ?? "Complete your profile to confirm eligibility."}`;
  }

  if (result.status === "likely") {
    return `${job.title} at ${job.company} clears your academic requirements.\nAdd the skills listed in the role to move this to confirmed.`;
  }

  return `${job.title} at ${job.company} matches your degree, branch and batch.\nApply early and mention the skills you already have.`;
}

/**
 * Runs the fixed rules for one job, using the LLM only to extract requirements
 * from the description and to phrase the explanation.
 */
export async function matchJob(
  profile: Profile,
  job: Job,
): Promise<MatchResult> {
  const structured = requirementsFromJob(job);

  let extracted: Partial<Requirements> | null = null;
  let explanation: string | null = null;

  if (isLlmConfigured()) {
    try {
      const payload = await chatJson<LlmMatchPayload>(
        [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `CANDIDATE PROFILE\n${profileSummary(profile)}\n\nJOB POSTING\n${jobSummary(job)}`,
          },
        ],
        { temperature: 0.1, maxTokens: 500 },
      );

      if (payload) {
        extracted = payload.requirements ?? null;
        explanation = payload.explanation?.trim() || null;
      }
    } catch (error) {
      // Degrade to rules-only instead of failing the whole request.
      console.warn(
        `[match] LLM failed for job ${job.id}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  const requirements = mergeRequirements(structured, extracted);
  const outcome = evaluate(profile, requirements);

  const result: MatchResult = {
    job_id: job.id,
    status: outcome.status,
    reasons: outcome.reasons,
    explanation: explanation ?? fallbackExplanation(job, { ...outcome, job_id: job.id } as MatchResult),
    score: outcome.score,
    extracted: requirements,
  };

  return result;
}

/** Runs matching across many jobs with a small concurrency cap. */
export async function matchAll(
  profile: Profile,
  jobs: Job[],
  concurrency = 5,
): Promise<MatchResult[]> {
  const results: MatchResult[] = [];
  const queue = [...jobs];

  const worker = async () => {
    for (;;) {
      const job = queue.shift();
      if (!job) return;
      results.push(await matchJob(profile, job));
    }
  };

  const workers = Array.from(
    { length: Math.min(concurrency, Math.max(jobs.length, 1)) },
    () => worker(),
  );

  await Promise.all(workers);
  return results;
}
