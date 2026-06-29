import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db/mongoose";
import Response from "@/models/Response";
import User from "@/models/User";
import Question from "@/models/Question";
import Papa from "papaparse";
import { startOfDay, endOfDay, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const pendidikan = searchParams.get("pendidikan");

    // Build the query
    const userQuery: any = {};
    if (pendidikan) {
      userQuery.pendidikan = { $in: pendidikan.split(",") };
    }

    if (dateFrom || dateTo) {
      userQuery.tgl_melahirkan = {};
      const TIMEZONE = "Asia/Jakarta";
      if (dateFrom) {
        userQuery.tgl_melahirkan.$gte = startOfDay(toZonedTime(parseISO(dateFrom), TIMEZONE));
      }
      if (dateTo) {
        userQuery.tgl_melahirkan.$lte = endOfDay(toZonedTime(parseISO(dateTo), TIMEZONE));
      }
    }

    // Fetch active questions to define the columns
    const activeQuestions = await Question.find({ active: true }).sort({ order: 1 }).lean();
    const primaryQuestions = activeQuestions.filter((q: any) => q.is_primary);
    const secondaryQuestions = activeQuestions.filter((q: any) => !q.is_primary);

    // Find users matching criteria
    const users = await User.find(userQuery).select("_id nama_lengkap username tgl_melahirkan usia anak_ke_berapa pendidikan pekerjaan profile_completed");
    const userIds = users.map((u) => u._id);

    // Fetch all responses for these users
    const responses = await Response.find({ user_id: { $in: userIds } }).lean();

    // Group responses by user_id -> hari_ke -> question_id
    const userResponsesMap = new Map();
    for (const r of responses) {
      const uid = r.user_id.toString();
      const qid = r.question_id.toString();
      const day = r.hari_ke;

      if (!userResponsesMap.has(uid)) userResponsesMap.set(uid, {});
      if (!userResponsesMap.get(uid)[day]) userResponsesMap.get(uid)[day] = {};
      
      userResponsesMap.get(uid)[day][qid] = r;
    }

    const exportData = users.map((user: any) => {
      const row: any = {
        nama_lengkap: user.nama_lengkap || "",
        username: user.username || "",
        tgl_melahirkan: user.tgl_melahirkan ? new Date(user.tgl_melahirkan).toISOString().split("T")[0] : "",
        usia: user.usia || "",
        anak_ke_berapa: user.anak_ke_berapa || "",
        pendidikan: user.pendidikan || "",
        pekerjaan: user.pekerjaan || "",
      };

      const uMap = userResponsesMap.get(user._id.toString()) || {};

      // Process primary questions first (Day 1 - 7)
      for (const q of primaryQuestions) {
        for (let day = 1; day <= 7; day++) {
          const colName = `Hari ${day} - ${q.pertanyaan}`;
          const res = uMap[day]?.[q._id.toString()];
          row[colName] = res ? (res.auto_filled ? `${res.jawaban} (Auto)` : res.jawaban) : null;
        }
      }

      // Process secondary questions after (Single column)
      for (const q of secondaryQuestions) {
        const colName = q.pertanyaan;
        let foundRes = null;
        for (let day = 1; day <= 7; day++) {
          if (uMap[day]?.[q._id.toString()]) {
            foundRes = uMap[day][q._id.toString()];
            break;
          }
        }
        row[colName] = foundRes ? (foundRes.auto_filled ? `${foundRes.jawaban} (Auto)` : foundRes.jawaban) : null;
      }

      return row;
    });

    const csv = Papa.unparse(exportData);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="hypnomom_export_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ status: "error", message: "Failed to export data" }, { status: 500 });
  }
}
