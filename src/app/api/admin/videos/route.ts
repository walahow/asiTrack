import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db/mongoose";
import Video from "@/models/Video";

function extractYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const videos = await Video.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ status: "success", data: videos });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
    }

    const data = await request.json();
    
    const youtubeId = extractYouTubeId(data.youtube_url);
    if (!youtubeId) {
      return NextResponse.json({ status: "error", message: "Invalid YouTube URL" }, { status: 400 });
    }

    await dbConnect();
    const newVideo = await Video.create({
      ...data,
      youtube_id: youtubeId,
      thumbnail_url: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
      created_by: session.user.id
    });

    return NextResponse.json({ status: "success", data: newVideo }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
