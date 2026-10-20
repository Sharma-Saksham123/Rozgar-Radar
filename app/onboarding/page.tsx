"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { getSessionUserId } from "@/lib/session";
import type { Profile } from "@/lib/types";

const DEGREES = [
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
];

const BRANCHES = [
  "CSE",
  "IT",
  "ECE",
  "Mechanical",
  "Civil",
  "EEE",
  "AI-ML",
  "Statistics",
  "Mathematics",
  "Economics",
  "Commerce",
  "Finance",
  "Any",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [degree, setDegree] = useState("B.Tech");
  const [branch, setBranch] = useState("CSE");
  const [graduationYear, setGraduationYear] = useState("2026");
  const [percentage, setPercentage] = useState("60");
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("Bangalore, India");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSessionUserId()
      .then(async (userId) => {
        if (!userId) {
          router.replace("/login");
          return;
        }
        setReady(true);

        try {
          const response = await apiFetch("/api/profile");
          if (!response.ok) return;
          const payload = await response.json();
          const profile = payload.profile as Profile | null;
          if (!profile) return;

          if (profile.full_name) setFullName(profile.full_name);
          if (profile.degree) setDegree(profile.degree);
          if (profile.branch) setBranch(profile.branch);
          if (profile.graduation_year)
            setGraduationYear(String(profile.graduation_year));
          if (profile.min_percentage != null)
            setPercentage(String(profile.min_percentage));
          if (profile.skills?.length) setSkills(profile.skills.join(", "));
          if (profile.location) setLocation(profile.location);
        } catch {
          // Best effort prefill
        }
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await apiFetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          degree,
          branch,
          graduation_year: Number(graduationYear),
          min_percentage: Number(percentage),
          skills: skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          location,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Could not save your profile");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return <p className="text-center text-gray-400 py-12">Checking your session…</p>;
  }

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-gray-800 bg-gray-950/70 px-3.5 py-2.5 text-white placeholder:text-gray-500 outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20 transition text-sm";

  return (
    <div className="mx-auto max-w-xl pt-6 sm:pt-10">
      <div className="rounded-2xl border border-gray-800 bg-black/80 backdrop-blur-md p-8 shadow-2xl">
        <h1
          className="text-2xl font-medium tracking-tight text-white"
          style={{ letterSpacing: "-0.04em" }}
        >
          Build your profile
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          We use this to check eligibility against every job on the board.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-gray-300">Full name</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className={inputClass}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-gray-300">Degree</span>
              <select
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className={inputClass}
              >
                {DEGREES.map((d) => (
                  <option key={d} value={d} className="bg-black text-white">
                    {d}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-gray-300">Branch</span>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className={inputClass}
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b} className="bg-black text-white">
                    {b}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-gray-300">Graduation year</span>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                min={2024}
                max={2030}
                required
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-gray-300">Aggregate %</span>
              <input
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                min={0}
                max={100}
                step={0.1}
                required
                className={inputClass}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-gray-300">
              Skills (comma separated)
            </span>
            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Java, SQL, React"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-gray-300">Preferred location</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
            />
          </label>

          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-gradient-to-b from-white via-white/95 to-white/60 text-black px-4 py-2.5 text-sm font-medium transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60 shadow-md cursor-pointer mt-2"
          >
            {busy ? "Saving…" : "Save profile and continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
