import { useTranslations } from 'next-intl';
import PulsePrayerButton from '@/components/PulsePrayerButton';
import LiveDashboard from '@/components/LiveDashboard';

export default function Home() {
  const t = useTranslations('Index');
  
  return (
    <main className="min-h-screen flex flex-col items-center py-1 md:py-6 px-3 md:px-4 bg-primary-white">
      {/* Header Section */}
      <div className="text-center max-w-4xl mb-1 md:mb-6 mt-0 md:mt-4">
        <h1 className="text-3xl md:text-5xl font-black text-primary-deepBlue mb-1 md:mb-2 leading-tight tracking-tight">
          {t('title')}
        </h1>
        <p className="text-sm md:text-xl text-text-dark opacity-80 leading-snug md:leading-relaxed max-w-2xl mx-auto font-bold">
          {t('description')}
        </p>
      </div>

      {/* Desktop Grid Wrapper */}
      <div className="w-full max-w-6xl mx-auto lg:grid lg:grid-cols-[1fr_2fr] lg:gap-8 lg:items-start mt-0 md:mt-4">
        {/* Main Interactive Button - Left Column */}
        <div className="mb-0 lg:mb-0 flex justify-center lg:sticky lg:top-8">
          <PulsePrayerButton label={t('ctaButton')} />
        </div>

        {/* Live Dashboard Section - Right Column */}
        <div className="w-full">
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
