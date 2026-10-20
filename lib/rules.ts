import type { MatchReason, MatchStatus, Profile } from "./types";

export interface Requirements {
  min_degree: string | null;
  allowed_branches: string[];
  grad_year_min: number | null;
  grad_year_max: number | null;
  min_percentage: number | null;
  skills: string[];
}

export type CheckState = "pass" | "fail" | "unknown";

export interface RuleOutcome {
  status: MatchStatus;
  reasons: MatchReason[];
  score: number;
}

interface Check {
  label: string;
  state: CheckState;
  detail: string;
}

const TECHNICAL_DEGREES = new Set(["B.Tech", "B.E", "MCA", "M.Tech"]);

/** Higher rank = higher qualification level. */
const DEGREE_RANK: Record<string, number> = {
  "10": 1,
  "12": 2,
  Diploma: 3,
  "B.E": 4,
  "B.Tech": 4,
  "B.Sc": 4,
  "B.Com": 4,
  BBA: 4,
  MCA: 5,
  "M.Tech": 5,
  "M.Sc": 5,
  Other: 0,
};

const BRANCH_ALIASES: Record<string, string> = {
  cs: "cse",
  cse: "cse",
  "computer science": "cse",
  "computer science and engineering": "cse",
  it: "it",
  "information technology": "it",
  ece: "ece",
  electronics: "ece",
  "electronics and communication": "ece",
  eee: "eee",
  electrical: "eee",
  "electrical and electronics": "eee",
  mechanical: "mechanical",
  "mechanical engineering": "mechanical",
  civil: "civil",
  aiml: "aiml",
  "ai ml": "aiml",
  "ai-ml": "aiml",
  "artificial intelligence": "aiml",
  statistics: "statistics",
  stat: "statistics",
  mathematics: "mathematics",
  math: "mathematics",
  economics: "economics",
  commerce: "commerce",
  "commerce and management": "commerce",
  bcom: "commerce",
  finance: "finance",
  mba: "mba",
};

export function normalizeToken(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
}

export function normalizeBranch(value: string): string {
  const normalized = normalizeToken(value);
  return BRANCH_ALIASES[normalized] ?? normalized;
}

function branchList(values: string[]): string[] {
  return values.map(normalizeBranch);
}

function check(label: string, state: CheckState, detail: string): Check {
  return { label, state, detail };
}

function toReason(result: Check): MatchReason {
  return {
    label: result.label,
    passed: result.state === "pass",
    detail: result.detail,
  };
}

function checkDegree(profile: Profile, req: Requirements): Check {
  const required = req.min_degree;
  if (!required) {
    return check(
      "Degree",
      "pass",
      "No degree requirement listed for this role.",
    );
  }
  if (!profile.degree) {
    return check(
      "Degree",
      "unknown",
      "Add your degree in your profile to check this requirement.",
    );
  }
  if (profile.degree === "Other") {
    return check(
      "Degree",
      "unknown",
      `Your degree is listed as "Other" while this role asks for ${required}.`,
    );
  }
  if (required === "Other") {
    return check("Degree", "pass", "This role accepts any degree.");
  }

  const jobIsTechnical = TECHNICAL_DEGREES.has(required);
  const candidateIsTechnical = TECHNICAL_DEGREES.has(profile.degree);

  if (jobIsTechnical && !candidateIsTechnical) {
    return check(
      "Degree",
      "fail",
      `This role needs a technical degree (${required}); you have ${profile.degree}.`,
    );
  }

  if (!jobIsTechnical && candidateIsTechnical) {
    const branches = branchList(req.allowed_branches);
    if (branches.length === 0 || branches.includes("any")) {
      return check(
        "Degree",
        "unknown",
        `This role asks for ${required}; your ${profile.degree} may or may not be accepted.`,
      );
    }
    return check(
      "Degree",
      "pass",
      `Your ${profile.degree} is at or above the ${required} level; branch decides the fit.`,
    );
  }

  const candidateRank = DEGREE_RANK[profile.degree] ?? 0;
  const requiredRank = DEGREE_RANK[required] ?? 0;

  if (candidateRank === 0 || requiredRank === 0) {
    return check(
      "Degree",
      "unknown",
      `Could not compare ${profile.degree} against ${required}.`,
    );
  }

  if (candidateRank >= requiredRank) {
    return check(
      "Degree",
      "pass",
      `${profile.degree} meets the ${required} requirement.`,
    );
  }

  return check(
    "Degree",
    "fail",
    `This role asks for ${required} or higher; you have ${profile.degree}.`,
  );
}

function checkBranch(profile: Profile, req: Requirements): Check {
  const allowed = branchList(req.allowed_branches);
  if (allowed.length === 0) {
    return check("Branch", "pass", "No branch restriction for this role.");
  }
  if (allowed.includes("any")) {
    return check("Branch", "pass", "Any branch is accepted for this role.");
  }
  if (!profile.branch) {
    return check(
      "Branch",
      "unknown",
      "Add your branch in your profile to check this requirement.",
    );
  }

  const candidate = normalizeBranch(profile.branch);
  if (candidate === "any") {
    return check(
      "Branch",
      "unknown",
      `Set your actual branch to confirm against ${req.allowed_branches.join(", ")}.`,
    );
  }

  if (allowed.includes(candidate)) {
    return check(
      "Branch",
      "pass",
      `${profile.branch} is in the accepted list (${req.allowed_branches.join(", ")}).`,
    );
  }

  return check(
    "Branch",
    "fail",
    `This role accepts ${req.allowed_branches.join(", ")}; you are in ${profile.branch}.`,
  );
}

