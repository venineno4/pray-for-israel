"use client";

import { useEffect } from "react";
import Script from "next/script";
import { ensureGtag, getWidgetPlacement, type WidgetVariant } from "./widgetTracking";

/**
 * GA4 for the embeddable widgets — same Measurement ID as the main site, but:
 *   - `send_page_view: false`: host-page (allisraelnews.com) loads never create page_views
 *   - `cookie_flags: 'SameSite=None;Secure'`: required for cookies inside a cross-site iframe
 *   - campaign source/medium/name set per placement, so widget sessions get their own
 *     "Session source / medium" rows (allisraelnews / widget-sidebar | widget-article-desktop
 *     | widget-article-mobile)
 * Only events explicitly sent by the widget (prayer_successfully_started) reach GA4.
 * No Meta Pixel / OneSignal here.
 */
export default function WidgetAnalytics({ gaId, variant }: { gaId?: string; variant: WidgetVariant }) {
  useEffect(() => {
    if (!gaId) return;
    const gtag = ensureGtag();
    gtag("js", new Date());
    gtag("config", gaId, {
      send_page_view: false,
      cookie_flags: "SameSite=None;Secure",
      campaign_source: "allisraelnews",
      campaign_medium: getWidgetPlacement(variant),
      campaign_name: "live-map",
    });
  }, [gaId, variant]);

  if (!gaId) return null;
  return (
    <Script
      id="pfw-gtag"
      src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
      strategy="afterInteractive"
    />
  );
}
