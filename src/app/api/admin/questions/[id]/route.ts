import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db/mongoose";
import Question from "@/models/Question";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const question = await Question.findById(id);
    if (!question) {
      return NextResponse.json({ status: "error", message: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({ status: "success", data: question });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
    }

    const data = await request.json();

    await dbConnect();

    // If setting as primary, unset other primaries
    if (data.is_primary) {
      await Question.updateMany({ _id: { $ne: id } }, { is_primary: false });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(id, data, { new: true });

    return NextResponse.json({ status: "success", data: updatedQuestion });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    
    const q = await Question.findById(id);
    if (q && q.is_primary) {
      return NextResponse.json({ status: "error", message: "Cannot delete the primary question" }, { status: 400 });
    }

    await Question.findByIdAndDelete(id);

    return NextResponse.json({ status: "success", message: "Question deleted" });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
