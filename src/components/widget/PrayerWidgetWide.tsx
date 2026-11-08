"use client";

// Must stay the FIRST import: patches blocked iframe storage before Supabase loads.
import "./storageShim";
import { useCallback, useEffect, useState } from "react";
import nextDynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useLivePrayerStats } from "./useLivePrayerStats";
import { useWidgetPrayerSession } from "./useWidgetPrayerSession";
import WidgetCountryPicker from "./WidgetCountryPicker";
import { trackWidgetPrayer, useMainSiteUrl } from "./widgetTracking";

/**
 * Wide (article-footer, ~728–780 × 250–260) variant of the live widget, served at /widget-wide.
 *
 * Reuses all widget logic (live stats, prayer session, one-click picker, iframe-safe
 * storage) and the badge / CTA / picker styles of the 300×250 widget. Only the
 * header (horizontal) and the map fitting (whole map, no cropping) differ — see
 * `src/app/widget-wide/widget-wide.css`. The 300×250 `PrayerWidget` is untouched.
 */

// Same map component as the main site (unchanged).
const LiveMap = nextDynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => null,
});

// Every click-through link (header, live badge, "prayforisrael.live ↗") opens the
// main site in a new tab, UTM-tagged per device (see useMainSiteUrl). The map
// background and the CTA area are intentionally NOT links.
const VARIANT = "article" as const;

function formatRemaining(ms: number) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PrayerWidgetWide() {
  const stats = useLivePrayerStats();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const MAIN_SITE_URL = useMainSiteUrl(VARIANT);

  const session = useWidgetPrayerSession({
    onStarted: (country) => {
      // Counter bumps instantly; then resync with the DB (also triggered by realtime)
      stats.applyOptimistic(country);
      stats.refresh();
      // Same GA4 event as the main site (+ widget_placement); runs only after /api/pray succeeded
      trackWidgetPrayer(VARIANT, country);
    },
    onStopped: () => {
      stats.refresh();
    },
  });

  // Countdown tick while praying
  useEffect(() => {
    if (!session.isActive) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [session.isActive]);

  // Auto-hide error toast
  const { error, clearError } = session;
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(clearError, 5000);
    return () => clearTimeout(t);
  }, [error, clearError]);

  const handleMainButton = () => {
    if (session.isSubmitting) return;
    if (session.isActive) {
      session.stopPraying();
    } else {
      clearError();
      setPickerOpen(true);
    }
  };

  const handleCountrySubmit = useCallback(
    (country: string) => {
      setPickerOpen(false);
      session.startPraying(country);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session.startPraying]
  );

  const closePicker = useCallback(() => setPickerOpen(false), []);

  const count = stats.count;
  const noun = count === 1 ? "WATCHMAN" : "WATCHMEN";
  const remaining = session.until ? formatRemaining(session.until - now) : "10:00";

  return (
    <div className="pfw-root pfww-root">
      {/* ── Header (horizontal) ────────────────────────────── */}
      <a
        className="pfww-header"
        href={MAIN_SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open Pray for Israel Live"
      >
        <h1 className="pfww-title">Pray for Israel</h1>
        <span className="pfww-amp" aria-hidden="true">
          &amp;
        </span>
        <p className="pfww-subtitle">
          Show the world one more watchman
          <br />
          praying for the peace of Jerusalem.
        </p>
      </a>

      {/* ── Live map + controls ────────────────────────────── */}
      <div className="pfw-stage">
        <div className="pfw-map pfww-map" aria-hidden="true">
          <LiveMap activeCountries={stats.activeCountries} />
        </div>

        {/* Top bar: live badge (left) + discreet site link (right) — both open the main site */}
        <div className="pfw-topbar">
          <a
            className="pfw-badge"
            href={MAIN_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`LIVE: ${count === null ? "–" : count} ${noun} on map – open prayforisrael.live`}
          >
            <span className="pfw-badge-dot">
              <span className="pfw-badge-dot-ping" />
              <span className="pfw-badge-dot-core" />
            </span>
            <span className="pfw-badge-text" aria-live="polite">
              LIVE: {count === null ? "–" : count.toLocaleString("en-US")} {noun} ON MAP
            </span>
          </a>
          <a className="pfw-sitelink" href={MAIN_SITE_URL} target="_blank" rel="noopener noreferrer">
            prayforisrael.live ↗
          </a>
        </div>

        <div className="pfw-cta-wrap">
          <AnimatePresence>
            {session.error && (
              <motion.p
                key="err"
                className="pfw-toast"
                role="alert"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
              >
                {session.error}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="pfw-cta-anchor">
            {session.isActive && (
              <>
                <span className="pfw-ripple pfw-ripple-gold" aria-hidden="true" />
                <span className="pfw-ripple pfw-ripple-blue" aria-hidden="true" />
              </>
            )}
            <motion.button
              type="button"
              onClick={handleMainButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`pfw-cta ${session.isActive ? "is-active" : ""}`}
              aria-label={session.isActive ? "Praying – tap to stop" : "Click and pray"}
              title={session.isActive ? "Tap to stop praying" : undefined}
            >
              {session.isActive ? "Praying..." : "CLICK & PRAY"}
            </motion.button>
          </div>

          {session.isActive && (
            <p className="pfw-cta-caption">
              {session.country ? `Joined from ${session.country} · ` : ""}Auto-close in {remaining}
            </p>
          )}
        </div>
      </div>

      <WidgetCountryPicker isOpen={pickerOpen} onClose={closePicker} onSubmit={handleCountrySubmit} />
    </div>
  );
}
