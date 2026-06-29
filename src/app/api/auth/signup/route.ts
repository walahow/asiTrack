import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama_lengkap, username, password } = body;

    // Validation checks
    if (!nama_lengkap || !username || !password) {
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
    // Automatically set tgl_melahirkan to today's date in WIB
    // Normalize to start of day in WIB/UTC
    const nowStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const [year, month, day] = nowStr.split('-');
    const birthDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)) - (7 * 60 * 60 * 1000));

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
