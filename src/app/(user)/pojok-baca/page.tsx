"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, AlertCircle, ChevronRight } from "lucide-react";

interface ArticleSummary {
  _id: string;
  title: string;
  excerpt: string;
  cover_image_url?: string;
  kategori?: string;
  createdAt: string;
}

export default function PojokBacaList() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch("/api/articles");
        const data = await res.json();
        if (res.ok && data.status === "success") {
          setArticles(data.data);
        } else {
          throw new Error(data.message || "Gagal memuat artikel.");
        }
      } catch (err: any) {
        setError(err.message || "Koneksi terputus.");
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6 min-h-screen">
        <div className="relative w-16 h-16 animate-pulse mb-4">
          <BookOpen size={64} className="text-primary/50" />
        </div>
        <p className="text-sm font-bold text-gray-400">Memuat Pojok Baca...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8 text-center min-h-screen">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-800">Gagal Memuat</h3>
        <p className="text-xs text-gray-500 mt-2">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 pb-24 pt-10 px-6 overflow-y-auto">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-4 shadow-sm border border-primary/20">
          <BookOpen size={24} />
        </div>
        <h1 className="text-2xl font-black text-gray-800 tracking-tight leading-snug">
          Pojok <span className="text-primary">Baca Bunda</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1.5 font-medium leading-relaxed max-w-[280px]">
          Kumpulan informasi edukasi terpercaya untuk mendukung perjalanan laktasi Bunda dan si kecil.
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center shadow-sm">
          <BookOpen size={32} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-sm font-bold text-gray-700">Belum ada artikel</h3>
          <p className="text-xs text-gray-400 mt-1">Artikel laktasi akan segera hadir di sini.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {articles.map((article) => (
            <Link 
              key={article._id} 
              href={`/pojok-baca/${article._id}`}
              className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col"
            >
              {/* Cover Image */}
              <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                {article.cover_image_url ? (
                  <Image 
                    src={article.cover_image_url} 
                    alt={article.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                    <BookOpen size={48} />
                  </div>
                )}
                
                {/* Category Badge overlay */}
                {article.kategori && (
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-primary shadow-sm border border-white/50">
                    {article.kategori}
                  </div>
                )}
              </div>

              {/* Content Box */}
              <div className="p-6">
                <h2 className="text-base font-extrabold text-gray-800 leading-snug mb-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h2>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {new Date(article.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-primary/5 group-hover:bg-primary text-primary group-hover:text-white flex items-center justify-center transition-colors">
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
