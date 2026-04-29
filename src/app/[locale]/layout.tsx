import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { Metadata, Viewport } from 'next';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Index' });

  return {
    title: t('title') || 'Pray for Israel Live',
    description: t('description') || 'Join the global community praying for Israel in real-time.',
    manifest: '/manifest.json',
    metadataBase: new URL('https://prayforisrael.live'),
    openGraph: {
      title: t('title') || 'Pray for Israel Live',
      description: t('description') || 'Join the global community praying for Israel in real-time.',
      url: 'https://prayforisrael.live',
      siteName: 'Pray for Israel Live',
      locale: locale,
      type: 'website',
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
      </body>
    </html>
  );
}
