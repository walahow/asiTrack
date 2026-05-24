import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db/mongoose";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "user") {
      return NextResponse.json(
        { status: "error", message: "Tidak diizinkan. Silakan masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    await dbConnect();

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return NextResponse.json(
        { status: "error", message: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }
    
    const profile_fully_filled = !!(
      user.nama_lengkap &&
      user.username &&
      user.tgl_melahirkan &&
      user.usia !== undefined && user.usia !== null &&
      user.anak_ke_berapa !== undefined && user.anak_ke_berapa !== null &&
      user.alamat && user.alamat.trim() !== "" &&
      user.pendidikan && user.pendidikan.trim() !== "" &&
      user.pekerjaan && user.pekerjaan.trim() !== ""
    );

    return NextResponse.json({
      status: "success",
      user,
      profile_fully_filled,
    });
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal mengambil data profil" },
      { status: 500 }
    );
  }
}

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
    const { 
      nama_lengkap, 
      username, 
      tgl_melahirkan, 
      usia, 
      anak_ke_berapa, 
      alamat, 
      pendidikan, 
      pekerjaan, 
      notif_enabled 
    } = body;

    // Optional validations
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

    // Prepare update payload dynamically based on what was provided
    const updateData: Record<string, any> = {
      profile_completed: true, // Complete onboarding!
    };

    if (usia !== undefined) updateData.usia = usia ? Number(usia) : null;
    if (anak_ke_berapa !== undefined) updateData.anak_ke_berapa = anak_ke_berapa ? Number(anak_ke_berapa) : null;
    if (alamat !== undefined) updateData.alamat = alamat;
    if (pendidikan !== undefined) updateData.pendidikan = pendidikan || null;
    if (pekerjaan !== undefined) updateData.pekerjaan = pekerjaan;
    if (notif_enabled !== undefined) updateData.notif_enabled = !!notif_enabled;

    if (nama_lengkap !== undefined) {
      if (!nama_lengkap.trim()) {
        return NextResponse.json(
          { status: "error", message: "Nama lengkap tidak boleh kosong" },
          { status: 400 }
        );
      }
      updateData.nama_lengkap = nama_lengkap.trim();
    }

    if (tgl_melahirkan !== undefined) {
      if (!tgl_melahirkan) {
        return NextResponse.json(
          { status: "error", message: "Tanggal melahirkan tidak boleh kosong" },
          { status: 400 }
        );
      }
      const birthDate = new Date(tgl_melahirkan);
      if (isNaN(birthDate.getTime())) {
        return NextResponse.json(
          { status: "error", message: "Format tanggal melahirkan tidak valid" },
          { status: 400 }
        );
      }
      birthDate.setHours(0, 0, 0, 0);
      updateData.tgl_melahirkan = birthDate;
    }

    if (username !== undefined) {
      const cleanUsername = username.toLowerCase().trim();
      if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
        return NextResponse.json(
          { status: "error", message: "Username hanya boleh berisi huruf kecil, angka, dan underscore" },
          { status: 400 }
        );
      }
      // Check duplicate username
      const existingUser = await User.findOne({ username: cleanUsername, _id: { $ne: userId } });
      if (existingUser) {
        return NextResponse.json(
          { status: "error", message: "Username sudah digunakan oleh pengguna lain" },
          { status: 400 }
        );
      }
      updateData.username = cleanUsername;
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
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
        username: updatedUser.username,
        tgl_melahirkan: updatedUser.tgl_melahirkan,
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
