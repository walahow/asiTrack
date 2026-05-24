import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import Article from "@/models/Article";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "user") {
      return NextResponse.json(
        { status: "error", message: "Tidak diizinkan. Silakan masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // Only return published articles, sorted by newest
    const articles = await Article.find({ published: true })
      .select("title excerpt cover_image_url kategori createdAt")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      status: "success",
      data: articles,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal mengambil daftar artikel" },
      { status: 500 }
    );
  }
}
