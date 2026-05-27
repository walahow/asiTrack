import mongoose from 'mongoose';
import * as admin from 'firebase-admin';

async function testPush() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);

  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ notif_enabled: true, fcm_token: { $ne: null } });

  if (!user) {
    console.error("No user found.");
    process.exit(1);
  }

  console.log("Found token:", user.fcm_token);

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey && privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  try {
    const message = {
      notification: {
        title: "Test Debug Push",
        body: "Testing what error we get",
      },
      token: user.fcm_token,
    };

    console.log("Sending push...");
    const response = await admin.messaging().send(message);
    console.log("Success! Response:", response);
  } catch (error) {
    console.error("Error from Firebase Admin:", error);
  }

  process.exit(0);
}

testPush().catch(console.error);
