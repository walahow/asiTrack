import Image from "next/image";
import { PlayCircle } from "lucide-react";

export default function VideoPage() {
  return (
    <div className="flex flex-col flex-1 pb-32 pt-10 px-6 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight mb-2">Video Edukasi</h1>
        <p className="text-gray-500 font-medium">Relaksasi & Panduan Visual</p>
      </header>

      <main className="space-y-6 flex-1">
        {/* Featured Video */}
        <div className="group block relative h-64 w-full rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] cursor-pointer">
          <Image 
            src="/video-bg.png" 
            alt="Video Edukasi Featured" 
            fill 
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent"></div>
          
          <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white">
              <PlayCircle size={32} />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/80 backdrop-blur-md text-white text-xs font-semibold rounded-full mb-3">
              Terapi
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-amber-300 transition-colors">
              Pijat Oksitosin untuk Melancarkan ASI
            </h2>
            <p className="text-gray-300 text-sm line-clamp-1">Panduan praktis pijat punggung laktasi.</p>
          </div>
        </div>

        {/* Video List Placeholder */}
        <div className="pt-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Daftar Putar</h3>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex flex-col gap-2 cursor-pointer group">
                <div className="relative h-32 rounded-[1.5rem] bg-gray-200 overflow-hidden shadow-sm">
                  <div className="absolute inset-0 bg-gray-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle size={24} className="text-white/80 group-hover:text-white transition-colors" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm leading-tight group-hover:text-primary transition-colors">Teknik Relaksasi Nafas</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Relaksasi • 12 Menit</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
