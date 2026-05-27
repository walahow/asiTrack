import mongoose from 'mongoose';

async function forceEligibility() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");

  // Get models
  const db = mongoose.connection.db;
  const usersCollection = db.collection('users');
  const responsesCollection = db.collection('responses');
  const questionsCollection = db.collection('questions');

  // Find a user who has notif_enabled: true and an fcm_tokens array
  const user = await usersCollection.findOne({ notif_enabled: true, fcm_tokens: { $exists: true, $not: { $size: 0 } } });
  
  if (!user) {
    console.log("No user found with notifications enabled and an FCM token. Did you toggle it on the frontend?");
    process.exit(0);
  }

  console.log(`Found user: ${user.username}`);

  // 1. Set tgl_melahirkan to exactly 2 days ago (so hari_ke is 2)
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  await usersCollection.updateOne(
    { _id: user._id },
    { $set: { tgl_melahirkan: twoDaysAgo } }
  );
  console.log("Updated tgl_melahirkan to 2 days ago.");

  // 2. Delete any existing responses they made today for the primary question so they are 'pending' again
  const primaryQuestion = await questionsCollection.findOne({ is_primary: true });
  if (primaryQuestion) {
    const deleted = await responsesCollection.deleteMany({
      user_id: user._id,
      question_id: primaryQuestion._id,
      hari_ke: 2 // Assuming today is now hari_ke 2 for them
    });
    console.log(`Deleted ${deleted.deletedCount} existing responses for today.`);
  }

  console.log("Done! You are now eligible to receive the notification.");
  console.log("Go hit http://localhost:3000/api/cron/send-notification?slot=morning");
  
  process.exit(0);
}

forceEligibility().catch(console.error);
