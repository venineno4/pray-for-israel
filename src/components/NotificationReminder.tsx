"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { sendGAEvent } from "@next/third-parties/google";

declare global {
  interface Window {
    OneSignal: any;
  }
}

export default function NotificationReminder() {
  const t = useTranslations('Index');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if OneSignal is initialized and get subscription status
    const checkSubscription = async () => {
      window.OneSignal = window.OneSignal || [];
      
      const setupListeners = () => {
        // Listener for confirmed subscription success
        window.OneSignal.on('subscriptionChange', (subscribed: boolean) => {
          setIsSubscribed(subscribed);
          if (subscribed) {
            // FIRE GA4 EVENT ONLY ON ACTUAL SUCCESSFUL SUBSCRIPTION
            try {
              sendGAEvent('event', 'opt_in_reminder', { method: 'web_push' });
              console.log("GA4: opt_in_reminder event fired (method: web_push)");
            } catch (err) {
              console.error("GA4 tracking error:", err);
            }
          }
        });
      };

      if (window.OneSignal.initialized) {
        setupListeners();
        const isOptedIn = await window.OneSignal.isPushNotificationsEnabled();
        setIsSubscribed(isOptedIn);
        setIsLoading(false);
      } else {
        window.OneSignal.push(() => {
          setupListeners();
          window.OneSignal.isPushNotificationsEnabled().then((isOptedIn: boolean) => {
            setIsSubscribed(isOptedIn);
            setIsLoading(false);
          });
        });
      }
    };

    checkSubscription();
  }, []);

  const handleToggle = async () => {
    if (!window.OneSignal) return;

    if (!isSubscribed) {
      // Trigger native permission prompt
      window.OneSignal.push(() => {
        window.OneSignal.registerForPushNotifications()
          .then(() => {
            setIsSubscribed(true);
          })
          .catch((err: any) => {
            console.error("OneSignal subscription error:", err);
          });
      });
    } else {
      // OneSignal doesn't provide a simple "unsubscribe" toggle for users easily via SDK 
      // without showing their custom UI, but we can setSubscription(false)
      window.OneSignal.push(() => {
        window.OneSignal.setSubscription(false);
        setIsSubscribed(false);
      });
    }
  };

  if (isLoading) return <div className="h-6" />; // Prevent layout shift

  return (
    <div className="flex flex-col space-y-1 mt-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center space-x-2 cursor-pointer select-none group"
        onClick={handleToggle}
      >
        <div className={`
          w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200
          ${isSubscribed ? 'bg-primary-gold border-primary-gold' : 'border-gray-300 group-hover:border-primary-gold'}
        `}>
          {isSubscribed && (
            <svg className="w-3.5 h-3.5 text-primary-deepBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="text-xs md:text-sm font-medium text-text-dark opacity-70 group-hover:opacity-100 transition-opacity">
          {t('remindMeDaily')}
        </span>
      </motion.div>
      <p className="text-[10px] md:text-[11px] italic text-text-dark opacity-40 leading-tight max-w-[280px]">
        {t('motto')}
      </p>
    </div>
  );
}
