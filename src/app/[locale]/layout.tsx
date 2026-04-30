import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { Metadata, Viewport } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const title = "Pray for Israel Live | 24/7 Global Prayer Map";
  const description = "Take part in a 24/7 global prayer movement for Israel. Pray silently wherever you are, and watch your country light up on the live map.";
  const url = "https://prayforisrael.live";
  const ogImage = "/og-image.png";

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
          width: 1200,
          height: 630,
          alt: 'Pray for Israel Live Map',
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

  return (
    <html lang={locale}>
      <body className={`${inter.className} bg-primary-white text-text-dark antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID as string} />
      </body>
    </html>
  );
}
