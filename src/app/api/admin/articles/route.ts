import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db/mongoose";
import Article from "@/models/Article";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const articles = await Article.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ status: "success", data: articles });
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
    
    // Auto-generate excerpt if not provided (take first 200 chars of plain text from HTML)
    let excerpt = data.excerpt;
    if (!excerpt && data.content) {
      // Very basic strip HTML
      const plainText = data.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      excerpt = plainText.substring(0, 200);
      if (plainText.length > 200) excerpt += "...";
    }

    await dbConnect();
    const newArticle = await Article.create({
      ...data,
      excerpt,
      created_by: session.user.id
    });

    return NextResponse.json({ status: "success", data: newArticle }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
