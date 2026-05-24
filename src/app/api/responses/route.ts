import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db/mongoose";
import User from "@/models/User";
import Question from "@/models/Question";
import Response from "@/models/Response";
import { startOfDay } from "date-fns";

const TIMEZONE_OFFSET = 7 * 60 * 60 * 1000; // +7 hours for WIB

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "user") {
      return NextResponse.json(
        { status: "error", message: "Tidak diizinkan. Silakan masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { hari_ke, answers } = body; // answers: [{ question_id: string, jawaban: string }]

    if (!hari_ke || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { status: "error", message: "Parameter tidak valid. Data jawaban wajib dikirimkan." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Fetch user details to get tgl_melahirkan
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { status: "error", message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    // Calculate robust WIB dates
    const birthDateUTC = new Date(user.tgl_melahirkan);
    const birthWIBStart = new Date(birthDateUTC.getTime() + TIMEZONE_OFFSET);
    
    // Calculate the response_date for the submitted hari_ke in WIB
    const responseDateWIB = new Date(birthWIBStart);
    responseDateWIB.setUTCDate(responseDateWIB.getUTCDate() + Number(hari_ke));
    // Shift back to UTC for storage
    const responseDateStorage = new Date(responseDateWIB.getTime() - TIMEZONE_OFFSET);

    const savedResponses = [];
    let milestoneTriggered = false;
    let primaryQuestionId = "";

    // 1. Loop through and save each daily question response idempotently
    for (const item of answers) {
      const { question_id, jawaban } = item;
      if (!question_id || jawaban === undefined || jawaban === null) continue;

      // Verify if this is the active primary question
      const question = await Question.findById(question_id);
      if (!question) continue;

      // Check if primary question is answered "ya"
      if (question.is_primary && jawaban.toLowerCase() === "ya") {
        milestoneTriggered = true;
        primaryQuestionId = question._id.toString();
      }

      // Upsert to handle updates gracefully and ensure compound key safety using hari_ke!
      const responseDoc = await Response.findOneAndUpdate(
        {
          user_id: user._id,
          question_id: question._id,
          hari_ke: Number(hari_ke), // Key uniquely by day
        },
        {
          jawaban: jawaban.trim(),
          response_date: responseDateStorage,
          auto_filled: false,
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );

      savedResponses.push(responseDoc);
    }

    // 2. Cascade Auto-Fill Logic: if the primary milestone is met, auto-fill remaining days [N+1, 7] and previous missed days [1, N-1]
    if (milestoneTriggered && primaryQuestionId) {
      const currentN = Number(hari_ke);

      // A. Auto-fill subsequent days [N+1, 7]
      const startDayForAutofill = currentN + 1;
      for (let d = startDayForAutofill; d <= 7; d++) {
        // Calculate the response_date for auto-filled day
        const autoDateWIB = new Date(birthWIBStart);
        autoDateWIB.setUTCDate(autoDateWIB.getUTCDate() + d);
        const autoDateStorage = new Date(autoDateWIB.getTime() - TIMEZONE_OFFSET);

        await Response.findOneAndUpdate(
          {
            user_id: user._id,
            question_id: primaryQuestionId,
            hari_ke: d,
          },
          {
            jawaban: "ya",
            response_date: autoDateStorage,
            auto_filled: true,
          },
          {
            upsert: true,
            new: true,
          }
        );
      }

      // B. Auto-fill previous missed/unanswered days [1, N-1]
      for (let d = 1; d < currentN; d++) {
        const existingResponse = await Response.findOne({
          user_id: user._id,
          hari_ke: d,
        });

        // Only backfill if the mother completely missed this day
        if (!existingResponse) {
          const autoDateWIB = new Date(birthWIBStart);
          autoDateWIB.setUTCDate(autoDateWIB.getUTCDate() + d);
          const autoDateStorage = new Date(autoDateWIB.getTime() - TIMEZONE_OFFSET);

          await Response.findOneAndUpdate(
            {
              user_id: user._id,
              question_id: primaryQuestionId,
              hari_ke: d,
            },
            {
              jawaban: "ya",
              response_date: autoDateStorage,
              auto_filled: true,
            },
            {
              upsert: true,
              new: true,
            }
          );
        }
      }
    }

    return NextResponse.json({
      status: "success",
      message: milestoneTriggered
        ? `Laporan Hari ke-${hari_ke} berhasil disimpan! Milestone ASI keluar berhasil dicapai. Sisa hari otomatis terisi.`
        : `Laporan Hari ke-${hari_ke} berhasil disimpan!`,
      milestoneAchieved: milestoneTriggered,
      count: savedResponses.length,
    });
  } catch (error: any) {
    console.error("Failed to save responses:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal menyimpan jawaban" },
      { status: 500 }
    );
  }
}
