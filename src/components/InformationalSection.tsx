import React from 'react';
import DailyAlertsBanner from '@/components/DailyAlertsBanner';

export default function InformationalSection() {
  return (
    <div className="w-full flex flex-col gap-6 mt-6 md:mt-8 mb-8">
      {/* 1. PWA Banner (Top) */}
      <div className="w-full">
        <DailyAlertsBanner />
      </div>

      {/* 2. How to Pray Today (Middle) */}
      <div className="bg-blue-50 rounded-2xl p-6 md:p-8 text-center shadow-sm border border-blue-100">
        <h3 className="text-xl md:text-2xl font-bold text-primary-deepBlue mb-4">How to Pray Today</h3>
        <div className="flex justify-center">
          <ul className="text-sm md:text-base text-text-dark space-y-3 text-left list-none">
            <li className="flex items-start">
              <span className="text-primary-gold mr-3 font-bold">✓</span>
              Please pray for the peace of Jerusalem.
            </li>
            <li className="flex items-start">
              <span className="text-primary-gold mr-3 font-bold">✓</span>
              Pray for the people of Israel and the surrounding region.
            </li>
            <li className="flex items-start">
              <span className="text-primary-gold mr-3 font-bold">✓</span>
              Pray for those who are suffering.
            </li>
            <li className="flex items-start">
              <span className="text-primary-gold mr-3 font-bold">✓</span>
              Pray for comfort for the grieving, wisdom for leaders, protection for civilians, and salvation for Jews and Arabs alike.
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Subscribe Card (Bottom) */}
      <div className="w-full bg-primary-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm flex flex-col justify-between">
        <div className="text-center md:text-left">
          <h4 className="text-lg md:text-xl font-bold text-primary-deepBlue mb-3">Join The Daily Prayer Watch</h4>
          <p className="text-sm md:text-base text-text-dark opacity-80 mb-6">
            Pray with purpose. Know the facts. Get a daily briefing with firsthand insights from Israeli believers—equipping you to understand what’s happening and know how to pray.
          </p>
        </div>
        <a
          href="https://allisraelnews.com/subscribe-pray-for-israel"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-primary-deepBlue text-primary-white font-bold py-3 px-4 rounded-xl hover:bg-blue-900 transition-colors shadow-sm"
        >
          Subscribe
        </a>
      </div>
    </div>
  );
}
