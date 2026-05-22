import Image from "next/image";
import { Check, X, Sparkles, PartyPopper, CheckCircle2, CircleDashed } from "lucide-react";

export default function Home() {
  const currentDay = 3;

  // Mock timeline data
  const timeline = Array.from({ length: 7 }, (_, i) => {
    const dayNum = i + 1;
    let status = "future"; // future, current, past_success, past_empty
    
    if (dayNum < currentDay) status = "past_success";
    if (dayNum === currentDay) status = "current";

    return { dayNum, status };
  });

  return (
    <div className="flex flex-col flex-1 pb-16 pt-10 px-6 overflow-y-auto">
      {/* App Brand Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative w-12 h-12 rounded-[1.25rem] overflow-hidden bg-primary/5 p-2.5 border border-primary/10 flex items-center justify-center shadow-sm">
          <Image
            src="/logo.png"
            alt="asiTrack Logo"
            fill
            sizes="64px"
            className="object-contain"
            priority
          />
        </div>
        <span className="font-bold text-2xl tracking-tight text-primary font-sans">
          asiTrack
        </span>
      </div>

      {/* Greeting Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight leading-tight">
          Halo,<br />
          <span className="text-primary">Bunda Budi!</span>
        </h1>
        <p className="text-gray-500 mt-2 font-medium">Fase Perawatan Laktasi 🌸</p>
      </div>

      <main className="space-y-8 flex flex-col">
        {/* Modern Questionnaire Card */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-700"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-rose-100/30 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-5">
              <Sparkles size={16} />
              Cek Harian: Hari ke-{currentDay}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 leading-snug mb-8">
              Apakah ASI sudah mulai <span className="text-primary">diproduksi</span> hari ini?
            </h2>
            
            <div className="flex flex-col gap-3">
              <button className="w-full flex items-center justify-between bg-primary text-white py-4 px-6 rounded-2xl font-semibold shadow-[0_8px_20px_rgba(167,139,250,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                <span className="text-lg">Ya, Sudah</span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Check size={18} />
                </div>
              </button>
              <button className="w-full flex items-center justify-between bg-gray-50 text-gray-600 border border-gray-100 py-4 px-6 rounded-2xl font-semibold hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                <span className="text-lg">Belum Keluar</span>
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                  <X size={18} />
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* 7-Day Checkpoint Tracker */}
        <section>
          <div className="mb-5">
            <h3 className="text-xl font-bold text-gray-800">Perjalanan Laktasi 7 Hari</h3>
            <p className="text-sm text-gray-500">Pantau progres produksi kolostrum Anda</p>
          </div>
          
          <div className="bg-white rounded-[2rem] p-4 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-50">
            <div className="flex items-center justify-between w-full relative px-2">
              {/* Background Line */}
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-gray-100 rounded-full -z-10"></div>
              
              {/* Progress Line */}
              <div 
                className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full -z-10 transition-all duration-1000"
                style={{ width: `calc(${((currentDay - 1) / 6) * 100}% - 8px)` }}
              ></div>

              {timeline.map((item) => (
                <div key={item.dayNum} className="flex flex-col items-center relative z-10">
                  {/* Icon Node */}
                  <div className="mb-2 relative flex items-center justify-center">
                    {item.status === "past_success" && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
                        <CheckCircle2 size={16} />
                      </div>
                    )}
                    
                    {item.status === "current" && (
                      <div className="w-11 h-11 -mt-1.5 rounded-full bg-amber-400 flex items-center justify-center text-white shadow-lg shadow-amber-400/30 animate-bounce relative z-10">
                        <PartyPopper size={20} />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-100 border border-amber-400"></span>
                        </span>
                      </div>
                    )}

                    {item.status === "future" && (
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-300">
                        <CircleDashed size={16} />
                      </div>
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className={`text-[10px] font-bold ${item.status === "current" ? "text-amber-500" : item.status === "past_success" ? "text-primary" : "text-gray-400"}`}>
                    H{item.dayNum}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
