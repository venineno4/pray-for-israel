"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendGAEvent } from '@next/third-parties/google';

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

function detectInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  return (ua.indexOf('FBAV') > -1) || (ua.indexOf('FBAN') > -1) || (ua.indexOf('Instagram') > -1);
}

export default function DailyAlertsBanner() {
  const deferredPromptRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [pwaInstallable, setPwaInstallable] = useState(false);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  
  const [iosDevice, setIosDevice] = useState(false);
  const [inAppBrowser, setInAppBrowser] = useState(false);
  
  const [showPWAIOSTip, setShowPWAIOSTip] = useState(false);
  const [showInAppTip, setShowInAppTip] = useState(false);
  const [showManualTip, setShowManualTip] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    // 1. Detection & Security Parameters
    let is_ios = detectIOS();
    let is_inapp = detectInAppBrowser();

    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('force_env')) {
        const env = urlParams.get('force_env');
        if (env === 'ios') {
          is_ios = true;
          is_inapp = false;
        } else if (env === 'inapp') {
          is_inapp = true;
          is_ios = false;
        }
      }
    }

    setIosDevice(is_ios);
    setInAppBrowser(is_inapp);

    // Track in-app browser detection
    if (is_inapp && typeof navigator !== 'undefined') {
      const ua = navigator.userAgent || navigator.vendor;
      if (ua.indexOf('Instagram') > -1) {
        try { sendGAEvent('event', 'instagram_in_app_browser'); } catch (_) {}
      } else {
        try { sendGAEvent('event', 'facebook_in_app_browser'); } catch (_) {}
      }
    }

    // STATE 0 Check
    const isStandalone = typeof window !== 'undefined' && 
      (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true);
    
    if (isStandalone) {
      setPwaInstalled(true);
      try { sendGAEvent('event', 'pwa_standalone_launch'); } catch (_) {}
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setPwaInstallable(true);
    };

    const onAppInstalled = () => {
      setPwaInstalled(true);
      setPwaInstallable(false);
      deferredPromptRef.current = null;
      try { sendGAEvent('event', 'appinstalled'); } catch (_) {}
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  // Intersection Observer for visibility tracking
  useEffect(() => {
    if (!containerRef.current || hasViewed || pwaInstalled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          try { sendGAEvent('event', 'install_button_view'); } catch (_) {}
          setHasViewed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [hasViewed, pwaInstalled]);

  const handleInstallClick = () => {
    if (inAppBrowser) { // STATE 2
      try { sendGAEvent('event', 'install_button_click_inapp'); } catch (_) {}
      setShowInAppTip((prev) => {
        if (!prev) {
          try { sendGAEvent('event', 'external_browser_instruction_shown'); } catch (_) {}
        }
        return !prev;
      });
      return;
    }

    if (iosDevice) { // STATE 3
      try { sendGAEvent('event', 'install_button_click_ios'); } catch (_) {}
      setShowPWAIOSTip((prev) => {
        if (!prev) {
          try { sendGAEvent('event', 'ios_install_instructions_shown'); } catch (_) {}
        }
        return !prev;
      });
      return;
    }

    // STATE 1A - Native prompt available
    if (pwaInstallable && deferredPromptRef.current) {
      try { sendGAEvent('event', 'install_button_click_native'); } catch (_) {}
      try { sendGAEvent('event', 'install_prompt_shown'); } catch (_) {}
      
      deferredPromptRef.current.prompt();
      deferredPromptRef.current.userChoice
        .then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            try { sendGAEvent('event', 'install_prompt_accepted'); } catch (_) {}
            setPwaInstalled(true);
          } else {
            try { sendGAEvent('event', 'install_prompt_dismissed'); } catch (_) {}
          }
          deferredPromptRef.current = null;
        })
        .catch(() => {
          deferredPromptRef.current = null;
        });
    } else {
      // STATE 1B - Manual browser fallback
      try { sendGAEvent('event', 'install_button_click_manual'); } catch (_) {}
      setShowManualTip((prev) => !prev);
    }
  };

  // Removed early return for STATE 0

  // Determine Button Text
  let buttonText = "Install App";
  if (inAppBrowser) {
    buttonText = "Open in Browser to Install"; // STATE 2
  } else if (iosDevice) {
    buttonText = "Add to Home Screen"; // STATE 3
  } else if (!pwaInstallable || !deferredPromptRef.current) {
    buttonText = "How to Install"; // STATE 1B
  } // else STATE 1A -> "Install App"

  return (
    <section className="w-full max-w-2xl mx-auto px-4 md:px-0 mt-4 mb-2" ref={containerRef}>
      <div className="w-full bg-primary-deepBlue rounded-2xl p-6 md:p-8 shadow-xl border border-white/10 flex flex-col justify-between overflow-hidden">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 flex items-center justify-center ring-1 ring-white/15 mb-4">
            <svg
              className="w-6 h-6 md:w-7 md:h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <h4 className="text-lg md:text-xl font-bold text-white tracking-tight leading-tight mb-2">
            Take It With You
          </h4>
          <p className="text-[13px] md:text-sm text-white/60 leading-relaxed tracking-[0.01em] mb-6">
            Install the prayer app on your device for instant access — no app store needed.
          </p>
        </div>

        {pwaInstalled ? (
          <div className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-white/20 border border-white/30 cursor-default opacity-80">
            <span className="text-sm md:text-[15px] font-bold text-white tracking-wide">
              ✓ App Installed
            </span>
          </div>
        ) : (
          <button
            id="pwa-install-btn"
            onClick={handleInstallClick}
            className="block w-full text-center bg-white text-primary-deepBlue font-bold py-3 px-4 rounded-xl hover:bg-gray-100 active:scale-[0.97] transition-all duration-200 shadow-lg tracking-wide cursor-pointer text-sm md:text-[15px]"
          >
            {buttonText}
          </button>
        )}

        <AnimatePresence>
          {showPWAIOSTip && iosDevice && !inAppBrowser && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="bg-white/[0.07] rounded-xl px-4 py-3 border border-white/10">
                <p className="text-[12px] md:text-[13px] text-white/75 leading-relaxed text-center tracking-[0.01em]">
                  <span className="font-semibold text-primary-gold">Note:</span>{' '}
                  1. Tap the{' '}
                  <span className="inline-flex items-center align-middle mx-0.5">
                    <svg
                      className="w-[14px] h-[14px] text-primary-gold"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </span>{' '}
                  Share icon. 2. Select{' '}
                  <strong className="text-white font-semibold">Add to Home Screen</strong>.
                </p>
              </div>
            </motion.div>
          )}

          {showInAppTip && inAppBrowser && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="bg-white/[0.07] rounded-xl px-4 py-3 border border-white/10">
                <p className="text-[12px] md:text-[13px] text-white/75 leading-relaxed text-center tracking-[0.01em]">
                  To install the app, first open this page in your phone's browser. Tap the <strong className="text-white font-semibold">⋯</strong> menu and choose <strong className="text-white font-semibold">"Open in browser"</strong>, <strong className="text-white font-semibold">"Open in Safari"</strong>, or <strong className="text-white font-semibold">"Open in Chrome"</strong>.
                </p>
              </div>
            </motion.div>
          )}

          {showManualTip && (!pwaInstallable || !deferredPromptRef.current) && !inAppBrowser && !iosDevice && (
             <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="bg-white/[0.07] rounded-xl px-4 py-3 border border-white/10">
                <p className="text-[12px] md:text-[13px] text-white/75 leading-relaxed text-center tracking-[0.01em]">
                  To install, open your browser's menu (usually 3 dots at the top right) and select <strong className="text-white font-semibold">"Install app"</strong> or <strong className="text-white font-semibold">"Add to Home screen"</strong>.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
