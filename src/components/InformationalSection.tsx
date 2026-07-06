import React from 'react';

export default function InformationalSection() {
  return (
    <div className="w-full flex flex-col gap-6 mt-6 md:mt-8 mb-8">
      {/* Top Section */}
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

      {/* Bottom Section */}
      <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-stretch w-full">
        {/* Left Column */}
        <div className="flex-1 bg-primary-white rounded-2xl p-6 md:p-8 border-2 border-primary-deepBlue shadow-sm flex flex-col justify-between">
          <div className="text-center md:text-left">
            <h4 className="text-lg md:text-xl font-bold text-primary-deepBlue mb-3">Pray with Purpose. Know the Facts.</h4>
            <p className="text-sm md:text-base text-text-dark opacity-80 mb-6">
              Get the latest news, expert analysis, and urgent prayer points directly from Israeli evangelical believers with boots on the ground.
            </p>
          </div>
          <a
            href="https://allisraelnews.com/?utm_source=prayforisrael.live&utm_medium=referral&utm_campaign=live-map"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-primary-gold text-primary-deepBlue font-bold py-3 px-4 rounded-xl hover:bg-yellow-500 transition-colors shadow-sm"
          >
            Read ALL ISRAEL NEWS
          </a>
        </div>

        {/* Divider Desktop */}
        <div className="hidden md:flex flex-col justify-center items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-background-light p-3 rounded-full font-bold text-gray-400 border-2 border-gray-100 text-sm shadow-sm">
            OR
          </div>
        </div>
        
        {/* Divider Mobile */}
        <div className="md:hidden flex justify-center items-center my-[-16px] z-10 relative">
          <div className="bg-background-light px-4 py-2 rounded-full font-bold text-gray-400 border-2 border-gray-100 text-sm shadow-sm">
            OR
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1 bg-primary-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="text-center md:text-left">
            <h4 className="text-lg md:text-xl font-bold text-primary-deepBlue mb-3">Join The Daily Prayer Watch</h4>
            <p className="text-sm md:text-base text-text-dark opacity-80 mb-6">
              Sign up to receive a daily newsletter and get fresh news, in-depth analysis, exclusive videos, and specific prayer topics straight from Israel to your inbox.
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
    </div>
  );
}
