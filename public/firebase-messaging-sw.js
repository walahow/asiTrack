importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
  apiKey: "AIzaSyDUWflZ5pydPRbkYwdMw0us0p8AXOStjTk",
  authDomain: "asitrack.firebaseapp.com",
  projectId: "asitrack",
  storageBucket: "asitrack.firebasestorage.app",
  messagingSenderId: "527050773070",
  appId: "1:527050773070:web:50971ae974d0b5e0cfa91f"
};

firebase.initializeApp(firebaseConfig);

try {
  // Retrieve an instance of Firebase Messaging so that it can handle background
  // messages.
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log(
      '[firebase-messaging-sw.js] Received background message ',
      payload
    );
    
    // If payload contains a native 'notification' object, Firebase SDK will show it automatically.
    // We only call showNotification manually if it's a data-only payload to avoid duplicate banners.
    if (!payload.notification) {
      const notificationTitle = payload.data?.title || 'asiTrack Reminder';
      const notificationOptions = {
        body: payload.data?.body,
        icon: '/logo.png'
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    }
  });
} catch (error) {
  console.log('[firebase-messaging-sw.js] Running in mock/fallback mode.');
}
