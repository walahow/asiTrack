"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { ArrowLeft, Sparkles, User, Key, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show success message if redirected from signup page
    if (searchParams.get("registered") === "true") {
      setSuccess("Pendaftaran berhasil! Silakan masuk dengan akun Anda.");
    }
    // Show session expired or auth error message
    if (searchParams.get("error") === "CredentialsSignin") {
      setError("Username atau password salah. Silakan periksa kembali.");
    }
  }, [searchParams]);

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

    if (!formData.username || !formData.password) {
      setError("Username dan password wajib diisi.");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("user-credentials", {
        username: formData.username.trim(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Username atau password salah. Silakan coba lagi.");
        setLoading(false);
      } else {
        setSuccess("Berhasil masuk! Mengalihkan ke dashboard...");
        router.refresh();
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (err: any) {
      setError("Terjadi kesalahan sistem, silakan coba lagi nanti.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/50 relative overflow-hidden z-10">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold border border-rose-100">
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
              placeholder="Username Anda"
              value={formData.username}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-400 placeholder:font-normal"
            />
          </div>
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

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3.5 rounded-xl text-sm font-bold shadow-[0_5px_15px_rgba(167,139,250,0.25)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 transition-all text-center block"
        >
          {loading ? "Menghubungkan Sesi..." : "Masuk ke Aplikasi"}
        </button>

      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-primary to-purple-900 flex flex-col justify-between relative overflow-hidden">
      {/* Background decorative shapes */}
      <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[40%] bg-purple-400/30 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[50%] bg-indigo-400/20 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-500/20 rounded-full blur-[120px] -z-10"></div>
      
      {/* Main Container */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center px-6 py-8 z-10">
        
        {/* Back Link */}
        <div className="mb-6 z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke Landing
          </Link>
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8 z-10">
          <div className="relative w-20 h-20 rounded-2xl bg-white border border-white/20 shadow-xl overflow-hidden p-1">
            <div className="relative w-full h-full rounded-[1rem] overflow-hidden">
              <Image
                src="/logo.png"
                alt="hypnomom Logo"
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight mt-4 drop-shadow-md">Selamat Datang</h2>
          <p className="text-white/80 text-sm font-medium mt-1.5">Gunakan akun terdaftar Bunda untuk masuk</p>
        </div>

        {/* Suspense Wrapped Form */}
        <Suspense fallback={
          <div className="bg-white rounded-[2rem] p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-gray-100 text-center text-sm text-gray-500">
            Memuat Formulir...
          </div>
        }>
          <LoginForm />
        </Suspense>

        {/* Bottom signup Link */}
        <div className="text-center mt-6 z-10">
          <p className="text-xs text-white/70 font-medium">
            Belum terdaftar?{" "}
            <Link href="/auth/signup" className="text-white font-bold hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
