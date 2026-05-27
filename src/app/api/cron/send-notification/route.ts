import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/db/mongoose';
import NotificationTemplate from '@/models/NotificationTemplate';
import User from '@/models/User';
import Question from '@/models/Question';
import Response from '@/models/Response';
import { sendPushNotification } from '@/lib/firebase/admin';
import { toZonedTime } from 'date-fns-tz';
import { differenceInDays, startOfDay } from 'date-fns';

const TIMEZONE = 'Asia/Jakarta';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slot = searchParams.get('slot'); // morning, afternoon, evening
    
    if (!slot || !['morning', 'afternoon', 'evening'].includes(slot)) {
      return NextResponse.json({ error: 'Invalid or missing slot parameter' }, { status: 400 });
    }

    await dbConnect();

    // Find the active template for this slot
    const template = await NotificationTemplate.findOne({ tipe: slot, active: true });
    
    if (!template) {
      return NextResponse.json({ message: `No active template found for slot: ${slot}` });
    }

    // Find all users who have notifications enabled
    const users = await User.find({ notif_enabled: true, fcm_token: { $ne: null } });
    
    // Find the primary question
    const primaryQuestion = await Question.findOne({ is_primary: true });

    if (!primaryQuestion) {
      return NextResponse.json({ message: 'No primary question configured. Skipping notifications.' });
    }

    const todayWIB = startOfDay(toZonedTime(new Date(), TIMEZONE));
    let sentCount = 0;

    for (const user of users) {
      if (!user.tgl_melahirkan) continue;

      const birthWIB = startOfDay(toZonedTime(user.tgl_melahirkan, TIMEZONE));
      const currentHariKe = differenceInDays(todayWIB, birthWIB);

      // Only send if they are in the active 1-7 days period
      if (currentHariKe >= 1 && currentHariKe <= 7) {
        // Check if the user has already answered the primary question for today
        const existingResponse = await Response.findOne({
          user_id: user._id,
          question_id: primaryQuestion._id,
          hari_ke: currentHariKe,
        });

        if (!existingResponse) {
          // Send notification because they haven't filled it out
          const result = await sendPushNotification(
            user.fcm_token,
            "Pengingat Laktasi asiTrack",
            template.message
          );
          if (result.success) {
            sentCount++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed cron for ${slot}`,
      sentCount,
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
