import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./widget.css";

/**
 * Root layout for the embeddable /widget route.
 *
 * The main site lives in the `(site)` route group with its own root layout
 * (Meta Pixel, GA, OneSignal, globals.css). This layout is completely separate,
 * so the iframe stays lightweight, fires no main-site tracking events on the
 * host page's impressions, and cannot affect the main page's UI in any way.
 */

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pray for Israel – Live Prayer Map Widget",
  description: "Live map of believers praying for the peace of Jerusalem right now.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="pfw-html">
      <body className={`${inter.className} pfw-body`}>{children}</body>
    </html>
  );
}
