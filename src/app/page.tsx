import PulsePrayerButton from '@/components/PulsePrayerButton';
import LiveDashboard from '@/components/LiveDashboard';
import InformationalSection from '@/components/InformationalSection';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center py-1 md:py-6 px-0 md:px-4 bg-primary-white overflow-x-hidden">
      {/* Header Section */}
      <div className="text-center max-w-4xl mb-2 md:mb-6 mt-0 md:mt-4 px-4 md:px-0">
        <h1 className="text-3xl md:text-5xl font-black text-primary-deepBlue mb-0 leading-tight tracking-tight">
          Pray for Israel
        </h1>
        <div className="flex justify-center items-center my-[-2px] md:my-0">
          <span className="text-2xl md:text-3xl font-serif italic text-primary-gold opacity-90 leading-none">&amp;</span>
        </div>
        <p className="text-xs md:text-sm text-text-dark opacity-80 leading-snug md:leading-relaxed max-w-[260px] md:max-w-[340px] mx-auto font-bold text-balance mt-0 line-clamp-2">
          Show the world one more watchman praying for the peace of Jerusalem.
        </p>
      </div>

      {/* Desktop Grid Wrapper */}
      <div className="w-full max-w-6xl mx-auto lg:grid lg:grid-cols-[1fr_2fr] lg:gap-8 lg:items-start mt-0 md:mt-4">
        {/* Main Interactive Button - Left Column */}
        <div className="mb-4 lg:mb-0 flex justify-center lg:sticky lg:top-8 mt-4 lg:mt-0 px-4 md:px-0">
          <PulsePrayerButton label="Click & Pray" />
        </div>

        {/* Live Dashboard Section - Right Column */}
        <div className="w-full">
          <LiveDashboard count={1245} />
          <InformationalSection />
        </div>
      </div>


      {/* Footer Section */}
      <footer className="w-full text-center mt-12 md:mt-16 pb-4">
        <p className="text-sm text-gray-500">
          By <a href="https://allisraelnews.com?utm_source=prayforisrael.live&utm_medium=referral&utm_campaign=live-map" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-gray-800 hover:underline transition-colors">All Israel News</a>
        </p>
      </footer>
    </main>
  );
}
