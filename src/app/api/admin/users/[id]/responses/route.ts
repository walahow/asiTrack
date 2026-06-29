import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db/mongoose";
import User from "@/models/User";
import Response from "@/models/Response";
import Question from "@/models/Question";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ status: "error", message: "User ID is required" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(id).select("-password").lean();
    if (!user) {
      return NextResponse.json({ status: "error", message: "User not found" }, { status: 404 });
    }

    const responses = await Response.find({ user_id: id })
      .populate({
        path: "question_id",
        model: Question,
        select: "pertanyaan tipe is_primary",
      })
      .sort({ response_date: 1 })
      .lean();

    return NextResponse.json({
      status: "success",
      data: {
        user,
        responses,
      }
    });
  } catch (error: any) {
    console.error("Admin Fetch User Responses Error:", error);
    return NextResponse.json(
      { status: "error", message: "Gagal memuat catatan user" },
      { status: 500 }
    );
  }
}
