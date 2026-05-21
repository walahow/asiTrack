import Image from "next/image";
import { BookOpen } from "lucide-react";

export default function PojokBacaPage() {
  return (
    <div className="flex flex-col flex-1 pb-32 pt-10 px-6 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight mb-2">Pojok Baca</h1>
        <p className="text-gray-500 font-medium">Temukan panduan & tips menyusui</p>
      </header>

      <main className="space-y-6 flex-1">
        {/* Featured Article */}
        <div className="group block relative h-64 w-full rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] cursor-pointer">
          <Image 
            src="/article-bg.png" 
            alt="Pojok Baca Featured" 
            fill 
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-full mb-3">
              <BookOpen size={14} />
              Featured
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-primary-light transition-colors">
              Pentingnya Kolostrum pada Hari-hari Pertama Bayi
            </h2>
            <p className="text-gray-300 text-sm line-clamp-2">Ketahui apa itu kolostrum, cairan emas pertama yang diproduksi oleh payudara Anda.</p>
          </div>
        </div>

        {/* Article List Placeholder */}
        <div className="pt-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Terbaru</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-[2rem] p-4 flex gap-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-24 h-24 rounded-2xl bg-primary-light/30 shrink-0"></div>
                <div className="flex flex-col justify-center">
                  <span className="text-xs font-bold text-primary mb-1">Panduan Dasar</span>
                  <h4 className="font-bold text-gray-800 leading-tight mb-2">Posisi Menyusui yang Benar agar Tidak Nyeri</h4>
                  <p className="text-xs text-gray-500">2 hari yang lalu • 5 min baca</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
