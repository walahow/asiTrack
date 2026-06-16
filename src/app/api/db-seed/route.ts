import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import Admin from "@/models/Admin";
import Question from "@/models/Question";
import NotificationTemplate from "@/models/NotificationTemplate";
import bcrypt from "bcryptjs";

// Make the route dynamic so it is run at execution time
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const results: Record<string, any> = {};

    // 1. Seed Super Admin
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash("adminasi123", 10);
      const newAdmin = await Admin.create({
        username: "admin",
        email: "admin@hypemom.id",
        password: hashedPassword,
        role: "super_admin",
      });
      results.admin = {
        status: "created",
        username: newAdmin.username,
        role: newAdmin.role,
      };
    } else {
      results.admin = {
        status: "exists",
        count: adminCount,
      };
    }

    // 2. Seed Active Primary Question
    const primaryQuestion = await Question.findOne({ is_primary: true });
    if (!primaryQuestion) {
      const newQuestion = await Question.create({
        pertanyaan: "Apakah ASI sudah keluar?",
        tipe: "yes_no",
        is_primary: true,
        active: true,
        order: 1,
      });
      results.primaryQuestion = {
        status: "created",
        pertanyaan: newQuestion.pertanyaan,
        is_primary: newQuestion.is_primary,
      };
    } else {
      results.primaryQuestion = {
        status: "exists",
        pertanyaan: primaryQuestion.pertanyaan,
      };
    }

    // 3. Seed Default Notification Templates
    const templatesCount = await NotificationTemplate.countDocuments();
    if (templatesCount === 0) {
      const defaultTemplates = [
        {
          tipe: "morning" as const,
          message: "Selamat pagi Bunda! Jangan lupa pantau dan catat perkembangan laktasi si kecil hari ini di hypemom ya. Tetap semangat, Bunda hebat! 🌸",
          active: true,
        },
        {
          tipe: "afternoon" as const,
          message: "Selamat siang Bunda! Bagaimana kondisi laktasi siang ini? Yuk luangkan waktu sejenak untuk mengisi tracking harian Anda di hypemom. 💕",
          active: true,
        },
        {
          tipe: "evening" as const,
          message: "Selamat malam Bunda! Sebelum beristirahat, mari catat perkembangan ASI hari ini. Istirahat yang cukup juga membantu produksi ASI lho. Selamat tidur! 🌟",
          active: true,
        },
      ];

      const seededTemplates = await NotificationTemplate.insertMany(defaultTemplates);
      results.notificationTemplates = {
        status: "created",
        count: seededTemplates.length,
      };
    } else {
      results.notificationTemplates = {
        status: "exists",
        count: templatesCount,
      };
    }

    return NextResponse.json({
      status: "success",
      message: "Database seed operations checked/completed successfully.",
      results,
    });
  } catch (error: any) {
    console.error("Database seeding failed:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Database seeding failed",
        error: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
