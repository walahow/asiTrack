import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/db/mongoose';
import NotificationTemplate from '@/models/NotificationTemplate';
import User from '@/models/User';
import Question from '@/models/Question';
import Response from '@/models/Response';
import { sendMulticastPushNotification } from '@/lib/firebase/admin';
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
    const validSlot = slot as 'morning' | 'afternoon' | 'evening';
    const template = await NotificationTemplate.findOne({ tipe: validSlot, active: true });
    
    if (!template) {
      return NextResponse.json({ message: `No active template found for slot: ${slot}` });
    }

    // Find all users who have notifications enabled and at least one device token
    const users = await User.find({ notif_enabled: true, fcm_tokens: { $exists: true, $not: { $size: 0 } } });
    
    // Find the primary question
    const primaryQuestion = await Question.findOne({ is_primary: true });

    if (!primaryQuestion) {
      return NextResponse.json({ message: 'No primary question configured. Skipping notifications.' });
    }

    const nowUTC = new Date();
    const nowWIB = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);
    const todayWIBStart = new Date(Date.UTC(nowWIB.getUTCFullYear(), nowWIB.getUTCMonth(), nowWIB.getUTCDate()) - (7 * 60 * 60 * 1000));

    let sentCount = 0;

    for (const user of users) {
      if (!user.tgl_melahirkan) continue;

      const birthDateUTC = new Date(user.tgl_melahirkan);
      const birthWIB = new Date(birthDateUTC.getTime() + 7 * 60 * 60 * 1000);
      const birthWIBStart = new Date(Date.UTC(birthWIB.getUTCFullYear(), birthWIB.getUTCMonth(), birthWIB.getUTCDate()) - (7 * 60 * 60 * 1000));
      
      const diffTime = todayWIBStart.getTime() - birthWIBStart.getTime();
      const currentHariKe = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // Only send if they are in the active 1-7 days period
      if (currentHariKe >= 1 && currentHariKe <= 7) {
        // Check if the user has already answered the primary question for today
        const existingResponse = await Response.findOne({
          user_id: user._id,
          question_id: primaryQuestion._id,
          hari_ke: currentHariKe,
        });

        if (!existingResponse && user.fcm_tokens && user.fcm_tokens.length > 0) {
          // Send notification because they haven't filled it out
          const result = await sendMulticastPushNotification(
            user.fcm_tokens,
            "Pengingat Laktasi hypemom",
            template.message
          );
          if (result.success) {
            sentCount++; // Counting per user, not per device
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
