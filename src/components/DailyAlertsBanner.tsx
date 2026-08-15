"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendGAEvent } from '@next/third-parties/google';

declare global {
  interface Window {
    OneSignal: any;
  }
}

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

export default function DailyAlertsBanner() {
  // ── OneSignal state (UNTOUCHED) ──
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showIOSTip, setShowIOSTip] = useState(false);
  const [iosDevice, setIosDevice] = useState(false);

  // ── PWA install state (ISOLATED) ──
  const deferredPromptRef = useRef<any>(null);
  const [pwaInstallable, setPwaInstallable] = useState(false);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [showPWAIOSTip, setShowPWAIOSTip] = useState(false);

  // ── OneSignal useEffect (UNTOUCHED — identical to previous production version) ──
  useEffect(() => {
    setIosDevice(detectIOS());

    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    try {
      window.OneSignal = window.OneSignal || [];

      window.OneSignal.push(() => {
        try {
          if (
            window.OneSignal.User &&
            window.OneSignal.User.PushSubscription &&
            typeof window.OneSignal.User.PushSubscription.addEventListener === 'function'
          ) {
            window.OneSignal.User.PushSubscription.addEventListener('change', (event: any) => {
              try {
                const isOptedIn = !!(event && event.current && event.current.optedIn);
                setIsSubscribed(isOptedIn);
                if (isOptedIn) {
                  try { sendGAEvent('event', 'push_optin_success'); } catch (_) {}
                }
              } catch (_) {}
            });
          }

          if (typeof window.OneSignal.on === 'function') {
            window.OneSignal.on('subscriptionChange', (subscribed: boolean) => {
              setIsSubscribed(subscribed);
              if (subscribed) {
                try { sendGAEvent('event', 'push_optin_success'); } catch (_) {}
              }
            });
          }

          if (typeof window.OneSignal.isPushNotificationsEnabled === 'function') {
            window.OneSignal.isPushNotificationsEnabled()
              .then((isOptedIn: boolean) => {
                setIsSubscribed(isOptedIn);
                setIsLoading(false);
                clearTimeout(fallbackTimer);
              })
              .catch(() => {
                setIsLoading(false);
                clearTimeout(fallbackTimer);
              });
          } else {
            setIsLoading(false);
            clearTimeout(fallbackTimer);
          }
        } catch (_) {
          setIsLoading(false);
          clearTimeout(fallbackTimer);
        }
      });
    } catch (_) {}

    return () => clearTimeout(fallbackTimer);
  }, []);

  // ── PWA install useEffect (ISOLATED — no OneSignal references) ──
  useEffect(() => {
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

    // Check if already running as installed PWA
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      setPwaInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  // ── OneSignal click handler (UNTOUCHED) ──
  const handleClick = () => {
    if (isSubscribed) return;

    try {
      sendGAEvent('event', 'push_optin_click');
    } catch (_) {}

    if (iosDevice) {
      setShowIOSTip((prev) => !prev);
      return;
    }

    if (!window.OneSignal) return;

    if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
      return;
    }

    window.OneSignal.push(() => {
      window.OneSignal.registerForPushNotifications()
        ?.catch?.((err: any) => {
          console.error('OneSignal subscription error:', err);
        });
    });
  };

  // ── PWA install click handler (ISOLATED) ──
  const handleInstallClick = () => {
    try {
      sendGAEvent('event', 'pwa_install_click');
    } catch (_) {}

    // iOS: show inline tip
    if (iosDevice) {
      setShowPWAIOSTip((prev) => !prev);
      return;
    }

    // Use deferred prompt if available
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
    <section className="w-full max-w-6xl mx-auto px-4 md:px-0 mt-8 md:mt-12 mb-2">
      <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-stretch w-full">

        {/* ── Right Card: PWA Install (ISOLATED — no OneSignal references) ── */}
        <div className="flex-1 bg-primary-deepBlue rounded-2xl p-6 md:p-8 shadow-xl border border-white/10 flex flex-col justify-between overflow-hidden">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            {/* Download Icon */}
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 flex items-center justify-center ring-1 ring-white/15 mb-4">
              <svg
                className="w-6 h-6 md:w-7 md:h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
            {/* Copy */}
            <h4 className="text-lg md:text-xl font-bold text-white tracking-tight leading-tight mb-2">
              Take It With You
            </h4>
            <p className="text-[13px] md:text-sm text-white/60 leading-relaxed tracking-[0.01em] mb-6">
              Install the prayer app on your device for instant access — no app store needed.
            </p>
          </div>

          {/* CTA */}
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

          {/* iOS inline tip for PWA */}
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
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
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

        {/* ── Divider: Desktop ── */}
        <div className="hidden md:flex flex-col justify-center items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-background-light p-3 rounded-full font-bold text-gray-400 border-2 border-gray-100 text-sm shadow-sm">
            OR
          </div>
        </div>

        {/* ── Divider: Mobile ── */}
        <div className="md:hidden flex justify-center items-center my-[-16px] z-10 relative">
          <div className="bg-background-light px-4 py-2 rounded-full font-bold text-gray-400 border-2 border-gray-100 text-sm shadow-sm">
            OR
          </div>
        </div>

        {/* ── Left Card: Push Notifications (layout wrapper only, logic untouched) ── */}
        <div className="flex-1 bg-primary-deepBlue rounded-2xl p-6 md:p-8 shadow-xl border-t-4 border-primary-gold flex flex-col justify-between overflow-hidden">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            {/* Bell Icon */}
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary-gold/15 flex items-center justify-center ring-1 ring-primary-gold/20 mb-4">
              <svg
                className="w-6 h-6 md:w-7 md:h-7 text-primary-gold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            {/* Copy */}
            <h4 className="text-lg md:text-xl font-bold text-white tracking-tight leading-tight mb-2">
              Stand With Israel Daily
            </h4>
            <p className="text-[13px] md:text-sm text-white/60 leading-relaxed tracking-[0.01em] mb-6">
              Receive a daily reminder to join believers worldwide in prayer for Israel.
            </p>
          </div>

          {/* CTA */}
          {isLoading ? (
            <div className="h-[46px] w-full rounded-xl bg-white/10 animate-pulse" />
          ) : isSubscribed ? (
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
                Alerts Enabled
              </span>
            </div>
          ) : (
            <button
              id="push-optin-btn"
              onClick={handleClick}
              style={{ backgroundColor: '#D4AF37', color: '#0B2B5A' }}
              className="block w-full text-center font-bold py-3 px-4 rounded-xl hover:bg-yellow-400 active:scale-[0.97] transition-all duration-200 shadow-lg tracking-wide cursor-pointer text-sm md:text-[15px]"
            >
              Enable Daily Alerts
            </button>
          )}

          {/* iOS inline tip for push */}
          <AnimatePresence>
            {showIOSTip && (
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
                    To receive daily alerts on an iPhone, please tap the{' '}
                    <span className="inline-flex items-center align-middle mx-0.5">
                      <svg
                        className="w-[14px] h-[14px] text-primary-gold"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                    </span>{' '}
                    Share icon and select{' '}
                    <strong className="text-white font-semibold">Add to Home Screen</strong>.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
