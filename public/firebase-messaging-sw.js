importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
  apiKey: new URL(location).searchParams.get("apiKey") || "mock-api-key",
  authDomain: new URL(location).searchParams.get("authDomain") || "mock-auth-domain",
  projectId: new URL(location).searchParams.get("projectId") || "mock-project-id",
  storageBucket: new URL(location).searchParams.get("storageBucket") || "mock-storage-bucket",
  messagingSenderId: new URL(location).searchParams.get("messagingSenderId") || "mock-messaging-sender-id",
  appId: new URL(location).searchParams.get("appId") || "mock-app-id",
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
    // Customize notification here
    const notificationTitle = payload.notification?.title || 'asiTrack Reminder';
    const notificationOptions = {
      body: payload.notification?.body,
      icon: '/logo.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.log('[firebase-messaging-sw.js] Running in mock/fallback mode.');
}
