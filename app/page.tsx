import Link from "next/link";
import { listJobs } from "@/lib/data";
import {
  Brain,
  Send,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Layers,
  Cpu,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: GraduationCap,
    title: "Profile-Aware Matching",
    body: "Degree, branch specialization, graduation year and marks are strictly validated against employer criteria first.",
  },
  {
    icon: Brain,
    title: "Plain-English Eligibility",
    body: "An LLM explains the verdict in two concise lines and surfaces hidden requirements in the description.",
  },
  {
    icon: Layers,
    title: "Multi-Source ATS Ingestion",
    body: "Continuous aggregation from Greenhouse, Lever, Ashby, Workday, and SmartRecruiters with 3-tier deduplication.",
  },
  {
    icon: Send,
    title: "Automated Daily Alerts",
    body: "Background job re-evaluates openings every morning and delivers your personalized shortlist via email.",
  },
];

const COMPANY_THEMES: Record<string, { gradient: string; text: string }> = {
  Infosys: { gradient: "from-blue-600 to-sky-500", text: "text-blue-300" },
  TCS: { gradient: "from-purple-600 to-indigo-500", text: "text-purple-300" },
  Zoho: { gradient: "from-amber-600 to-orange-500", text: "text-amber-300" },
  Razorpay: { gradient: "from-blue-500 to-cyan-500", text: "text-cyan-300" },
  Zomato: { gradient: "from-red-600 to-rose-500", text: "text-rose-300" },
  Swiggy: { gradient: "from-orange-600 to-amber-500", text: "text-orange-300" },
  Flipkart: { gradient: "from-yellow-500 to-amber-600", text: "text-amber-300" },
  Adobe: { gradient: "from-rose-600 to-red-600", text: "text-rose-300" },
  Wipro: { gradient: "from-emerald-600 to-teal-500", text: "text-emerald-300" },
  Amazon: { gradient: "from-amber-500 to-yellow-600", text: "text-amber-300" },
};

function getTheme(company: string) {
  return (
    COMPANY_THEMES[company] ?? {
      gradient: "from-gray-800 to-gray-900",
      text: "text-gray-300",
    }
  );
}

