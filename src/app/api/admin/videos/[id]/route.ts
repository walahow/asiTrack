import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db/mongoose";
import Video from "@/models/Video";

function extractYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json({ status: "error", message: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({ status: "success", data: video });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
    }

    const data = await request.json();
    
    if (data.youtube_url) {
      const youtubeId = extractYouTubeId(data.youtube_url);
      if (!youtubeId) {
        return NextResponse.json({ status: "error", message: "Invalid YouTube URL" }, { status: 400 });
      }
      data.youtube_id = youtubeId;
      data.thumbnail_url = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    }

    await dbConnect();
    const updatedVideo = await Video.findByIdAndUpdate(id, data, { new: true });

    return NextResponse.json({ status: "success", data: updatedVideo });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    await Video.findByIdAndDelete(id);

    return NextResponse.json({ status: "success", message: "Video deleted" });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
