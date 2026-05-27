import mongoose from 'mongoose';
import { toZonedTime } from 'date-fns-tz';
import { differenceInDays, startOfDay } from 'date-fns';

const TIMEZONE = 'Asia/Jakarta';

async function debugCron() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found.");
    process.exit(1);
  }
  await mongoose.connect(uri);

  const db = mongoose.connection.db;
  const usersCollection = db.collection('users');
  const questionsCollection = db.collection('questions');
  const responsesCollection = db.collection('responses');
  const templatesCollection = db.collection('notificationtemplates');

  const template = await templatesCollection.findOne({ tipe: 'morning', active: true });
  console.log("Template:", template ? template.message : "Not found!");

  const primaryQuestion = await questionsCollection.findOne({ is_primary: true });
  console.log("Primary Question:", primaryQuestion ? "Found" : "Not found!");

  const users = await usersCollection.find({ notif_enabled: true, fcm_token: { $ne: null } }).toArray();
  console.log(`Found ${users.length} users with notif_enabled=true and fcm_token set.`);

  const todayWIB = startOfDay(toZonedTime(new Date(), TIMEZONE));
  console.log(`todayWIB: ${todayWIB}`);

  for (const user of users) {
    console.log(`--- Checking user: ${user.username} ---`);
    if (!user.tgl_melahirkan) {
      console.log("No tgl_melahirkan.");
      continue;
    }

    const birthWIB = startOfDay(toZonedTime(user.tgl_melahirkan, TIMEZONE));
    const currentHariKe = differenceInDays(todayWIB, birthWIB);
    console.log(`birthWIB: ${birthWIB}`);
    console.log(`currentHariKe: ${currentHariKe}`);

    if (currentHariKe >= 1 && currentHariKe <= 7) {
      console.log(`User is in active 1-7 days period.`);
      const existingResponse = await responsesCollection.findOne({
        user_id: user._id,
        question_id: primaryQuestion._id,
        hari_ke: currentHariKe,
      });

      if (!existingResponse) {
        console.log(`No response for hari_ke ${currentHariKe}. SHOULD SEND PUSH!`);
        console.log(`Token: ${user.fcm_token.substring(0, 15)}...`);
      } else {
        console.log(`Response already exists for hari_ke ${currentHariKe}. Skipping.`);
      }
    } else {
      console.log(`User is out of 1-7 days window.`);
    }
  }

  process.exit(0);
}

debugCron().catch(console.error);
