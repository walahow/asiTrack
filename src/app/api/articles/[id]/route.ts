import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import Article from "@/models/Article";
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
    
    // Allow seeing a published article
    const article = await Article.findOne({ _id: params.id, published: true })
      .select("-__v");

    if (!article) {
      return NextResponse.json(
        { status: "error", message: "Artikel tidak ditemukan atau belum dipublikasikan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: article,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal mengambil artikel" },
      { status: 500 }
    );
  }
}
