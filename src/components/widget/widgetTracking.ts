"use client";

import { useEffect, useState } from "react";

/**
 * GA4 + placement helpers for the embeddable widgets (/widget, /widget-wide).
 *
 * Three placements are distinguished in GA4 ("Session source / medium"):
 *   - /widget on desktop       → allisraelnews / widget-sidebar
 *   - /widget-wide on desktop  → allisraelnews / widget-article-desktop
 *   - either widget on mobile  → allisraelnews / widget-article-mob
 *
 * NOTE: mediums deliberately say "mob", never "mobile" — GA4's Default Channel
 * Grouping classifies any medium containing "mobile" as "Mobile Push Notifications".
 *
 * GA4 is initialised LAZILY: nothing is loaded and no request is sent to Google
 * when the iframe merely loads (passive article readers produce zero GA traffic —
 * no first_visit / session_start / user_engagement). gtag.js is loaded, configured
 * and the event sent only after a prayer was successfully started in the widget.
 *
 * The iframe width can't tell desktop sidebar from mobile (both ~300px), so the
 * device type is detected from the user agent instead.
 *
 * The main site's analytics are not touched; this module is imported only by the widgets.
 */

export type WidgetVariant = "sidebar" | "article";

export type WidgetPlacement = "widget-sidebar" | "widget-article-desktop" | "widget-article-mob";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// Same Measurement ID as the main site (inlined at build time).
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/** Phones and tablets (incl. iPadOS, which reports a desktop "Macintosh" UA). */
export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const uaData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData;
  if (uaData?.mobile) return true;
  const ua = navigator.userAgent || "";
  if (/Mobi|Android|iPhone|iPod|iPad|Windows Phone|BlackBerry|Opera Mini/i.test(ua)) return true;
  return /Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1;
}

export function getWidgetPlacement(variant: WidgetVariant, mobile = isMobileDevice()): WidgetPlacement {
  if (mobile) return "widget-article-mob";
  return variant === "sidebar" ? "widget-sidebar" : "widget-article-desktop";
}

/** utm_medium for the outbound links (header, LIVE badge, "prayforisrael.live ↗"). */
export function getOutboundLinkMedium(variant: WidgetVariant, mobile = isMobileDevice()): string {
  if (variant === "sidebar") return mobile ? "widget-mob-link" : "widget-sidebar-link";
  return mobile ? "widget-article-mob-link" : "widget-article-desktop-link";
}

export function buildMainSiteUrl(medium: string): string {
  return `https://prayforisrael.live/?utm_source=allisraelnews&utm_medium=${medium}&utm_campaign=live-map`;
}

/**
 * Outbound link URL. Server-render / first paint uses the desktop value; the
 * mobile value is applied right after mount (avoids a hydration mismatch, since
 * the device type is only known in the browser).
 */
export function useMainSiteUrl(variant: WidgetVariant): string {
  const [url, setUrl] = useState(() => buildMainSiteUrl(getOutboundLinkMedium(variant, false)));
  useEffect(() => {
    setUrl(buildMainSiteUrl(getOutboundLinkMedium(variant)));
  }, [variant]);
  return url;
}

/** Same gtag() shim as Google's snippet (gtag.js requires real `arguments` objects). */
function ensureGtag(): (...args: unknown[]) => void {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  }
  return window.gtag;
}

let gaInitialized = false;

/**
 * Load + configure GA4 on demand (once per page). Commands are queued in
 * dataLayer and processed by gtag.js as soon as it has loaded.
 *   - send_page_view: false — host-page loads never create page_views
 *   - cookie_flags 'SameSite=None;Secure;Partitioned' — cookies inside a cross-site iframe (CHIPS)
 *   - campaign source/medium/name per placement → own "Session source / medium" rows
 */
function initGaOnDemand(gaId: string, variant: WidgetVariant): (...args: unknown[]) => void {
  const gtag = ensureGtag();
  if (gaInitialized) return gtag;
  gaInitialized = true;

  gtag("js", new Date());
  gtag("config", gaId, {
    send_page_view: false,
    cookie_flags: "SameSite=None;Secure;Partitioned",
    campaign_source: "allisraelnews",
    campaign_medium: getWidgetPlacement(variant),
    campaign_name: "live-map",
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.appendChild(script);
  return gtag;
}

/**
 * Called only after /api/pray succeeded: lazily initialises GA4 and sends the same
 * event the main site sends (`prayer_successfully_started` with `country`), plus
 * `widget_placement`. No-op if no GA ID is configured.
 */
export function trackWidgetPrayer(variant: WidgetVariant, country: string): void {
  if (typeof window === "undefined" || !GA_ID) return;
  try {
    const gtag = initGaOnDemand(GA_ID, variant);
    gtag("event", "prayer_successfully_started", {
      country,
      widget_placement: getWidgetPlacement(variant),
    });
  } catch {
    /* analytics must never break the widget */
  }
}
