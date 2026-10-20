"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isLocalMode } from "@/lib/config";
import { setLocalUserId } from "@/lib/session";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      if (isLocalMode()) {
        const response = await fetch("/api/auth/local", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, full_name: fullName || null }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Could not sign in");
        }

        const payload = await response.json();
        setLocalUserId(payload.user.id);
        window.dispatchEvent(new Event("auth-changed"));
        setMessage("Signed in. Redirecting to dashboard…");
        router.push("/dashboard");
        return;
      }

      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, full_name: fullName }),
        });

        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.error ?? "Could not create account");
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        window.dispatchEvent(new Event("auth-changed"));
        setMessage("Account created. Redirecting to dashboard…");
        router.push("/dashboard");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        if (
          signInError.message.toLowerCase().includes("invalid login credentials")
        ) {
          throw new Error(
            "Invalid email or password. If you don't have an account yet, click 'Create account' below.",
          );
        }
        if (signInError.message.toLowerCase().includes("email not confirmed")) {
          throw new Error(
            "Email not confirmed. Please check your inbox or sign up again.",
          );
        }
        throw signInError;
      }

      window.dispatchEvent(new Event("auth-changed"));
      setMessage("Signed in. Redirecting to dashboard…");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-gray-800 bg-gray-950/70 px-3.5 py-2.5 text-white placeholder:text-gray-500 outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20 transition text-sm";

  return (
    <div className="mx-auto max-w-md pt-6 sm:pt-12">
      <div className="rounded-2xl border border-gray-800 bg-black/80 backdrop-blur-md p-8 shadow-2xl">
        <h1
          className="text-2xl font-medium tracking-tight text-white"
          style={{ letterSpacing: "-0.04em" }}
        >
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          {mode === "login"
            ? "Sign in to see your matched jobs."
            : "Sign up to build your student profile."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <label className="block">
              <span className="text-xs font-medium text-gray-300">Full name</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Aarav Sharma"
                className={inputClass}
              />
            </label>
          )}

          <label className="block">
            <span className="text-xs font-medium text-gray-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-gray-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isLocalMode()}
              minLength={isLocalMode() ? undefined : 6}
              placeholder={
                isLocalMode() ? "Not needed in local mode" : "At least 6 characters"
              }
              className={inputClass}
            />
          </label>

          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-300">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs text-emerald-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-gradient-to-b from-white via-white/95 to-white/60 text-black px-4 py-2.5 text-sm font-medium transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60 shadow-md cursor-pointer mt-2"
          >
            {busy
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
            setMessage(null);
          }}
          className="mt-5 w-full text-center text-xs text-gray-400 hover:text-white transition cursor-pointer"
        >
          {mode === "login"
            ? "New here? Create an account"
            : "Already registered? Sign in"}
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-gray-500">
        {isLocalMode()
          ? "Running in local mode with the built-in file store."
          : "Supabase auth is required. See "}
        {!isLocalMode() && (
          <>
            <Link href="/" className="underline text-gray-400 hover:text-white">
              the home page
            </Link>{" "}
            for setup steps.
          </>
        )}
      </p>
    </div>
  );
}
