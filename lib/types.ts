export type Degree = "10" | "12" | "Diploma" | "B.Tech" | "B.E" | "B.Sc" | "B.Com" | "BBA" | "MCA" | "M.Tech" | "M.Sc" | "Other";

export type MatchStatus = "confirmed" | "likely" | "not_eligible" | "needs_review";

export type OrbState = "idle" | "thinking" | "eligible" | "not_eligible";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  degree: Degree | null;
  branch: string | null;
  graduation_year: number | null;
  min_percentage: number | null;
  skills: string[];
  location: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  min_degree: Degree | null;
  allowed_branches: string[];
  grad_year_min: number | null;
  grad_year_max: number | null;
  min_percentage: number | null;
  skills: string[];
  apply_url: string;
  created_at?: string;
}

export interface MatchReason {
  label: string;
  passed: boolean;
  detail: string;
}

export interface JobMatch {
  id: string;
  user_id: string;
  job_id: string;
  status: MatchStatus;
  reasons: MatchReason[];
  explanation: string;
  score: number;
  created_at?: string;
  updated_at?: string;
}

export interface MatchResult {
  job_id: string;
  status: MatchStatus;
  reasons: MatchReason[];
  explanation: string;
  score: number;
  extracted?: ExtractedRequirements;
}

export interface ExtractedRequirements {
  min_degree: string | null;
  allowed_branches: string[];
  grad_year_min: number | null;
  grad_year_max: number | null;
  min_percentage: number | null;
  skills: string[];
}

export interface JobWithMatch extends Job {
  match?: MatchResult | null;
}

export const STATUS_LABEL: Record<MatchStatus, string> = {
  confirmed: "Confirmed",
  likely: "Likely",
  not_eligible: "Not eligible",
  needs_review: "Needs review",
};

export const STATUS_STYLE: Record<MatchStatus, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  likely: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  not_eligible: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  needs_review: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

export function statusToOrb(status: MatchStatus | undefined): OrbState {
  switch (status) {
    case "confirmed":
      return "eligible";
    case "likely":
      return "eligible";
    case "not_eligible":
      return "not_eligible";
    case "needs_review":
      return "thinking";
    default:
      return "idle";
  }
}
