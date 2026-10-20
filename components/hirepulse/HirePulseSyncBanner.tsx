"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, RefreshCw, CheckCircle2 } from "lucide-react";
import { fetchSyncStatus, SyncStatusData } from "@/lib/hirepulse/api";

interface HirePulseSyncBannerProps {
  onRefreshFeed: () => void;
  isRefreshingFeed?: boolean;
}

export function HirePulseSyncBanner({ onRefreshFeed, isRefreshingFeed = false }: HirePulseSyncBannerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(12 * 3600);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [manualSpin, setManualSpin] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const data: SyncStatusData = await fetchSyncStatus();
      setSecondsRemaining(data.seconds_remaining);
      setLastSyncTime(data.last_sync_at);
    } catch {
      setSecondsRemaining((prev) => (prev > 0 ? prev : 12 * 3600));
    }
  }, []);

  useEffect(() => {
    loadStatus();
    const statusInterval = setInterval(loadStatus, 60000);
    return () => clearInterval(statusInterval);
  }, [loadStatus]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          onRefreshFeed();
          setJustRefreshed(true);
          setTimeout(() => setJustRefreshed(false), 5000);
          loadStatus();
          return 12 * 3600;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRefreshFeed, loadStatus]);

  const handleManualRefresh = async () => {
    setManualSpin(true);
    onRefreshFeed();
    await loadStatus();
    setJustRefreshed(true);
    setTimeout(() => {
      setManualSpin(false);
      setTimeout(() => setJustRefreshed(false), 3000);
    }, 1000);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      h: String(hours).padStart(2, "0"),
      m: String(minutes).padStart(2, "0"),
      s: String(seconds).padStart(2, "0"),
    };
  };

  const { h, m, s } = formatTime(secondsRemaining);

  return (
    <div className="relative rounded-xl border border-gray-800 bg-black/60 p-3.5 sm:p-4 mb-6 backdrop-blur-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-800 text-white border border-gray-700 shrink-0">
            <Clock className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
              <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse inline-block" />
                12-Hour Automated Sync Cadence
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700 font-medium">
                Auto-Refresh Active
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Feed automatically fetches and refreshes fresh listings from official ATS APIs every 12 hours.
              {lastSyncTime && (
                <span className="text-gray-500 hidden md:inline">
                  {" "}• Last synced: {new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-gray-950/90 border border-gray-800 rounded-lg px-3 py-1.5">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mr-1">Next Sync:</span>
            <div className="flex items-baseline font-mono text-sm sm:text-base font-bold text-white">
              <span>{h}</span>
              <span className="text-gray-500 px-0.5">:</span>
              <span>{m}</span>
              <span className="text-gray-500 px-0.5">:</span>
              <span className="text-gray-300">{s}</span>
            </div>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshingFeed || manualSpin}
            title="Refresh job feed now"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-gray-200 text-black shadow-sm disabled:opacity-50 transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${(isRefreshingFeed || manualSpin) ? "animate-spin text-black" : ""}`} />
            <span className="hidden sm:inline">Refresh Now</span>
          </button>
        </div>
      </div>

      {justRefreshed && (
        <div className="mt-2 pt-2 border-t border-gray-800 flex items-center justify-center gap-1.5 text-xs text-white">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Job feed refreshed with the latest ATS data.</span>
        </div>
      )}
    </div>
  );
}
