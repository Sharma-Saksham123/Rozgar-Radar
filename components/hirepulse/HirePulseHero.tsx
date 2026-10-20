"use client";

import { ShieldCheck, RefreshCw, Layers, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";

interface HirePulseHeroProps {
  totalJobs: number;
  totalSources: number;
}

export function HirePulseHero({ totalJobs, totalSources }: HirePulseHeroProps) {
  return (
    <section className="relative pt-6 pb-6 overflow-hidden text-center">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Top pill badge */}
        <aside className="mb-6 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-gray-700 bg-gray-800/50 backdrop-blur-sm max-w-full">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-medium text-white">Rozgar Radar Feature</span>
          <span className="text-gray-600">•</span>
          <span className="text-xs text-gray-400">Live ATS Engine</span>
          <span className="text-gray-600">•</span>
          <span className="text-xs font-medium text-white">{totalJobs.toLocaleString()}+ Verified Roles</span>
        </aside>

        {/* Headline with SaaS Gradient */}
        <h1
          className="text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-white mb-4 leading-tight"
          style={{
            background: "linear-gradient(to bottom, #ffffff, #ffffff, rgba(255, 255, 255, 0.6))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.05em",
          }}
        >
          Live Multi-Source ATS Feed
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-400 mb-8 leading-relaxed">
          Continuously aggregated from official company ATS portals (Greenhouse, Lever, Ashby, Workday, SmartRecruiters, Jobicy) with 3-tier deduplication.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 px-5 py-2.5 text-xs font-medium text-white transition active:scale-95"
          >
            <span>←</span> Back to Home & Architecture Graph
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-white via-white/95 to-white/60 text-black px-5 py-2.5 text-xs font-medium transition hover:scale-105 active:scale-95 shadow-md"
          >
            Check My Eligibility
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Feature Badges / Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          <div className="rounded-xl border border-gray-800 bg-black/60 p-4 flex items-center gap-3 text-left backdrop-blur-sm">
            <div className="p-2.5 rounded-lg bg-gray-800 text-white border border-gray-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-semibold text-white">{totalJobs.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Verified Openings</div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-black/60 p-4 flex items-center gap-3 text-left backdrop-blur-sm">
            <div className="p-2.5 rounded-lg bg-gray-800 text-white border border-gray-700">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-semibold text-white">{totalSources}</div>
              <div className="text-xs text-gray-400">Connected ATS Sources</div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-black/60 p-4 flex items-center gap-3 text-left backdrop-blur-sm">
            <div className="p-2.5 rounded-lg bg-gray-800 text-white border border-gray-700">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-semibold text-white">3-Tier</div>
              <div className="text-xs text-gray-400">Deduplication Active</div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-black/60 p-4 flex items-center gap-3 text-left backdrop-blur-sm">
            <div className="p-2.5 rounded-lg bg-gray-800 text-white border border-gray-700">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-semibold text-white">12h</div>
              <div className="text-xs text-gray-400">Auto-Sync Cadence</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
