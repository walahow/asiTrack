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

    // Find users matching criteria
    const users = await User.find(userQuery).select("_id nama_lengkap username tgl_melahirkan usia anak_ke_berapa pendidikan pekerjaan profile_completed");
    const userIds = users.map((u) => u._id);

    // Fetch responses for these users
    const responses = await Response.find({ user_id: { $in: userIds } })
      .populate("question_id", "pertanyaan tipe is_primary")
      .lean();

    // Create a map for quick user lookup
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const exportData = responses.map((res: any) => {
      const user = userMap.get(res.user_id.toString());
      const question = res.question_id;

      return {
        nama_lengkap: user?.nama_lengkap || "",
        tgl_melahirkan: user?.tgl_melahirkan ? new Date(user.tgl_melahirkan).toISOString().split("T")[0] : "",
        usia: user?.usia || "",
        anak_ke_berapa: user?.anak_ke_berapa || "",
        pendidikan: user?.pendidikan || "",
        pekerjaan: user?.pekerjaan || "",
        pertanyaan: question?.pertanyaan || "",
        hari_ke: res.hari_ke,
        jawaban: res.jawaban,
        auto_filled: res.auto_filled ? "Ya" : "Tidak",
        response_date: res.response_date ? new Date(res.response_date).toISOString().split("T")[0] : "",
      };
    });

    const csv = Papa.unparse(exportData);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="hypemom_export_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ status: "error", message: "Failed to export data" }, { status: 500 });
  }
}
