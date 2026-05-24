import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import Video from "@/models/Video";
import { auth } from "@/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "user") {
      return NextResponse.json(
        { status: "error", message: "Tidak diizinkan. Silakan masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const video = await Video.findOne({ _id: params.id, published: true })
      .select("-__v");

    if (!video) {
      return NextResponse.json(
        { status: "error", message: "Video tidak ditemukan atau belum dipublikasikan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: video,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal mengambil video" },
      { status: 500 }
    );
  }
}
