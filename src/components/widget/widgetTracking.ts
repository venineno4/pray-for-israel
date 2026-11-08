"use client";

import { useEffect, useState } from "react";

/**
 * GA4 + placement helpers for the embeddable widgets (/widget, /widget-wide).
 *
 * Three placements are distinguished in GA4 ("Session source / medium"):
 *   - /widget on desktop       → allisraelnews / widget-sidebar
 *   - /widget-wide on desktop  → allisraelnews / widget-article-desktop
 *   - either widget on mobile  → allisraelnews / widget-article-mobile
 *
 * The iframe width can't tell desktop sidebar from mobile (both ~300px), so the
 * device type is detected from the user agent instead.
 *
 * The main site's analytics are not touched; this module is imported only by the widgets.
 */

export type WidgetVariant = "sidebar" | "article";

export type WidgetPlacement = "widget-sidebar" | "widget-article-desktop" | "widget-article-mobile";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

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
  if (mobile) return "widget-article-mobile";
  return variant === "sidebar" ? "widget-sidebar" : "widget-article-desktop";
}

/** utm_medium for the outbound links (header, LIVE badge, "prayforisrael.live ↗"). */
export function getOutboundLinkMedium(variant: WidgetVariant, mobile = isMobileDevice()): string {
  if (variant === "sidebar") return mobile ? "widget-mobile-link" : "widget-sidebar-link";
  return mobile ? "widget-article-mobile-link" : "widget-article-desktop-link";
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
export function ensureGtag(): (...args: unknown[]) => void {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  }
  return window.gtag;
}

/**
 * Same event the main site sends after a successful /api/pray
 * (`prayer_successfully_started` with `country`), plus `widget_placement`.
 * No-op if GA isn't configured for the widget.
 */
export function trackWidgetPrayer(variant: WidgetVariant, country: string): void {
  if (typeof window === "undefined" || !window.gtag) return;
  try {
    window.gtag("event", "prayer_successfully_started", {
      country,
      widget_placement: getWidgetPlacement(variant),
    });
  } catch {
    /* analytics must never break the widget */
  }
}
