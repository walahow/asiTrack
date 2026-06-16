"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { ArrowLeft, Key, User, ShieldCheck, AlertCircle } from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.toLowerCase().replace(/\s+/g, ""),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.username || !formData.password) {
      setError("Username dan password wajib diisi.");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("admin-credentials", {
        username: formData.username.trim(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Kredensial admin tidak valid. Akses ditolak.");
        setLoading(false);
      } else {
        router.refresh();
        setTimeout(() => {
          router.push("/admin");
        }, 1000);
      }
    } catch (err: any) {
      setError("Terjadi kesalahan sistem, silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold border border-rose-100">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Username */}
        <div className="space-y-1.5">
          <label htmlFor="username" className="text-xs font-bold text-gray-700 block">
            Username Admin
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
              placeholder="admin"
              value={formData.username}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-bold text-gray-700 block">
            Password Kunci
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
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3.5 rounded-xl text-sm font-bold shadow-[0_5px_15px_rgba(167,139,250,0.25)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 transition-all text-center block"
        >
          {loading ? "Memvalidasi Otoritas..." : "Masuk ke Portal"}
        </button>

      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between relative overflow-hidden">
      {/* Background soft blurs */}
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
            Kembali ke Landing
          </Link>
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white p-3 border border-primary/10 flex items-center justify-center shadow-sm">
            <Image
              src="/logo.png"
              alt="hypemom Logo"
              fill
              sizes="64px"
              className="object-contain p-1.5"
            />
          </div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight mt-3">Portal Administratif</h2>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full mt-1.5 border border-amber-100">
            <ShieldCheck size={12} />
            Hanya Tenaga Medis / Admin
          </div>
        </div>

        {/* Login Form wrapped in Suspense */}
        <Suspense fallback={
          <div className="bg-white rounded-[2rem] p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-gray-100 text-center text-sm text-gray-500">
            Memuat Formulir...
          </div>
        }>
          <AdminLoginForm />
        </Suspense>

        {/* Bottom space */}
        <div className="text-center mt-8">
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block">
            hypemom Health Tech Foundation
          </span>
        </div>

      </div>
    </div>
  );
}
