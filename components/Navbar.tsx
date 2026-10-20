"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getSessionUserId, signOutUser } from "@/lib/session";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const id = await getSessionUserId();
      setUserId(id);
    } catch {
      setUserId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [pathname]);

  const handleSignOut = async () => {
    await signOutUser();
    setUserId(null);
    window.dispatchEvent(new Event("auth-changed"));
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2.5 tracking-tight group">
          <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
          <span className="text-lg font-semibold text-white group-hover:text-white/90 transition">
            Rozgar Radar
          </span>
          <span className="rounded-full bg-gray-800/60 border border-gray-700/60 px-2.5 py-0.5 text-[10px] font-medium text-gray-300 hidden sm:inline-block">
            AI Job Engine
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {!loading && (
            <>
              {userId ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                      pathname === "/dashboard"
                        ? "bg-white text-black font-semibold"
                        : "text-white/80 hover:text-white hover:bg-gray-800/50"
                    }`}
                  >
                    Dashboard
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center justify-center rounded-md border border-gray-700 bg-gray-800/80 px-3.5 py-1.5 text-xs font-medium text-gray-300 transition hover:bg-gray-700 hover:text-white active:scale-95 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-md bg-white px-4 py-1.5 text-xs font-medium text-black transition hover:bg-gray-200 active:scale-95 shadow-sm"
                >
                  Sign In
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
