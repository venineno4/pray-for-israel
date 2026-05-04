import { useTranslations } from 'next-intl';
import PulsePrayerButton from '@/components/PulsePrayerButton';
import LiveDashboard from '@/components/LiveDashboard';

export default function Home() {
  const t = useTranslations('Index');
  
  return (
    <main className="min-h-screen flex flex-col items-center py-1 md:py-6 px-3 md:px-4 bg-primary-white">
      {/* Header Section */}
      <div className="text-center max-w-4xl mb-2 md:mb-6 mt-0 md:mt-4">
        <h1 className="text-xl md:text-3xl font-black text-primary-deepBlue mb-1 leading-tight tracking-tight">
          {t('title')}
        </h1>
        <p className="text-sm md:text-lg text-text-dark opacity-80 leading-snug md:leading-relaxed max-w-2xl mx-auto font-bold">
          {t('description')}
        </p>
      </div>

      {/* Desktop Grid Wrapper / Mobile Flex Wrapper */}
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-[1fr_2fr] lg:gap-8 lg:items-start mt-0 md:mt-4">
        {/* Main Interactive Button - Left Column Desktop, Bottom Mobile */}
        <div className="order-2 lg:order-1 mb-4 lg:mb-0 flex justify-center lg:sticky lg:top-8 mt-4 lg:mt-0">
          <PulsePrayerButton label={t('ctaButton')} />
        </div>

        {/* Live Dashboard Section - Right Column Desktop, Top Mobile */}
        <div className="order-1 lg:order-2 w-full">
          <LiveDashboard count={1245} />
        </div>
      </div>

      {/* Footer Section */}
      <footer className="w-full text-center mt-12 md:mt-16 pb-4">
        <p className="text-sm text-gray-500">
          Sponsored by <a href="https://allisraelnews.com" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-gray-800 hover:underline transition-colors">All Israel News</a>
        </p>
      </footer>
    </main>
  );
}
