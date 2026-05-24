import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import Video from "@/models/Video";
import { auth } from "@/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "user") {
      return NextResponse.json(
        { status: "error", message: "Tidak diizinkan. Silakan masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // Parse query params for category filtering
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get("kategori");

    const query: any = { published: true };
    if (kategori) {
      query.kategori = kategori;
    }

    const videos = await Video.find(query)
      .select("title thumbnail_url kategori deskripsi createdAt")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      status: "success",
      data: videos,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal mengambil daftar video" },
      { status: 500 }
    );
  }
}
