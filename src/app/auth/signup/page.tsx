"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles, User, Key, Calendar, Smile, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    username: "",
    password: "",
    tgl_melahirkan: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "username" ? value.toLowerCase().replace(/\s+/g, "") : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Basic Validation
    if (!formData.nama_lengkap || !formData.username || !formData.password || !formData.tgl_melahirkan) {
      setError("Semua kolom wajib diisi.");
      setLoading(false);
      return;
    }

    if (!/^[a-z0-9_]+$/.test(formData.username)) {
      setError("Username hanya boleh berisi huruf kecil, angka, dan underscore.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Pendaftaran gagal.");
      }

      setSuccess("Akun berhasil dibuat! Mengalihkan ke halaman masuk...");
      setTimeout(() => {
        router.push("/auth/login?registered=true");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between relative overflow-hidden">
      {/* Background blurs */}
      <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[30%] bg-primary/10 rounded-full blur-[80px] -z-10"></div>
      
      {/* Main Container */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center px-6 py-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali
          </Link>
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative w-16 h-16 rounded-2xl bg-white border border-primary/10 shadow-sm overflow-hidden">
            <Image
              src="/logo.png"
              alt="hypemom Logo"
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight mt-3">Daftar Akun Bunda</h2>
          <p className="text-gray-500 text-xs font-medium mt-1">Lacak laktasi Bunda selama 7 hari pertama pasca kelahiran</p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-gray-100 relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error & Success Badges */}
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold border border-rose-100 animate-shake">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold border border-emerald-100">
                <Sparkles size={16} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Nama Lengkap */}
            <div className="space-y-1.5">
              <label htmlFor="nama_lengkap" className="text-xs font-bold text-gray-700 block">
                Nama Lengkap Bunda
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Smile size={18} />
                </div>
                <input
                  type="text"
                  name="nama_lengkap"
                  id="nama_lengkap"
                  required
                  placeholder="Contoh: Bunda Budi"
                  value={formData.nama_lengkap}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-400 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-xs font-bold text-gray-700 block">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="username"
                  id="username"
                  required
                  placeholder="Contoh: bundabudi"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-400 placeholder:font-normal"
                />
              </div>
              <span className="text-[10px] text-gray-400 leading-normal block">
                Hanya huruf kecil, angka, dan underscore. Tanpa spasi.
              </span>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold text-gray-700 block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Key size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-400 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Tanggal Melahirkan */}
            <div className="space-y-1.5">
              <label htmlFor="tgl_melahirkan" className="text-xs font-bold text-gray-700 block">
                Tanggal Melahirkan
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Calendar size={18} />
                </div>
                <input
                  type="date"
                  name="tgl_melahirkan"
                  id="tgl_melahirkan"
                  required
                  value={formData.tgl_melahirkan}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>
              <span className="text-[10px] text-amber-500 font-medium leading-normal block">
                Penting untuk penghitungan otomatis hari pelacakan laktasi (Hari ke-1 s/d Hari ke-7).
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3.5 rounded-xl text-sm font-bold shadow-[0_5px_15px_rgba(167,139,250,0.25)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 transition-all text-center block"
            >
              {loading ? "Mendaftarkan Akun..." : "Daftar Akun"}
            </button>

          </form>
        </div>

        {/* Bottom Login Link */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500 font-medium">
            Sudah memiliki akun?{" "}
            <Link href="/auth/login" className="text-primary font-bold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
