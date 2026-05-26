"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, AlertCircle, Calendar } from "lucide-react";
import { useParams } from "next/navigation";

interface ArticleDetail {
  _id: string;
  title: string;
  content: string;
  cover_image_url?: string;
  kategori?: string;
  createdAt: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`/api/articles/${id}`);
        const data = await res.json();
        if (res.ok && data.status === "success") {
          setArticle(data.data);
        } else {
          throw new Error(data.message || "Artikel tidak ditemukan.");
        }
      } catch (err: any) {
        setError(err.message || "Koneksi terputus.");
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6 min-h-screen">
        <div className="relative w-16 h-16 animate-pulse mb-4">
          <BookOpen size={64} className="text-primary/50" />
        </div>
        <p className="text-sm font-bold text-gray-400">Memuat Artikel...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8 text-center min-h-screen">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-800">Artikel Tidak Ditemukan</h3>
        <p className="text-xs text-gray-500 mt-2">{error}</p>
        <Link href="/pojok-baca" className="mt-6 px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md">
          Kembali ke Pojok Baca
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 pb-24 pt-10 px-6 overflow-y-auto bg-white">
      {/* Back Button */}
      <Link
        href="/pojok-baca"
        className="inline-flex items-center justify-center w-10 h-10 bg-gray-50 text-gray-500 rounded-full mb-6 hover:bg-primary/10 hover:text-primary transition-colors border border-gray-100"
      >
        <ArrowLeft size={18} />
      </Link>

      {/* Header Info */}
      <div className="mb-6">
        {article.kategori && (
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black tracking-wider uppercase mb-3">
            {article.kategori}
          </span>
        )}
        <h1 className="text-2xl font-black text-gray-900 leading-tight mb-4">
          {article.title}
        </h1>
        <div className="flex items-center text-xs text-gray-400 font-medium">
          <Calendar size={14} className="mr-1.5" />
          {new Date(article.createdAt).toLocaleDateString("id-ID", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Cover Image */}
      {article.cover_image_url && (
        <div className="relative w-full h-56 md:h-64 rounded-3xl overflow-hidden mb-8 shadow-sm">
          <Image 
            src={article.cover_image_url} 
            alt={article.title} 
            fill 
            className="object-cover" 
            priority
          />
        </div>
      )}

      {/* Rich Text Content */}
      {/* We use explicit Tailwind arbitrary variants to ensure spacing between paragraphs and proper heading sizes since Tailwind resets all margins by default. */}
      <div 
        className="article-content max-w-none text-sm text-gray-600
                   [&_p]:mb-4 [&_p]:leading-relaxed [&_p:last-child]:mb-0
                   [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-gray-900 [&_h1]:mb-4 [&_h1]:mt-6
                   [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-800 [&_h2]:mb-3 [&_h2]:mt-5
                   [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-gray-800 [&_h3]:mb-2 [&_h3]:mt-4
                   [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul_li]:mb-1
                   [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol_li]:mb-1
                   [&_strong]:font-extrabold [&_strong]:text-gray-800
                   [&_a]:text-primary [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </div>
  );
}
