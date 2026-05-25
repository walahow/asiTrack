import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db/mongoose";
import Article from "@/models/Article";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const article = await Article.findById(params.id);
    if (!article) {
      return NextResponse.json({ status: "error", message: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ status: "success", data: article });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
    }

    const data = await request.json();
    
    // Auto-generate excerpt if not provided and content changed
    if (!data.excerpt && data.content) {
      const plainText = data.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      data.excerpt = plainText.substring(0, 200);
      if (plainText.length > 200) data.excerpt += "...";
    }

    await dbConnect();
    const updatedArticle = await Article.findByIdAndUpdate(params.id, data, { new: true });

    return NextResponse.json({ status: "success", data: updatedArticle });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    await Article.findByIdAndDelete(params.id);

    return NextResponse.json({ status: "success", message: "Article deleted" });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
