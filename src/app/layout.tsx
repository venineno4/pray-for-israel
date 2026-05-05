import { Inter } from 'next/font/google';
import { Metadata, Viewport } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import MetaPixel from '@/components/MetaPixel';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Pray for Israel Live | 24/7 Global Prayer Map",
  description: "Join the global live prayer for Israel from your country. See who is praying worldwide right now!",
  manifest: '/manifest.json',
  metadataBase: new URL("https://prayforisrael.live"),
  openGraph: {
    title: "Pray for Israel Live | 24/7 Global Prayer Map",
    description: "Join the global live prayer for Israel from your country. See who is praying worldwide right now!",
    url: "https://prayforisrael.live",
    siteName: 'Pray for Israel',
    images: [
      {
        url: "https://prayforisrael.live/og-image.jpg",
        width: 1024,
        height: 1024,
        alt: 'Pray for Israel — You are not praying alone.',
      },
    ],
    locale: "en_US",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Pray for Israel Live | 24/7 Global Prayer Map",
    description: "Join the global live prayer for Israel from your country. See who is praying worldwide right now!",
    images: ["https://prayforisrael.live/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <body className={`${inter.className} bg-primary-white text-text-dark antialiased`}>
        {children}
        
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <MetaPixel />

        {/* OneSignal SDK */}
        <Script
          src="https://cdn.onesignal.com/sdks/OneSignalSDK.js"
          strategy="afterInteractive"
        />
        
        {/* OneSignal Init */}
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignal = window.OneSignal || [];
            OneSignal.push(function() {
              OneSignal.init({
                appId: "${process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || 'ca6f9c1b-5b6f-4338-9eca-4a6ba408f3eb'}",
                safari_web_id: "${process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_ID || 'web.onesignal.auto.2c31ff0c-1624-4aec-8f89-a4f0b1da0ea1'}",
                notifyButton: {
                  enable: false,
                },
                allowLocalhostAsSecureOrigin: true,
                chrome_web_icon: "https://prayforisrael.live/onesignal-icon.png",
                firefox_icon: "https://prayforisrael.live/onesignal-icon.png",
                welcomeNotification: {
                  "title": "Pray for Israel Live",
                  "message": "Thanks for subscribing!",
                  "icon": "https://prayforisrael.live/onesignal-icon.png"
                }
              });
            });
          `}
        </Script>
      </body>
    </html>
  );
}
