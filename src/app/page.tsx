import Link from "next/link";
import Image from "next/image";
import { Sparkles, Heart, Activity, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between relative overflow-hidden">
      {/* Background soft blurs */}
      <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[40%] bg-primary/10 rounded-full blur-[80px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[40%] bg-rose-100/40 rounded-full blur-[80px] -z-10"></div>

      {/* Main Centered Mobile Shell */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between px-6 pt-12 pb-8">
        
        {/* Top Header & Logo */}
        <div className="flex flex-col items-center text-center mt-4">
          <div className="relative w-20 h-20 rounded-[2rem] overflow-hidden bg-white p-4 border border-primary/10 flex items-center justify-center shadow-md">
            <Image
              src="/logo.png"
              alt="asiTrack Logo"
              fill
              sizes="80px"
              className="object-contain p-2"
              priority
            />
          </div>
          <h1 className="font-extrabold text-3xl tracking-tight text-primary font-sans mt-4">
            asiTrack
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mt-2">
            <Sparkles size={12} />
            Pendamping Laktasi Bunda (Hari 1-7)
          </div>
        </div>

        {/* Hero Section / Illustration Card */}
        <div className="my-8 bg-white rounded-[2.5rem] p-8 shadow-[0_15px_45px_rgba(0,0,0,0.03)] border border-gray-100 relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-xl"></div>
          
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight leading-snug mb-3">
            Kawal Awal Berharga <span className="text-primary">Laktasi Si Kecil</span>
          </h2>
          
          <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
            Monitor perkembangan ASI, dapatkan panduan tepercaya, dan cegah keterlambatan laktogenesis selama 7 hari pertama pasca melahirkan.
          </p>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5">
                <Heart size={14} className="fill-primary/20" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-700">Pelacakan Laktasi Harian</h4>
                <p className="text-[11px] text-gray-400">Pantau produksi kolostrum dengan input harian cerdas</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-rose-100/50 flex items-center justify-center text-rose-500 mt-0.5">
                <Activity size={14} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-700">Pojok Baca & Edukasi Video</h4>
                <p className="text-[11px] text-gray-400">Artikel & terapi pijat relaksasi tersertifikasi untuk Bunda</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mt-0.5">
                <ShieldCheck size={14} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-700">Notifikasi Pengingat Rutin</h4>
                <p className="text-[11px] text-gray-400">Pengingat 3x sehari agar Bunda tidak melewatkan catatan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/auth/signup"
            className="w-full flex items-center justify-center bg-primary text-white py-4 rounded-2xl font-bold shadow-[0_8px_25px_rgba(167,139,250,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-center"
          >
            Daftar Akun Baru
          </Link>
          
          <Link
            href="/auth/login"
            className="w-full flex items-center justify-center bg-white text-gray-700 border border-gray-200 py-4 rounded-2xl font-bold hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-center"
          >
            Masuk Aplikasi
          </Link>

          {/* Admin Login Link */}
          <Link
            href="/admin/login"
            className="text-xs font-bold text-gray-400 hover:text-primary transition-colors text-center mt-3 cursor-pointer"
          >
            Masuk sebagai Tenaga Kesehatan / Admin
          </Link>
        </div>

      </div>
    </div>
  );
}
