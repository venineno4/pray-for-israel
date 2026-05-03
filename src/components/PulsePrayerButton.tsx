"use client";

import { motion, AnimatePresence } from "framer-motion";
import { sendGAEvent } from "@next/third-parties/google";
import { useState, useEffect, useRef } from "react";
import CountryModal from "./CountryModal";
import { supabase } from "@/utils/supabaseClient";

export default function PulsePrayerButton({ label = "Click & Pray" }: { label?: string }) {
  const [isActive, setIsActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [userId, setUserId] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Per-session ID: unique to this browser tab / prayer session
    setSessionId(crypto.randomUUID());

    // Persistent anonymous user ID: survives page reloads
    // This lets us count truly unique people across sessions
    let storedUserId = localStorage.getItem("pfi_user_id");
    if (!storedUserId) {
      storedUserId = crypto.randomUUID();
      localStorage.setItem("pfi_user_id", storedUserId);
    }
    setUserId(storedUserId);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const stopPraying = async () => {
    setIsActive(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    try {
      await supabase
        .from("prayers")
        .update({ is_active: false })
        .eq("session_id", sessionId);
    } catch (err) {
      console.error("Failed to stop praying:", err);
    }
  };

  const handleButtonClick = async () => {
    if (!isActive) {
      // Fire GA4 event safely — never blocks UI
      try {
        sendGAEvent('event', 'pray_button_clicked', { method: 'click' });
      } catch (_) {}
      // Fire Meta Pixel custom event safely
      try {
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('trackCustom', 'PrayButtonClicked');
        }
      } catch (_) {}
      // Start praying -> Open Modal
      setIsModalOpen(true);
    } else {
      // Stop praying -> Update Supabase
      await stopPraying();
    }
  };

  const handleCountrySelect = async (country: string) => {
    setSelectedCountry(country);
    setIsModalOpen(false);
    setIsActive(true);
    
    try {
      await supabase
        .from("prayers")
        .insert([{
          session_id: sessionId,
          user_id: userId,        // persistent anonymous ID for unique tracking
          country: country,
          is_active: true,
        }]);
        
      // Set 5-minute timeout (300,000 ms) to automatically toggle off
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        stopPraying();
      }, 300000);
      
    } catch (err) {
      console.error("Failed to start praying:", err);
      setIsActive(false);
    }
  };

  const renderLabel = () => {
    if (isActive) return <span className="text-lg md:text-2xl tracking-wider">Praying...</span>;
    
    if (label.includes("&")) {
      const parts = label.split("&");
      return (
        <div className="flex flex-col items-center justify-center leading-none">
          <span className="text-2xl md:text-4xl font-black uppercase tracking-wider">{parts[0].trim()}</span>
          <span className="text-xl md:text-3xl font-serif italic opacity-80 my-0.5 md:my-1">&amp;</span>
          <span className="text-2xl md:text-4xl font-black uppercase tracking-wider">{parts[1].trim()}</span>
        </div>
      );
    }
    return <span className="text-lg md:text-2xl font-bold">{label}</span>;
  };

  return (
    <div className="flex flex-col items-center justify-center pt-1 pb-0 md:py-8">
      <div className="relative flex items-center justify-center w-full min-h-[160px] md:min-h-[280px]">
        {/* Outer Ripple / Pulse Effect */}
        {isActive && (
          <motion.div
            className="absolute rounded-full bg-primary-gold opacity-20 pointer-events-none w-36 h-36 md:w-56 md:h-56"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )}
        
        {/* Second Ripple / Pulse Effect */}
        {isActive && (
          <motion.div
            className="absolute rounded-full bg-primary-deepBlue opacity-10 pointer-events-none w-36 h-36 md:w-56 md:h-56"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.6,
            }}
          />
        )}

        {/* The Main Button */}
        <motion.button
          onClick={handleButtonClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            relative z-10 flex items-center justify-center w-36 h-36 md:w-56 md:h-56 rounded-full 
            shadow-[0_0_40px_rgba(212,175,55,0.4)] transition-colors duration-500
            ${isActive 
              ? 'bg-primary-deepBlue text-primary-white border-4 border-primary-gold' 
              : 'bg-primary-gold text-primary-deepBlue'
            }
          `}
        >
          {renderLabel()}
        </motion.button>
      </div>
      <p className="mt-0 md:mt-4 text-3xl md:text-4xl font-black text-primary-deepBlue text-center max-w-[400px] leading-[1.1] tracking-tight">
        {isActive ? "You are joined with believers worldwide. (Auto-close in 5m)" : "Tap to light up your country on the map."}
      </p>
      
      {!isActive && (
        <p className="mt-1 md:mt-2 text-[10px] md:text-[11px] leading-tight text-text-dark opacity-50 text-center max-w-[280px]">
          This is a live tracker, not an audio/video room.
        </p>
      )}

      {/* Share Section */}
      <AnimatePresence>
        {isActive && selectedCountry && (
          <motion.div 
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="mt-4 flex flex-row items-center justify-center space-x-3 overflow-hidden bg-gray-50/80 px-4 py-2 rounded-full border border-gray-100 shadow-sm"
          >
            <h4 className="text-gray-500 font-semibold text-xs whitespace-nowrap">Invite someone to pray</h4>
            <div className="flex items-center space-x-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent("I just joined the global prayer for Israel from " + selectedCountry + "! \uD83D\uDE4F\uD83D\uDD4E\uD83C\uDF0D Join us live: https://prayforisrael.live")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full transition-colors shadow"
                aria-label="Share on WhatsApp"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.031 0C5.385 0 0 5.387 0 12.035c0 2.124.553 4.195 1.604 6.01L.068 23.553l5.655-1.483c1.745.952 3.716 1.455 5.753 1.455h.004c6.645 0 12.029-5.386 12.029-12.034C23.509 5.388 18.127 0 12.031 0zm0 21.526c-1.802 0-3.567-.485-5.116-1.403l-.367-.217-3.805.998.995-3.71-.238-.378a9.99 9.99 0 01-1.536-5.414c0-5.513 4.485-9.998 10.005-9.998 2.673 0 5.184 1.042 7.073 2.932 1.888 1.89 2.928 4.402 2.928 7.075 0 5.511-4.484 9.998-9.995 9.998zm5.485-7.498c-.3-.15-1.78-.88-2.056-.98-.276-.101-.477-.15-.677.15-.2.3-.777.98-.952 1.18-.175.2-.35.226-.65.076-1.537-.773-2.616-1.396-3.626-2.585-.26-.307.03-.292.32-.58.05-.05.1-.115.15-.175.05-.06.065-.1.1-.166.035-.065.018-.126-.007-.176-.025-.05-.676-1.63-.925-2.231-.244-.588-.49-.508-.675-.517-.176-.008-.377-.008-.577-.008s-.525.075-.801.375c-.276.3-.926.906-.926 2.208 0 1.303.951 2.563 1.086 2.763.136.201 1.879 2.981 4.618 4.218 1.554.703 2.146.762 2.842.64.487-.086 1.487-.607 1.696-1.194.21-.588.21-1.092.147-1.195-.063-.102-.263-.152-.564-.303z"/>
                </svg>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://prayforisrael.live")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-full transition-colors shadow"
                aria-label="Share on Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CountryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSelect={handleCountrySelect} 
      />
    </div>
  );
}