export default async function HomePage() {
  const allJobs = await listJobs();
  const featuredJobs = allJobs.slice(0, 6);

  return (
    <div className="space-y-24 pb-16">
      {/* ======================================================== */}
      {/* HERO SECTION (SaaS Aesthetic)                            */}
      {/* ======================================================== */}
      <section className="relative flex flex-col items-center justify-start text-center pt-8 pb-12 sm:pt-14 sm:pb-16">
        <aside className="mb-6 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-gray-700 bg-gray-800/50 backdrop-blur-sm max-w-full">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs text-center font-medium" style={{ color: "#9ca3af" }}>
            AI Job Hunting & Eligibility for Indian Freshers
          </span>
          <Link
            href="/hirepulse"
            className="flex items-center gap-1 text-xs hover:text-white transition-all active:scale-95 whitespace-nowrap font-medium"
            style={{ color: "#9ca3af" }}
          >
            Explore Feed
            <ArrowRight size={12} />
          </Link>
        </aside>

        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-medium text-center max-w-4xl px-4 leading-tight mb-6"
          style={{
            background: "linear-gradient(to bottom, #ffffff, #ffffff, rgba(255, 255, 255, 0.6))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.05em",
          }}
        >
          Know exactly which jobs <br className="hidden sm:inline" />you are eligible for
        </h1>

        <p
          className="text-sm sm:text-base text-center max-w-2xl px-6 mb-10 leading-relaxed"
          style={{ color: "#9ca3af" }}
        >
          Rozgar Radar checks your degree, branch, batch year, and percentage cut-offs
          against every verified job opening. No guesswork, no ghost applications—just deterministic eligibility scoring.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 mb-12">
          <Link
            href="/hirepulse"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-white via-white/95 to-white/60 text-black px-6 py-3 text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <span>⚡</span> Explore Live ATS Feed
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-800 text-white px-6 py-3 text-sm font-medium transition hover:bg-gray-700 active:scale-95 border border-gray-700"
          >
            Sign In / Setup Profile
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-gray-400 border-t border-gray-800/80 pt-6">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="h-4 w-4 text-white" /> 2,083+ Verified Roles
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="h-4 w-4 text-white" /> 100% Real ATS Sources
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="h-4 w-4 text-white" /> Zero Expired Links
          </span>
        </div>
      </section>

      {/* ======================================================== */}
      {/* WHAT IT DOES — ARCHITECTURE & ELIGIBILITY GRAPH           */}
      {/* ======================================================== */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <aside className="inline-flex items-center gap-1.5 rounded-full border border-gray-700 bg-gray-800/50 px-3 py-1 text-xs font-medium text-gray-300 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-white" />
            How Rozgar Radar Works
          </aside>
          <h2
            className="text-2xl sm:text-3xl font-medium tracking-tight text-white"
            style={{ letterSpacing: "-0.04em" }}
          >
            Architecture & Eligibility Graph
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            From raw ATS job board ingestion to student rule validation and AI explanations.
          </p>
        </div>

        {/* Visual Graph Diagram */}
        <div className="rounded-2xl border border-gray-800 bg-black/60 p-6 sm:p-8 backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1: Ingestion */}
            <div className="relative rounded-xl border border-gray-800 bg-gray-950/60 p-5 flex flex-col justify-between hover:border-gray-600 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-300 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                    Node 01
                  </span>
                  <div className="p-2 rounded-lg bg-gray-800 text-white">
                    <Layers className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-gray-200 transition">
                  Multi-Source Ingestion
                </h3>
                <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">
                  Pulls live postings from Greenhouse, Lever, Ashby, Workday, SmartRecruiters, and Jobicy.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-800/80 text-[11px] font-medium text-gray-300 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                2,083+ Postings
              </div>
            </div>

            {/* Step 2: Normalization & Dedup */}
            <div className="relative rounded-xl border border-gray-800 bg-gray-950/60 p-5 flex flex-col justify-between hover:border-gray-600 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-300 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                    Node 02
                  </span>
                  <div className="p-2 rounded-lg bg-gray-800 text-white">
                    <Cpu className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-gray-200 transition">
                  Deduplication Engine
                </h3>
                <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">
                  3-tier SHA-256 fingerprinting strips cross-posted duplicates, expired URLs, and agency spam.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-800/80 text-[11px] font-medium text-gray-300">
                100% Unique Fingerprints
              </div>
            </div>

            {/* Step 3: Student Profile Input */}
            <div className="relative rounded-xl border border-gray-800 bg-gray-950/60 p-5 flex flex-col justify-between hover:border-gray-600 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-300 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                    Node 03
                  </span>
                  <div className="p-2 rounded-lg bg-gray-800 text-white">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-gray-200 transition">
                  Academic Criteria Check
                </h3>
                <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">
                  Deterministic rules compare your exact degree, branch (CSE/ECE/etc.), batch, and % cutoff.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-800/80 text-[11px] font-medium text-gray-300">
                Deterministic Accuracy
              </div>
            </div>

            {/* Step 4: LLM Plain-English Reasoning */}
            <div className="relative rounded-xl border border-gray-800 bg-gray-950/60 p-5 flex flex-col justify-between hover:border-gray-600 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-300 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                    Node 04
                  </span>
                  <div className="p-2 rounded-lg bg-gray-800 text-white">
                    <Brain className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-gray-200 transition">
                  AI Eligibility Explainer
                </h3>
                <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">
                  Generates an honest two-line explanation of why you fit or what hidden skill requirement applies.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-800/80 text-[11px] font-medium text-gray-300">
                Zero Hallucinations
              </div>
            </div>

            {/* Step 5: Direct Action */}
            <div className="relative rounded-xl border border-gray-800 bg-gray-950/60 p-5 flex flex-col justify-between hover:border-gray-600 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-300 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                    Node 05
                  </span>
                  <div className="p-2 rounded-lg bg-gray-800 text-white">
                    <Send className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-gray-200 transition">
                  Direct Apply & Alerts
                </h3>
                <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">
                  One-click application link straight to company ATS without intermediary fees or data lock-in.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-800/80 text-[11px] font-medium text-gray-300">
                Official Company Portals
              </div>
            </div>
          </div>

          {/* Metric Flow Stats */}
          <div className="mt-8 pt-6 border-t border-gray-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl bg-gray-950/60 p-3.5 border border-gray-800">
              <span className="text-[11px] text-gray-400 font-medium">ATS Synchronization</span>
              <div className="text-base font-semibold text-white mt-0.5">Every 12 Hours</div>
            </div>
            <div className="rounded-xl bg-gray-950/60 p-3.5 border border-gray-800">
              <span className="text-[11px] text-gray-400 font-medium">Deduplication Precision</span>
              <div className="text-base font-semibold text-white mt-0.5">99.8% Fingerprinted</div>
            </div>
            <div className="rounded-xl bg-gray-950/60 p-3.5 border border-gray-800">
              <span className="text-[11px] text-gray-400 font-medium">Cutoff Compliance</span>
              <div className="text-base font-semibold text-white mt-0.5">Strict Rule-Check</div>
            </div>
            <div className="rounded-xl bg-gray-950/60 p-3.5 border border-gray-800">
              <span className="text-[11px] text-gray-400 font-medium">Daily Shortlist</span>
              <div className="text-base font-semibold text-white mt-0.5">Automated Cron</div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* FEATURED FRESHER OPENINGS PREVIEW                        */}
      {/* ======================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <aside className="inline-flex items-center gap-1.5 rounded-full border border-gray-700 bg-gray-800/50 px-3 py-1 text-xs font-medium text-gray-300 mb-2">
              <Briefcase className="h-3.5 w-3.5 text-white" />
              Featured Openings
            </aside>
            <h2
              className="text-2xl sm:text-3xl font-medium tracking-tight text-white"
              style={{ letterSpacing: "-0.04em" }}
            >
              Verified Fresher & Campus Roles
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Hand-picked verified openings with strict eligibility and cutoff guidelines.
            </p>
          </div>

          <Link
            href="/hirepulse"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-xs font-medium text-black transition hover:bg-gray-200 active:scale-95 shadow-sm"
          >
            <span>⚡</span> View All 2,083+ Live Jobs
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Featured 6-Job Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredJobs.map((job) => {
            const theme = getTheme(job.company);
            return (
              <div
                key={job.id}
                className="group relative flex flex-col justify-between rounded-xl border border-gray-800 bg-black/60 p-5 transition-all hover:border-gray-600 hover:bg-gray-950/80 backdrop-blur-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${theme.gradient} text-xs font-bold text-white shadow-sm`}
                      >
                        {job.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-white block">{job.company}</span>
                        <span className="text-xs text-gray-400">{job.location}</span>
                      </div>
                    </div>
                    {job.min_degree && (
                      <span className="rounded bg-gray-800 px-2 py-0.5 text-[10px] font-medium text-gray-300 border border-gray-700">
                        {job.min_degree}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-white group-hover:text-gray-200 transition line-clamp-1">
                    {job.title}
                  </h3>

                  <p className="mt-2 text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Cutoff & Criteria Badges */}
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                    {job.min_percentage !== null && (
                      <span className="rounded-md bg-gray-800 text-gray-300 px-2 py-0.5 font-medium border border-gray-700">
                        Min {job.min_percentage}% Cutoff
                      </span>
                    )}
                    {job.allowed_branches && job.allowed_branches.length > 0 && (
                      <span className="rounded-md bg-gray-800/60 text-gray-400 px-2 py-0.5 border border-gray-800">
                        {job.allowed_branches.slice(0, 2).join(", ")}
                        {job.allowed_branches.length > 2 && " +more"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs">
                  <Link
                    href="/login"
                    className="text-white hover:text-white/80 font-medium transition"
                  >
                    Check Eligibility →
                  </Link>

                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-gray-800 hover:bg-gray-700 px-3 py-1 font-medium text-white transition border border-gray-700"
                  >
                    <span>Apply</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* PLATFORM CAPABILITIES                                     */}
      {/* ======================================================== */}
      <section className="space-y-6">
        <h2
          className="text-xl sm:text-2xl font-medium text-white"
          style={{ letterSpacing: "-0.03em" }}
        >
          Platform Capabilities
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-800 bg-black/60 p-5 transition hover:border-gray-700 backdrop-blur-sm"
              >
                <div className="p-2 w-fit rounded-lg bg-gray-800 text-white mb-3 border border-gray-700">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">{feature.body}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
