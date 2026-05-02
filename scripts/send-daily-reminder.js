// This script can be run as a cron job (e.g., via GitHub Actions or Vercel Crons)
// It sends a daily notification to all subscribed users.

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;
const APP_URL = process.env.APP_URL || 'https://prayforisrael.live';

async function sendDailyReminder() {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
    console.error("Missing OneSignal environment variables.");
    return;
  }

  const notificationBody = {
    app_id: ONESIGNAL_APP_ID,
    included_segments: ["Subscribed Users"],
    contents: {
      en: "Take a moment to pray for Israel today \uD83D\uDE4F",
      he: "קחו רגע להתפלל למען ישראל היום \uD83D\uDE4F",
    },
    headings: {
      en: "Daily Prayer Reminder",
      he: "תזכורת תפילה יומית",
    },
    url: APP_URL, // This ensures that clicking the notification opens the app
    chrome_web_icon: `${APP_URL}/onesignal-icon.png`,
    firefox_icon: `${APP_URL}/onesignal-icon.png`,
  };

  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify(notificationBody),
    });

    const data = await response.json();
    console.log("OneSignal Response:", data);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

sendDailyReminder();
