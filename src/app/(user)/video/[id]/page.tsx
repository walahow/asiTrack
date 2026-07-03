"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, PlayCircle, AlertCircle, Info } from "lucide-react";
import { useParams } from "next/navigation";

interface VideoDetail {
  _id: string;
  title: string;
  youtube_id: string;
  kategori: string;
  deskripsi: string;
  createdAt: string;
}

export default function VideoDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchVideo() {
      try {
        const res = await fetch(`/api/videos/${id}`);
        const data = await res.json();
        if (res.ok && data.status === "success") {
          setVideo(data.data);
        } else {
          throw new Error(data.message || "Video tidak ditemukan.");
        }
      } catch (err: any) {
        setError(err.message || "Koneksi terputus.");
      } finally {
        setLoading(false);
      }
    }
    fetchVideo();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6 min-h-screen">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin mb-4"></div>
        <p className="text-xs font-bold text-gray-400">Memuat Video...</p>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8 text-center min-h-screen">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-800">Video Tidak Ditemukan</h3>
        <p className="text-xs text-gray-500 mt-2">{error}</p>
        <Link href="/video" className="mt-6 px-6 py-2.5 bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md">
          Kembali ke Galeri
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 pb-24 pt-6 overflow-y-auto bg-gray-50">
      
      {/* Top Bar */}
      <div className="px-6 mb-4 flex items-center justify-between">
        <Link
          href="/video"
          className="inline-flex items-center justify-center w-10 h-10 bg-white text-gray-500 rounded-full shadow-sm hover:bg-indigo-50 hover:text-indigo-500 transition-colors border border-gray-100"
        >
          <ArrowLeft size={18} />
        </Link>
        <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
          {video.kategori}
        </span>
      </div>

      {/* Video Player Container */}
      <div className="w-full bg-black aspect-video relative shadow-xl">
        <iframe
          src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=1&rel=0`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full border-0"
        ></iframe>
      </div>

      {/* Details Section */}
      <div className="p-6 bg-white rounded-3xl mt-6 mx-4 relative z-10 min-h-[50vh] shadow-sm border border-gray-100">
        <h1 className="text-xl font-black text-gray-900 leading-tight mb-4">
          {video.title}
        </h1>
        
        <div className="flex items-start gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 mb-6">
          <Info size={18} className="text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 leading-relaxed font-medium">
            {video.deskripsi}
          </p>
        </div>

      </div>
    </div>
  );
}
