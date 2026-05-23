import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db/mongoose";
import User from "@/models/User";

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "user") {
      return NextResponse.json(
        { status: "error", message: "Tidak diizinkan. Silakan masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { usia, anak_ke_berapa, alamat, pendidikan, pekerjaan, notif_enabled } = body;

    // Optional validation
    if (usia && (isNaN(Number(usia)) || Number(usia) <= 0)) {
      return NextResponse.json(
        { status: "error", message: "Usia harus berupa angka positif" },
        { status: 400 }
      );
    }

    if (anak_ke_berapa && (isNaN(Number(anak_ke_berapa)) || Number(anak_ke_berapa) <= 0)) {
      return NextResponse.json(
        { status: "error", message: "Jumlah anak harus berupa angka positif" },
        { status: 400 }
      );
    }

    const allowedPendidikan = ["SD", "SMP", "SMA", "D3", "S1", "S2", "S3"];
    if (pendidikan && !allowedPendidikan.includes(pendidikan)) {
      return NextResponse.json(
        { status: "error", message: "Pendidikan terakhir tidak valid" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        usia: usia ? Number(usia) : undefined,
        anak_ke_berapa: anak_ke_berapa ? Number(anak_ke_berapa) : undefined,
        alamat: alamat || undefined,
        pendidikan: pendidikan || undefined,
        pekerjaan: pekerjaan || undefined,
        notif_enabled: !!notif_enabled,
        profile_completed: true, // Complete onboarding!
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { status: "error", message: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Profil laktasi berhasil diselesaikan!",
      user: {
        id: updatedUser._id,
        nama_lengkap: updatedUser.nama_lengkap,
        profile_completed: updatedUser.profile_completed,
      },
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}
