import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db/mongoose";
import User from "@/models/User";
import Response from "@/models/Response";

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
      user: {
        ...user.toObject(),
        fcm_token: user.fcm_tokens && user.fcm_tokens.length > 0 ? user.fcm_tokens[user.fcm_tokens.length - 1] : null,
      },
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
      notif_enabled,
      fcm_token
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
    const $set: Record<string, any> = {
      profile_completed: true, // Complete onboarding!
    };
    let $addToSet: Record<string, any> | undefined = undefined;

    if (usia !== undefined) $set.usia = usia ? Number(usia) : null;
    if (anak_ke_berapa !== undefined) $set.anak_ke_berapa = anak_ke_berapa ? Number(anak_ke_berapa) : null;
    if (alamat !== undefined) $set.alamat = alamat;
    if (pendidikan !== undefined) $set.pendidikan = pendidikan || null;
    if (pekerjaan !== undefined) $set.pekerjaan = pekerjaan;
    if (notif_enabled !== undefined) $set.notif_enabled = !!notif_enabled;
    
    // Multi-device array logic
    if (notif_enabled === false) {
      $set.fcm_tokens = [];
    } else if (fcm_token) {
      $addToSet = { fcm_tokens: fcm_token };
    }

    if (nama_lengkap !== undefined) {
      if (!nama_lengkap.trim()) {
        return NextResponse.json(
          { status: "error", message: "Nama lengkap tidak boleh kosong" },
          { status: 400 }
        );
      }
      $set.nama_lengkap = nama_lengkap.trim();
    }

    if (tgl_melahirkan !== undefined) {
      if (!tgl_melahirkan) {
        return NextResponse.json(
          { status: "error", message: "Tanggal melahirkan tidak boleh kosong" },
          { status: 400 }
        );
      }
      const [year, month, day] = tgl_melahirkan.split('-');
      // Strictly normalize to Midnight WIB (UTC+7) regardless of server timezone
      const birthDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)) - (7 * 60 * 60 * 1000));
      if (isNaN(birthDate.getTime())) {
        return NextResponse.json(
          { status: "error", message: "Format tanggal melahirkan tidak valid" },
          { status: 400 }
        );
      }
      $set.tgl_melahirkan = birthDate;
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
      $set.username = cleanUsername;
    }

    const updatePayload: Record<string, any> = { $set };
    if ($addToSet) {
      updatePayload.$addToSet = $addToSet;
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updatePayload,
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { status: "error", message: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    // Realignment of existing response dates if tgl_melahirkan was updated
    if (tgl_melahirkan !== undefined) {
      try {
        const userResponses = await Response.find({ user_id: userId });
        if (userResponses.length > 0) {
          const TIMEZONE_OFFSET = 7 * 60 * 60 * 1000; // +7 hours for WIB
          const birthDateUTC = new Date(updatedUser.tgl_melahirkan);
          const birthWIB = new Date(birthDateUTC.getTime() + TIMEZONE_OFFSET);
          const birthWIBStart = new Date(Date.UTC(birthWIB.getUTCFullYear(), birthWIB.getUTCMonth(), birthWIB.getUTCDate()) - TIMEZONE_OFFSET);

          for (const r of userResponses) {
            const responseDateWIB = new Date(birthWIBStart);
            responseDateWIB.setUTCDate(responseDateWIB.getUTCDate() + Number(r.hari_ke));
            r.response_date = new Date(responseDateWIB.getTime() - TIMEZONE_OFFSET);
            await r.save();
          }
          console.log(`Successfully realigned ${userResponses.length} response dates for user ${userId} following delivery date update.`);
        }
      } catch (alignErr) {
        console.error("Failed to realign response dates on profile birthdate change:", alignErr);
      }
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
