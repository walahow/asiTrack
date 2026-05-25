import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db/mongoose";
import User from "@/models/User";
import Response from "@/models/Response";
import { toZonedTime } from "date-fns-tz";
import { differenceInDays, startOfDay } from "date-fns";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();

    const TIMEZONE = "Asia/Jakarta";
    const todayWIB = startOfDay(toZonedTime(new Date(), TIMEZONE));

    // Get all users
    const allUsers = await User.find({});
    
    let totalActiveUsers = 0;
    let totalCompletedUsers = 0; // hari_ke > 7 or primary question answered
    let milestoneAchievedCount = 0;
    
    // We also want to know the response rate for today
    // Users who are active today
    const activeUsersTodayIds: string[] = [];

    for (const user of allUsers) {
      if (!user.tgl_melahirkan) continue;
      
      const birthWIB = startOfDay(toZonedTime(new Date(user.tgl_melahirkan), TIMEZONE));
      const currentHariKe = differenceInDays(todayWIB, birthWIB);

      if (currentHariKe >= 1 && currentHariKe <= 7) {
        totalActiveUsers++;
        activeUsersTodayIds.push(user._id.toString());
      } else if (currentHariKe > 7) {
        totalCompletedUsers++;
      }
    }

    // How many responses were filled today?
    let responseRateToday = 0;
    let todayResponsesCount = 0;
    if (activeUsersTodayIds.length > 0) {
      // Find distinct users who responded today
      const uniqueRespondersToday = await Response.distinct("user_id", {
        response_date: todayWIB,
        user_id: { $in: activeUsersTodayIds }
      });
      todayResponsesCount = uniqueRespondersToday.length;
      responseRateToday = Math.round((todayResponsesCount / activeUsersTodayIds.length) * 100);
    }

    // Milestone Distribution
    // Find all responses where jawaban is "ya" and auto_filled is false for primary questions
    // But since we want to know how many users achieved it overall:
    // For simplicity, we can count the number of users who have a "ya" for the primary question
    // First find the primary question
    const Question = (await import("@/models/Question")).default;
    const primaryQ = await Question.findOne({ is_primary: true });
    
    if (primaryQ) {
      const milestoneUsers = await Response.distinct("user_id", {
        question_id: primaryQ._id,
        jawaban: "ya",
        auto_filled: false // The day they actually achieved it
      });
      milestoneAchievedCount = milestoneUsers.length;
    }

    return NextResponse.json({
      status: "success",
      data: {
        totalUsers: allUsers.length,
        activeUsers: totalActiveUsers,
        completedUsers: totalCompletedUsers,
        responseRateToday,
        todayResponsesCount,
        milestoneAchievedCount,
      }
    });

  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
