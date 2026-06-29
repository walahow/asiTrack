import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

/**
 * Sends a push notification via Firebase Admin SDK.
 * Fallbacks to console.log if Firebase environment variables are missing.
 */
export async function sendPushNotification(token: string, title: string, body: string, data?: Record<string, string>) {
  // Check if we are in mock mode (missing credentials)
  if (!(process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) || !process.env.FIREBASE_PRIVATE_KEY) {
    console.log(`[MOCK PUSH] To: ${token} | Title: "${title}" | Body: "${body}"`);
    return { success: true, mocked: true };
  }

  try {
    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL 
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : (process.env.NEXTAUTH_URL || 'http://localhost:3000');
    const iconUrl = `${baseUrl.replace(/\/$/, '')}/logo.png`;

    const message = {
      notification: {
        title,
        body,
      },
      webpush: {
        headers: {
          Urgency: 'high'
        },
        notification: {
          icon: iconUrl,
          badge: iconUrl,
          tag: 'hypnomom-reminder',
          renotify: true,
        }
      },
      data,
      token,
    };

    const response = await admin.messaging().send(message);
    return { success: true, response };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error };
  }
}

/**
 * Sends a push notification to multiple devices via Firebase Admin SDK.
 * Fallbacks to console.log if Firebase environment variables are missing.
 */
export async function sendMulticastPushNotification(tokens: string[], title: string, body: string, data?: Record<string, string>) {
  if (!tokens || tokens.length === 0) return { success: true, mocked: true, message: "No tokens provided" };

  // Check if we are in mock mode (missing credentials)
  if (!(process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) || !process.env.FIREBASE_PRIVATE_KEY) {
    console.log(`[MOCK MULTICAST PUSH] To ${tokens.length} devices | Title: "${title}" | Body: "${body}"`);
    return { success: true, mocked: true, count: tokens.length };
  }

  try {
    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL 
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : (process.env.NEXTAUTH_URL || 'http://localhost:3000');
    const iconUrl = `${baseUrl.replace(/\/$/, '')}/logo.png`;

    const message = {
      notification: {
        title,
        body,
      },
      webpush: {
        headers: {
          Urgency: 'high'
        },
        notification: {
          icon: iconUrl,
          badge: iconUrl,
          tag: 'hypnomom-reminder',
          renotify: true,
        }
      },
      data,
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    return { success: true, response };
  } catch (error) {
    console.error('Error sending multicast push notification:', error);
    return { success: false, error };
  }
}
