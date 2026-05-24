import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import Question from "@/models/Question";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const questions = await Question.find({ active: true }).sort({ order: 1 });
    return NextResponse.json({
      status: "success",
      data: questions,
    });
  } catch (error: any) {
    console.error("Failed to fetch questions:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal memuat pertanyaan" },
      { status: 500 }
    );
  }
}
