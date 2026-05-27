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
    const message = {
      notification: {
        title,
        body,
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
