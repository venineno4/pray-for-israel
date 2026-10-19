"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

/**
 * Live "CURRENTLY PRAYING" stats for the widget.
 *
 * IMPORTANT: This intentionally mirrors the exact query + filtering used by the
 * main site's `LiveDashboard` ("All Countries (Live)" view), so the widget's
 * "LIVE WATCHMEN ON MAP" number is always identical to the main site's
 * "Prayer Statistics → CURRENTLY PRAYING" counter:
 *   - table `prayers`, `is_active = true`, `started_at` within the last 10 minutes
 *   - Palestine rows are excluded from the live feed
 *   - refreshed on every Supabase realtime change + every 30s
 *
 * `LiveDashboard` itself is deliberately left untouched (zero-regression rule).
 */

const LIVE_WINDOW_MS = 10 * 60 * 1000;
const REFRESH_INTERVAL_MS = 30_000;

export interface LivePrayerStats {
  /** null until the first fetch resolves */
  count: number | null;
  /** Countries with at least one active prayer, sorted by count (desc) */
  activeCountries: string[];
  refresh: () => Promise<void>;
  /** Instantly reflect a just-started prayer before the server round-trip completes */
  applyOptimistic: (country: string) => void;
}

export function useLivePrayerStats(): LivePrayerStats {
  const [count, setCount] = useState<number | null>(null);
  const [activeCountries, setActiveCountries] = useState<string[]>([]);
  const requestSeq = useRef(0);

  const refresh = useCallback(async () => {
    const seq = ++requestSeq.current;
    const tenMinsAgo = new Date(Date.now() - LIVE_WINDOW_MS).toISOString();

    const { data, error } = await supabase
      .from("prayers")
      .select("country")
      .gte("started_at", tenMinsAgo)
      .eq("is_active", true);

    // Ignore out-of-order responses (an older request finishing after a newer one)
    if (seq !== requestSeq.current) return;
    if (error || !data) return;

    const filtered = data.filter(
      (row: any) =>
        row.country &&
        !row.country.toLowerCase().includes("palestine") &&
        row.country !== "PS"
    );

    const breakdown = filtered.reduce((acc: Record<string, number>, row: any) => {
      acc[row.country] = (acc[row.country] || 0) + 1;
      return acc;
    }, {});

    setCount(filtered.length);
    setActiveCountries(
      Object.entries(breakdown)
        .sort((a, b) => b[1] - a[1])
        .map(([country]) => country)
    );
  }, []);

  const applyOptimistic = useCallback((country: string) => {
    setCount((c) => (c ?? 0) + 1);
    setActiveCountries((list) => (list.includes(country) ? list : [country, ...list]));
  }, []);

  useEffect(() => {
    refresh();

    const intervalId = setInterval(refresh, REFRESH_INTERVAL_MS);

    const channel = supabase
      .channel("widget_live_prayers_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "prayers" }, () => {
        refresh();
      })
      .subscribe();

    // Browsers throttle timers in background tabs / offscreen iframes;
    // resync as soon as the widget becomes visible again.
    const onVisible = () => {
      if (document.visibilityState !== "hidden") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  return { count, activeCountries, refresh, applyOptimistic };
}
