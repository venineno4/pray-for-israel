import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
// Shared 300×250 widget styles (file unchanged) + wide-only layout on top.
import "../widget/widget.css";
import "./widget-wide.css";

/**
 * Root layout for the wide embeddable /widget-wide route (article footer, ~728–780 × 250–260).
 *
 * Same clean setup as /widget: separate from the main site's `(site)` root layout,
 * so no Meta Pixel / GA / OneSignal / globals.css. Reuses the 300×250 widget's
 * stylesheet unchanged and adds the wide-only layout on top.
 */

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pray for Israel – Live Prayer Map Widget (wide)",
  description: "Live map of believers praying for the peace of Jerusalem right now.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function WidgetWideLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="pfw-html">
      <body className={`${inter.className} pfw-body`}>{children}</body>
    </html>
  );
}