function checkGraduationYear(profile: Profile, req: Requirements): Check {
  const min = req.grad_year_min;
  const max = req.grad_year_max;
  if (min == null && max == null) {
    return check(
      "Graduation year",
      "pass",
      "No batch year restriction for this role.",
    );
  }
  if (!profile.graduation_year) {
    return check(
      "Graduation year",
      "unknown",
      "Add your graduation year in your profile to check this requirement.",
    );
  }

  const year = profile.graduation_year;
  if (min != null && year < min) {
    return check(
      "Graduation year",
      "fail",
      `This role hires the ${min} batch onwards; you graduate in ${year}.`,
    );
  }
  if (max != null && year > max) {
    return check(
      "Graduation year",
      "fail",
      `This role hires the ${max} batch and earlier; you graduate in ${year}.`,
    );
  }

  return check(
    "Graduation year",
    "pass",
    `Your ${year} batch fits the ${min ?? "any"}-${max ?? "any"} requirement.`,
  );
}

function checkPercentage(profile: Profile, req: Requirements): Check {
  if (req.min_percentage == null) {
    return check("Marks", "pass", "No cut-off listed for this role.");
  }
  if (profile.min_percentage == null) {
    return check(
      "Marks",
      "unknown",
      "Add your aggregate percentage to check the cut-off.",
    );
  }

  if (profile.min_percentage >= req.min_percentage) {
    return check(
      "Marks",
      "pass",
      `${profile.min_percentage}% clears the ${req.min_percentage}% cut-off.`,
    );
  }

  return check(
    "Marks",
    "fail",
    `This role needs ${req.min_percentage}%; you have ${profile.min_percentage}%.`,
  );
}

function checkSkills(profile: Profile, req: Requirements): Check {
  const required = req.skills.map(normalizeToken).filter(Boolean);
  if (required.length === 0) {
    return check("Skills", "pass", "No specific skills listed for this role.");
  }

  const mine = profile.skills.map(normalizeToken).filter(Boolean);
  if (mine.length === 0) {
    return check(
      "Skills",
      "unknown",
      "Add your skills so we can compare them with this role.",
    );
  }

  const overlap = required.filter((skill) => mine.includes(skill));
  if (overlap.length > 0) {
    return check("Skills", "pass", `You match on ${overlap.join(", ")}.`);
  }

  return check(
    "Skills",
    "fail",
    `This role lists ${req.skills.join(", ")}; none are on your profile yet.`,
  );
}

/**
 * Deterministic eligibility check. This is the only thing that decides the
 * verdict — the LLM never sets the status.
 */
export function evaluate(profile: Profile, req: Requirements): RuleOutcome {
  const hard = [
    checkDegree(profile, req),
    checkBranch(profile, req),
    checkGraduationYear(profile, req),
    checkPercentage(profile, req),
  ];
  const soft = checkSkills(profile, req);

  const reasons = [...hard, soft].map(toReason);

  const hasHardFail = hard.some((c) => c.state === "fail");
  const hasUnknown = hard.some((c) => c.state === "unknown");
  const skillsMissing = soft.state === "fail";

  const passedHard = hard.filter((c) => c.state === "pass").length;
  const skillsFactor = soft.state === "pass" ? 1 : soft.state === "unknown" ? 0.5 : 0;
  const score = Math.round((passedHard / hard.length) * 90 + skillsFactor * 10);

  let status: MatchStatus;
  if (hasHardFail) {
    status = "not_eligible";
  } else if (hasUnknown) {
    status = "needs_review";
  } else if (skillsMissing) {
    status = "likely";
  } else {
    status = "confirmed";
  }

  return { status, reasons, score };
}

/** Builds requirements from the structured columns on a job row. */
export function requirementsFromJob(job: {
  min_degree?: string | null;
  allowed_branches?: string[] | null;
  grad_year_min?: number | null;
  grad_year_max?: number | null;
  min_percentage?: number | null;
  skills?: string[] | null;
}): Requirements {
  return {
    min_degree: job.min_degree ?? null,
    allowed_branches: job.allowed_branches ?? [],
    grad_year_min: job.grad_year_min ?? null,
    grad_year_max: job.grad_year_max ?? null,
    min_percentage: job.min_percentage ?? null,
    skills: job.skills ?? [],
  };
}

/**
 * Folds requirements extracted from the job description into the structured
 * ones. The stricter of the two wins, so a description that says "70 percent"
 * is not diluted by a structured column that says 60.
 */
export function mergeRequirements(
  structured: Requirements,
  extracted: Partial<Requirements> | null,
): Requirements {
  if (!extracted) return structured;

  const branches =
    extracted.allowed_branches && extracted.allowed_branches.length > 0
      ? extracted.allowed_branches
      : structured.allowed_branches;

  const skills =
    extracted.skills && extracted.skills.length > 0
      ? Array.from(new Set([...structured.skills, ...extracted.skills]))
      : structured.skills;

  return {
    min_degree: extracted.min_degree ?? structured.min_degree,
    allowed_branches: branches,
    grad_year_min:
      extracted.grad_year_min != null
        ? Math.max(structured.grad_year_min ?? 0, extracted.grad_year_min)
        : structured.grad_year_min,
    grad_year_max:
      extracted.grad_year_max != null
        ? Math.min(structured.grad_year_max ?? Infinity, extracted.grad_year_max)
        : structured.grad_year_max,
    min_percentage:
      extracted.min_percentage != null
        ? Math.max(structured.min_percentage ?? 0, extracted.min_percentage)
        : structured.min_percentage,
    skills,
  };
}
