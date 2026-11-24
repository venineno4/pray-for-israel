/**
 * Installed-PWA (standalone) launch detection for the main site's GA4 attribution.
 *
 * Used in two places:
 *  - `(site)/layout.tsx` injects `PWA_GA_CAMPAIGN_SCRIPT` into <head>, so that a
 *    standalone launch without its own `utm_source` gets `pwa / installed-app`
 *    campaign values BEFORE `<GoogleAnalytics>` runs `gtag('config')` and sends
 *    the first page_view. Plain browser visits are left completely untouched.
 *  - `PulsePrayerButton` adds `launch_mode` to `prayer_successfully_started`.
 *
 * NOTE: medium is deliberately "installed-app" (never "mobile"), so GA4 does not
 * classify this traffic as "Mobile Push Notifications".
 */

export const PWA_CAMPAIGN = {
  campaign_source: 'pwa',
  campaign_medium: 'installed-app',
  campaign_name: 'pwa-home',
} as const;

/** True when the page runs as an installed app (Android/desktop standalone, iOS home screen, Android TWA). */
export function isPwaStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  } catch {
    return false;
  }
}

/**
 * Inline, dependency-free version of the check above (it runs in <head> before
 * any bundle is loaded). `@next/third-parties`' <GoogleAnalytics> does not accept
 * extra config params, so the campaign values are queued with `gtag('set', …)`
 * ahead of its `gtag('js')` / `gtag('config')` calls; gtag.js processes the
 * dataLayer in order, so they already apply to the initial page_view.
 */
export const PWA_GA_CAMPAIGN_SCRIPT = `(function(){try{
var standalone=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true||document.referrer.indexOf('android-app://')!==-1;
if(!standalone)return;
if(new URLSearchParams(window.location.search).has('utm_source'))return;
window.dataLayer=window.dataLayer||[];
function gtag(){window.dataLayer.push(arguments);}
gtag('set',${JSON.stringify(PWA_CAMPAIGN)});
}catch(e){}})();`;
