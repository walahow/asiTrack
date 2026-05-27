import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/**
 * Helper to request notification permission and get FCM token.
 */
export async function requestPushPermission(): Promise<string | null> {
  // If we don't have valid env config for Firebase, return a mock token
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    console.log("[MOCK] Requesting notification permission locally...");
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return "mock-fcm-token-" + Date.now();
    }
    return null;
  }

  try {
    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      if (currentToken) {
        return currentToken;
      } else {
        console.warn('No registration token available. Request permission to generate one.');
      }
    }
    return null;
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    return null;
  }
}
