"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendGAEvent } from '@next/third-parties/google';

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

export default function DailyAlertsBanner() {
  const deferredPromptRef = useRef<any>(null);
  const [pwaInstallable, setPwaInstallable] = useState(false);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [showPWAIOSTip, setShowPWAIOSTip] = useState(false);
  const [iosDevice, setIosDevice] = useState(false);

  useEffect(() => {
    setIosDevice(detectIOS());

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setPwaInstallable(true);
    };

    const onAppInstalled = () => {
      setPwaInstalled(true);
      setPwaInstallable(false);
      deferredPromptRef.current = null;
      try { sendGAEvent('event', 'pwa_install_success'); } catch (_) {}
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);

    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      setPwaInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    try {
      sendGAEvent('event', 'pwa_install_click');
    } catch (_) {}

    if (iosDevice) {
      setShowPWAIOSTip((prev) => !prev);
      return;
    }

    if (deferredPromptRef.current) {
      deferredPromptRef.current.prompt();
      deferredPromptRef.current.userChoice
        .then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            setPwaInstalled(true);
          }
          deferredPromptRef.current = null;
        })
        .catch(() => {
          deferredPromptRef.current = null;
        });
    }
  };

  return (
    <section className="w-full max-w-2xl mx-auto px-4 md:px-0 mt-4 mb-2">
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
          <div className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl bg-white/10 border border-white/15">
            <svg
              className="w-5 h-5 text-primary-gold"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-semibold text-white tracking-wide">
              App Installed
            </span>
          </div>
        ) : (
          <button
            id="pwa-install-btn"
            onClick={handleInstallClick}
            className="block w-full text-center bg-white text-primary-deepBlue font-bold py-3 px-4 rounded-xl hover:bg-gray-100 active:scale-[0.97] transition-all duration-200 shadow-lg tracking-wide cursor-pointer text-sm md:text-[15px]"
          >
            Install App
          </button>
        )}

        <AnimatePresence>
          {showPWAIOSTip && (
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
                  To install on iOS, tap the{' '}
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
                  Share icon at the bottom of your browser and select{' '}
                  <strong className="text-white font-semibold">Add to Home Screen</strong>.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
