"use client";

import { useState, useEffect } from 'react';
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
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showIOSTip, setShowIOSTip] = useState(false);
  const [iosDevice, setIosDevice] = useState(false);

  useEffect(() => {
    setIosDevice(detectIOS());

    // Fallback: if OneSignal never initializes (e.g. preview domain),
    // stop loading after 3 seconds so the button is always visible.
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    const checkSubscription = async () => {
      window.OneSignal = window.OneSignal || [];

      const setupListener = () => {
        window.OneSignal.on('subscriptionChange', (subscribed: boolean) => {
          setIsSubscribed(subscribed);
          if (subscribed) {
            try {
              sendGAEvent('event', 'push_optin_success');
            } catch (_) {}
          }
        });
      };

      if (window.OneSignal.initialized) {
        setupListener();
        const isOptedIn = await window.OneSignal.isPushNotificationsEnabled();
        setIsSubscribed(isOptedIn);
        setIsLoading(false);
        clearTimeout(fallbackTimer);
      } else {
        window.OneSignal.push(() => {
          setupListener();
          window.OneSignal.isPushNotificationsEnabled().then((isOptedIn: boolean) => {
            setIsSubscribed(isOptedIn);
            setIsLoading(false);
            clearTimeout(fallbackTimer);
          });
        });
      }
    };

    checkSubscription();

    return () => clearTimeout(fallbackTimer);
  }, []);

  const handleClick = () => {
    alert('Step 1: Button clicked');

    if (isSubscribed) return;

    // GA4 tracking — isolated so it can NEVER block execution
    try {
      sendGAEvent('event', 'push_optin_click');
    } catch (gaErr) {
      console.warn('GA4 sendGAEvent failed (non-blocking):', gaErr);
    }

    // On iOS, show the Add-to-Home-Screen tip instead
    if (iosDevice) {
      setShowIOSTip((prev) => !prev);
      return;
    }

    alert('Step 2: Reached OneSignal trigger');

    // Check OneSignal object
    if (!window.OneSignal) {
      alert('Debug: OneSignal object is missing.');
      return;
    }

    // Check browser notification permission
    if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
      alert('Debug: Notifications are explicitly blocked by the browser.');
      return;
    }

    // Trigger OneSignal prompt
    try {
      window.OneSignal.push(() => {
        try {
          window.OneSignal.registerForPushNotifications()
            .then(() => {
              alert('Step 3: registerForPushNotifications resolved OK');
            })
            .catch((err: any) => {
              alert('OneSignal Trigger Error: ' + (err?.message || String(err)));
              console.error('OneSignal registerForPushNotifications error:', err);
            });
        } catch (innerErr: any) {
          alert('OneSignal Inner Error: ' + (innerErr?.message || String(innerErr)));
          console.error('OneSignal inner error:', innerErr);
        }
      });
    } catch (outerErr: any) {
      alert('OneSignal Outer Error: ' + (outerErr?.message || String(outerErr)));
      console.error('OneSignal outer error:', outerErr);
    }
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-4 md:px-0 mt-8 md:mt-12 mb-2">
      <div className="bg-primary-deepBlue rounded-2xl p-6 md:py-8 md:px-10 shadow-xl border-t-4 border-primary-gold overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-5 md:gap-10">

          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-14 h-14 md:w-[68px] md:h-[68px] rounded-full bg-primary-gold/15 flex items-center justify-center ring-1 ring-primary-gold/20">
              <svg
                className="w-7 h-7 md:w-8 md:h-8 text-primary-gold"
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
          </div>

          {/* Copy */}
          <div className="flex-1 text-center md:text-left min-w-0">
            <h3 className="text-xl md:text-[22px] font-bold text-white tracking-tight leading-tight">
              Stand With Israel Daily
            </h3>
            <p className="text-[13px] md:text-[15px] text-white/65 mt-1.5 leading-relaxed tracking-[0.01em] max-w-lg mx-auto md:mx-0">
              Receive a daily reminder to join believers worldwide in prayer for Israel.
            </p>
          </div>

          {/* CTA */}
          <div className="flex-shrink-0 w-full md:w-auto flex justify-center">
            {isLoading ? (
              <div className="h-[46px] w-52 rounded-xl bg-white/10 animate-pulse" />
            ) : isSubscribed ? (
              <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white/10 border border-white/15">
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
                className="w-full md:w-auto px-8 py-3 font-bold text-sm md:text-[15px] rounded-xl hover:bg-yellow-400 active:scale-[0.97] transition-all duration-200 shadow-lg tracking-wide cursor-pointer"
              >
                Enable Daily Alerts
              </button>
            )}
          </div>
        </div>

        {/* iOS inline tip */}
        <AnimatePresence>
          {showIOSTip && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="bg-white/[0.07] rounded-xl px-5 py-4 border border-white/10">
                <p className="text-[13px] md:text-sm text-white/75 leading-relaxed text-center md:text-left tracking-[0.01em]">
                  <span className="font-semibold text-primary-gold">Note:</span>{' '}
                  To receive daily alerts on an iPhone, please tap the{' '}
                  <span className="inline-flex items-center align-middle mx-0.5">
                    <svg
                      className="w-[15px] h-[15px] text-primary-gold"
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
                  Share icon at the bottom of your screen and select{' '}
                  <strong className="text-white font-semibold">Add to Home Screen</strong> first.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
