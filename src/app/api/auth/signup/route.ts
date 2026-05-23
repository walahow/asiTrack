import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama_lengkap, username, password, tgl_melahirkan } = body;

    // Validation checks
    if (!nama_lengkap || !username || !password || !tgl_melahirkan) {
      return NextResponse.json(
        { status: "error", message: "Semua kolom wajib diisi" },
        { status: 400 }
      );
    }

    const cleanUsername = username.toLowerCase().trim();
    
    // Alphanumeric + underscore check
    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      return NextResponse.json(
        { status: "error", message: "Username hanya boleh berisi huruf kecil, angka, dan underscore" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check duplicate
    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return NextResponse.json(
        { status: "error", message: "Username sudah digunakan, silakan pilih username lain" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    // Normalize tgl_melahirkan to start of day in WIB/UTC
    const birthDate = new Date(tgl_melahirkan);
    birthDate.setHours(0, 0, 0, 0);

    await User.create({
      nama_lengkap,
      username: cleanUsername,
      password: hashedPassword,
      tgl_melahirkan: birthDate,
      notif_enabled: false,
      profile_completed: false,
    });

    return NextResponse.json({
      status: "success",
      message: "Pendaftaran berhasil! Silakan masuk untuk melacak.",
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
