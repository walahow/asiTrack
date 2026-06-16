import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db/mongoose";
import User from "@/models/User";
import Response from "@/models/Response";
import Question from "@/models/Question";

const TIMEZONE_OFFSET = 7 * 60 * 60 * 1000; // +7 hours for WIB

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "user") {
      return NextResponse.json(
        { status: "error", message: "Tidak diizinkan. Silakan masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    await dbConnect();

    // Fetch user details
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { status: "error", message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    // Check for Time Travel Simulation offset
    const cookieStore = await cookies();
    const simulatedOffsetStr = cookieStore.get('hypemom_timeOffsetDays')?.value;
    const simulatedOffsetDays = simulatedOffsetStr ? parseInt(simulatedOffsetStr, 10) : 0;

    // WIB Timezone day calculation using robust UTC math
    const nowUTC = new Date();
    if (simulatedOffsetDays && !isNaN(simulatedOffsetDays)) {
      nowUTC.setUTCDate(nowUTC.getUTCDate() + simulatedOffsetDays);
    }
    
    const nowWIB = new Date(nowUTC.getTime() + TIMEZONE_OFFSET);
    // Get start of today by zeroing out hours, minutes, seconds in UTC context for WIB
    const todayWIBStart = new Date(Date.UTC(nowWIB.getUTCFullYear(), nowWIB.getUTCMonth(), nowWIB.getUTCDate()) - TIMEZONE_OFFSET);

    const birthDateUTC = new Date(user.tgl_melahirkan);
    const birthWIB = new Date(birthDateUTC.getTime() + TIMEZONE_OFFSET);
    // Force align the birth date to the strict start of the WIB day
    const birthWIBStart = new Date(Date.UTC(birthWIB.getUTCFullYear(), birthWIB.getUTCMonth(), birthWIB.getUTCDate()) - TIMEZONE_OFFSET);
    
    // hari_ke = 1 is the day after birth
    const diffTime = todayWIBStart.getTime() - birthWIBStart.getTime();
    const currentHariKe = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Fetch active primary question
    const primaryQuestion = await Question.findOne({ is_primary: true, active: true });
    
    // Fetch all logged responses for this user
    const userResponses = await Response.find({ user_id: user._id });

    // Determine if the milestone was ever achieved (answered "ya" to primary question and explicitly filled)
    const milestoneResponse = primaryQuestion
      ? userResponses.find(
          (r) =>
            r.question_id.toString() === primaryQuestion._id.toString() &&
            r.jawaban.toLowerCase() === "ya" &&
            r.auto_filled === false
        )
      : undefined;
    
    const milestoneAchieved = !!milestoneResponse;
    const milestoneDay = milestoneResponse ? milestoneResponse.hari_ke : null;

    // Calculate pending days that have NO logged responses in the range [1, currentHariKe] (capped at Day 7)
    const pendingDays: number[] = [];
    const maxDayToCheck = Math.min(currentHariKe, 7);
    
    if (currentHariKe >= 1) {
      for (let d = 1; d <= maxDayToCheck; d++) {
        const hasResponsesForDay = userResponses.some((r) => r.hari_ke === d);
        if (!hasResponsesForDay) {
          pendingDays.push(d);
        }
      }
    }

    // The tracking is completely finished if:
    // 1. currentHariKe > 7
    // 2. Or the milestone was achieved, AND all days up to the milestone day are filled.
    // (Days after the milestone are auto-filled, so they won't be pending).
    const completed = currentHariKe > 7 || (milestoneAchieved && pendingDays.length === 0);

    return NextResponse.json({
      status: "success",
      data: {
        nama_lengkap: user.nama_lengkap,
        tgl_melahirkan: user.tgl_melahirkan,
        currentHariKe,
        milestoneAchieved,
        milestoneDay,
        completed,
        pendingDays,
        profile_completed: user.profile_completed,
        notif_enabled: !!user.notif_enabled,
        userResponses,
      },
    });

  } catch (error: any) {
    console.error("Failed to fetch tracking state:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal mengambil data pelacakan" },
      { status: 500 }
    );
  }
}
