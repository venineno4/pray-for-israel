import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { Metadata, Viewport } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import MetaPixel from '@/components/MetaPixel';
import Script from 'next/script';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const title = "Pray for Israel Live | 24/7 Global Prayer Map";
  const description = "Join the global live prayer for Israel from your country. See who is praying worldwide right now!";
  const url = "https://prayforisrael.live";
  // Absolute URL required — WhatsApp & Facebook crawlers do NOT follow relative paths
  const ogImage = "https://prayforisrael.live/og-image.jpg";
  const ogImageWidth = 1024;
  const ogImageHeight = 1024;

  return {
    title: title,
    description: description,
    manifest: '/manifest.json',
    metadataBase: new URL(url),
    openGraph: {
      title: title,
      description: description,
      url: url,
      siteName: 'Pray for Israel',
      images: [
        {
          url: ogImage,
          width: ogImageWidth,
          height: ogImageHeight,
          alt: 'Pray for Israel — You are not praying alone.',
        },
      ],
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [ogImage],
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF', // Updated to match Dignified Unity light background
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function RootLayout({
  children,
  params: { locale }
}: RootLayoutProps) {
  const messages = await getMessages();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang={locale}>
      <body className={`${inter.className} bg-primary-white text-text-dark antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        
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
