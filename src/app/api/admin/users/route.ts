import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db/mongoose";
import User from "@/models/User";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const query: any = {};
    if (search) {
      query.$or = [
        { nama_lengkap: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } }
      ];
    }

    // Return users sorted by created_at desc, exclude password
    const users = await User.find(query)
      .select("-password")
      .sort({ created_at: -1 })
      .lean();

    return NextResponse.json({ status: "success", data: users });
  } catch (error: any) {
    console.error("Admin Fetch Users Error:", error);
    return NextResponse.json(
      { status: "error", message: "Gagal memuat pengguna" },
      { status: 500 }
    );
  }
}
