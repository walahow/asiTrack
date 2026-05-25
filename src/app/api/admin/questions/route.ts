import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db/mongoose";
import Question from "@/models/Question";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const questions = await Question.find({}).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({ status: "success", data: questions });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
    }

    const data = await request.json();

    await dbConnect();
    
    // If setting as primary, unset other primaries
    if (data.is_primary) {
      await Question.updateMany({}, { is_primary: false });
    }

    const newQuestion = await Question.create(data);

    return NextResponse.json({ status: "success", data: newQuestion }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
