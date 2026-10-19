"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { safeStorage, randomId } from "./safeStorage";

/**
 * Prayer session logic for the embeddable widget.
 *
 * Mirrors the main site's `PulsePrayerButton` behaviour 1:1 (which itself is
 * left untouched):
 *   - persistent anonymous `pfi_user_id`
 *   - active session stored under `pfi_active_prayer` ({ until, sessionId, country })
 *   - 10-minute session with auto-close, then `is_active = false` in Supabase
 *   - submission through the same `/api/pray` endpoint → same IP rate limiting
 *     and the same server-side concurrent-session validation (by `user_id`)
 *   - `real_country` resolved through the same `/api/geo` endpoint
 *
 * Differences (iframe-specific only):
 *   - storage goes through `safeStorage` (localStorage → sessionStorage → memory),
 *     because cross-site iframes may have storage blocked
 *   - errors are surfaced as a message instead of `alert()` (which may be
 *     suppressed in iframes and is disruptive on a host page)
 */

export const PRAYER_DURATION_MS = 10 * 60 * 1000;
const USER_KEY = "pfi_user_id";
const ACTIVE_KEY = "pfi_active_prayer";

interface ActivePrayer {
  until: number;
  sessionId: string;
  country: string;
}

function readActivePrayer(): ActivePrayer | null {
  const raw = safeStorage.getItem(ACTIVE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ActivePrayer;
    if (parsed && typeof parsed.until === "number" && parsed.until > Date.now()) return parsed;
  } catch {
    /* corrupted entry */
  }
  safeStorage.removeItem(ACTIVE_KEY);
  return null;
}

// --- Visitor geo (same endpoint as the main site), fetched at most once per page ---
let geoPromise: Promise<string> | null = null;
export function fetchVisitorCountryCode(): Promise<string> {
  if (!geoPromise) {
    geoPromise = fetch("/api/geo")
      .then((r) => (r.ok ? r.json() : { country: "" }))
      .then((d) => (typeof d?.country === "string" ? d.country : ""))
      .catch(() => "");
  }
  return geoPromise;
}

interface Options {
  /** Called right after the backend accepted the prayer */
  onStarted?: (country: string) => void;
  /** Called after the session ended (manually or by auto-close) */
  onStopped?: () => void;
}

export function useWidgetPrayerSession({ onStarted, onStopped }: Options = {}) {
  const [isActive, setIsActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [country, setCountry] = useState("");
  const [until, setUntil] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userIdRef = useRef("");
  const sessionIdRef = useRef("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep latest callbacks without re-binding effects
  const onStartedRef = useRef(onStarted);
  const onStoppedRef = useRef(onStopped);
  onStartedRef.current = onStarted;
  onStoppedRef.current = onStopped;

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const stopPraying = useCallback(async (updateDb = true, targetSessionId?: string) => {
    setIsActive(false);
    setUntil(null);
    clearTimer();
    safeStorage.removeItem(ACTIVE_KEY);

    const idToStop = targetSessionId || sessionIdRef.current;
    // Always regenerate a fresh session ID for the NEXT prayer
    sessionIdRef.current = randomId();

    if (updateDb && idToStop) {
      try {
        await supabase.from("prayers").update({ is_active: false }).eq("session_id", idToStop);
      } catch (err) {
        console.error("[Widget] Failed to stop praying:", err);
      }
    }
    onStoppedRef.current?.();
  }, []);

  const scheduleAutoClose = useCallback(
    (endsAt: number, sessionId: string) => {
      clearTimer();
      timeoutRef.current = setTimeout(() => {
        stopPraying(true, sessionId);
      }, Math.max(0, endsAt - Date.now()));
    },
    [stopPraying]
  );

  const adoptActivePrayer = useCallback(
    (p: ActivePrayer) => {
      setIsActive(true);
      setCountry(p.country);
      setUntil(p.until);
      sessionIdRef.current = p.sessionId;
      scheduleAutoClose(p.until, p.sessionId);
    },
    [scheduleAutoClose]
  );

  // Init: user id + restore an in-progress session
  useEffect(() => {
    let storedUserId = safeStorage.getItem(USER_KEY);
    if (!storedUserId) {
      storedUserId = randomId();
      safeStorage.setItem(USER_KEY, storedUserId);
    }
    userIdRef.current = storedUserId;

    const active = readActivePrayer();
    if (active) {
      adoptActivePrayer(active);
    } else {
      sessionIdRef.current = randomId();
    }

    // Cross-tab sync (only fires when real localStorage is available)
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== ACTIVE_KEY) return;
      if (!e.newValue) {
        setIsActive(false);
        setUntil(null);
        clearTimer();
        return;
      }
      try {
        const data = JSON.parse(e.newValue) as ActivePrayer;
        if (data.until > Date.now()) adoptActivePrayer(data);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      clearTimer();
      window.removeEventListener("storage", handleStorage);
    };
  }, [adoptActivePrayer]);

  const startPraying = useCallback(
    async (selectedCountry: string) => {
      if (isSubmitting) return;
      setError(null);

      // Another tab/window of the same storage partition may already be praying
      const existing = readActivePrayer();
      if (existing) {
        adoptActivePrayer(existing);
        return;
      }

      const sessionId = sessionIdRef.current || randomId();
      sessionIdRef.current = sessionId;
      const endsAt = Date.now() + PRAYER_DURATION_MS;

      // Optimistic UI, exactly like the main site
      setCountry(selectedCountry);
      setIsActive(true);
      setUntil(endsAt);
      setIsSubmitting(true);
      safeStorage.setItem(
        ACTIVE_KEY,
        JSON.stringify({ until: endsAt, sessionId, country: selectedCountry })
      );

      const realCountry = await fetchVisitorCountryCode();

      try {
        const res = await fetch("/api/pray", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            user_id: userIdRef.current,
            country: selectedCountry,
            real_country: realCountry,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData?.error ||
              (res.status === 429
                ? "Too many requests. Please wait before praying again."
                : "Something went wrong. Please try again.")
          );
        }

        scheduleAutoClose(endsAt, sessionId);
        onStartedRef.current?.(selectedCountry);
      } catch (err: any) {
        console.error("[Widget] Failed to start praying:", err);
        setIsActive(false);
        setUntil(null);
        safeStorage.removeItem(ACTIVE_KEY);
        setError(err?.message || "Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, adoptActivePrayer, scheduleAutoClose]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    isActive,
    isSubmitting,
    country,
    until,
    error,
    clearError,
    startPraying,
    stopPraying: () => stopPraying(true),
  };
}
