"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlayCircle, AlertCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoSummary {
  _id: string;
  title: string;
  thumbnail_url: string;
  kategori: string;
  createdAt: string;
}

export default function VideoList() {
  const [videos, setVideos] = useState<VideoSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"semua" | "relaksasi" | "terapi">("semua");

  useEffect(() => {
    async function fetchVideos() {
      setLoading(true);
      try {
        const url = activeTab === "semua" ? "/api/videos" : `/api/videos?kategori=${activeTab}`;
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok && data.status === "success") {
          setVideos(data.data);
        } else {
          throw new Error(data.message || "Gagal memuat video.");
        }
      } catch (err: any) {
        setError(err.message || "Koneksi terputus.");
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, [activeTab]);

  return (
    <div className="flex flex-col flex-1 pb-24 pt-10 px-6 overflow-y-auto">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 mb-4 shadow-sm border border-indigo-100">
          <PlayCircle size={24} />
        </div>
        <h1 className="text-2xl font-black text-gray-800 tracking-tight leading-snug">
          Galeri <span className="text-indigo-500">Video</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1.5 font-medium leading-relaxed max-w-[280px]">
          Panduan visual untuk terapi laktasi dan relaksasi khusus untuk Bunda.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {["semua", "relaksasi", "terapi"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "px-5 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all shadow-sm border",
              activeTab === tab
                ? "bg-indigo-500 text-white border-indigo-500"
                : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin mb-4"></div>
          <p className="text-xs font-bold text-gray-400">Memuat Video...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 rounded-3xl p-6 border border-rose-100 text-center">
          <AlertCircle size={32} className="mx-auto text-rose-400 mb-2" />
          <p className="text-xs font-bold text-rose-600">{error}</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center shadow-sm">
          <PlayCircle size={32} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-sm font-bold text-gray-700">Belum ada video</h3>
          <p className="text-xs text-gray-400 mt-1">Kategori ini masih kosong.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {videos.map((video) => (
            <Link 
              key={video._id} 
              href={`/video/${video._id}`}
              className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all duration-300 group"
            >
              {/* Thumbnail Area */}
              <div className="relative w-full aspect-video bg-gray-900 overflow-hidden">
                <Image 
                  src={video.thumbnail_url} 
                  alt={video.title} 
                  fill 
                  className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 group-hover:bg-indigo-500/90 group-hover:border-indigo-500 transition-all duration-300">
                    <Play size={24} className="text-white ml-1" fill="currentColor" />
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider">
                  {video.kategori}
                </div>
              </div>

              {/* Info Area */}
              <div className="p-5">
                <h2 className="text-sm font-extrabold text-gray-800 leading-snug line-clamp-2 group-hover:text-indigo-500 transition-colors">
                  {video.title}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
