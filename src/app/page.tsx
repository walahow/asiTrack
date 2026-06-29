import Link from "next/link";
import Image from "next/image";
import { Sparkles, Heart, Activity, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-primary to-purple-900 flex flex-col justify-between relative overflow-hidden">
      {/* Background decorative shapes */}
      <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[40%] bg-purple-400/30 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[50%] bg-indigo-400/20 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-500/20 rounded-full blur-[120px] -z-10"></div>

      {/* Main Centered Mobile Shell */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between px-6 pt-12 pb-8 z-10">
        
        {/* Top Header & Logo */}
        <div className="flex flex-col items-center text-center mt-4">
          <div className="relative w-24 h-24 rounded-[2rem] bg-white border border-white/20 shadow-2xl overflow-hidden p-1">
            <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden">
              <Image
                src="/logo.png"
                alt="hypnomom Logo"
                fill
                sizes="96px"
                className="object-cover"
                priority
              />
            </div>
          </div>
          <h1 className="font-extrabold text-4xl tracking-tight text-white font-sans mt-5 drop-shadow-md">
            hypnomom
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold rounded-full mt-3 shadow-sm">
            <Sparkles size={14} className="text-yellow-300" />
            Pendamping Laktasi Bunda (Hari 1-7)
          </div>
        </div>

        {/* Hero Section / Illustration Card */}
        <div className="my-8 bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/50 relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
          
          <h2 className="text-2xl font-black text-gray-800 tracking-tight leading-snug mb-3">
            Kawal Awal Berharga <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-lg inline-block mt-1">Laktasi Si Kecil</span>
          </h2>
          
          <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
            Monitor perkembangan ASI, dapatkan panduan tepercaya, dan cegah keterlambatan laktogenesis selama 7 hari pertama pasca melahirkan.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5 shrink-0">
                <Heart size={16} className="fill-primary/20" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">Pelacakan Laktasi Harian</h4>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Pantau produksi kolostrum dengan input cerdas</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-100/50 flex items-center justify-center text-rose-500 mt-0.5 shrink-0">
                <Activity size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">Pojok Baca & Edukasi</h4>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Artikel & terapi pijat relaksasi tersertifikasi</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mt-0.5 shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">Notifikasi Pengingat Rutin</h4>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Pengingat 2x sehari agar Bunda tidak melewatkan catatan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/auth/signup"
            className="w-full flex items-center justify-center bg-white text-primary py-4 rounded-2xl font-black text-[15px] shadow-[0_8px_30px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-center"
          >
            Daftar Akun Baru
          </Link>
          
          <Link
            href="/auth/login"
            className="w-full flex items-center justify-center bg-primary/40 backdrop-blur-md text-white border border-white/20 py-4 rounded-2xl font-bold text-[15px] hover:bg-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-center"
          >
            Masuk Aplikasi
          </Link>

          {/* Admin Login Link */}
          <Link
            href="/admin/login"
            className="text-[11px] font-semibold text-white/60 hover:text-white transition-colors text-center mt-3 cursor-pointer"
          >
            Masuk sebagai Tenaga Kesehatan / Admin
          </Link>
        </div>

      </div>
    </div>
  );
}
