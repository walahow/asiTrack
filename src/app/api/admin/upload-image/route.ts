import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { put } from "@vercel/blob";
import path from "path";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ status: "error", message: "No file provided" }, { status: 400 });
    }

    // Generate random filename to avoid collisions
    const ext = path.extname(file.name);
    const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`;

    // Upload directly to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    });

    return NextResponse.json({ status: "success", url: blob.url });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ status: "error", message: "Failed to upload image" }, { status: 500 });
  }
}
