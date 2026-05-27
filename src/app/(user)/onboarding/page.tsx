"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Sparkles, Calendar, BookOpen, MapPin, Briefcase, Bell, Smile, AlertCircle, User, AtSign, Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { requestPushPermission } from "@/lib/firebase/client";
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";

export default function OnboardingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    username: "",
    tgl_melahirkan: "",
    usia: "",
    anak_ke_berapa: "",
    alamat: "",
    pendidikan: "",
    pekerjaan: "",
    notif_enabled: false,
    fcm_token: null as string | null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialFetch, setInitialFetch] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        
        if (res.status === 401 || res.status === 404) {
          console.warn("User deleted or unauthorized in onboarding. Auto-signing out...");
          signOut({ callbackUrl: "/auth/login" });
          return;
        }

        const data = await res.json();
        if (res.ok && data.status === "success" && data.user) {
          let tglStr = "";
          if (data.user.tgl_melahirkan) {
            const d = new Date(data.user.tgl_melahirkan);
            const wibDate = toZonedTime(d, "Asia/Jakarta");
            tglStr = format(wibDate, "yyyy-MM-dd");
          }
          let localDeviceEnabled = !!data.user.notif_enabled;
          
          // In a multi-device setup, the switch should show OFF if THIS specific device hasn't granted permission yet
          if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission !== "granted") {
              localDeviceEnabled = false;
            }
          }

          setFormData((prev) => ({
            ...prev,
            nama_lengkap: data.user.nama_lengkap || "",
            username: data.user.username || "",
            tgl_melahirkan: tglStr,
            usia: data.user.usia || "",
            anak_ke_berapa: data.user.anak_ke_berapa || "",
            alamat: data.user.alamat || "",
            pendidikan: data.user.pendidikan || "",
            pekerjaan: data.user.pekerjaan || "",
            notif_enabled: localDeviceEnabled,
            fcm_token: localDeviceEnabled ? data.user.fcm_token : null,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch initial profile", err);
      } finally {
        setInitialFetch(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggle = async () => {
    // If the browser strictly denies notifications, we cannot even ask
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "denied") {
        setError("Bunda telah memblokir notifikasi di browser. Mohon izinkan notifikasi melalui pengaturan browser.");
        setFormData((prev) => ({ ...prev, notif_enabled: false, fcm_token: null }));
        return;
      }
    }

    if (!formData.notif_enabled) {
      // Trying to enable
      try {
        const token = await requestPushPermission();
        if (token) {
          setFormData((prev) => ({
            ...prev,
            notif_enabled: true,
            fcm_token: token,
          }));
        } else {
          setError("Gagal mengaktifkan notifikasi. Pastikan Anda mengizinkan notifikasi di browser.");
          setFormData((prev) => ({ ...prev, notif_enabled: false, fcm_token: null }));
        }
      } catch (err) {
        console.error(err);
        setError("Terjadi kesalahan saat mengaktifkan notifikasi.");
        setFormData((prev) => ({ ...prev, notif_enabled: false, fcm_token: null }));
      }
    } else {
      // Disabling
      setFormData((prev) => ({
        ...prev,
        notif_enabled: false,
        fcm_token: null,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan profil.");
      }

      setSuccess("Profil berhasil dikonfigurasi! Selamat datang di dashboard laktasi Bunda.");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Gagal menghubungkan profil. Silakan coba kembali.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-10 pt-10 px-6 overflow-y-auto">
      {/* App Brand Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-primary/5 p-2 border border-primary/10 flex items-center justify-center shadow-sm">
          <Image
            src="/logo.png"
            alt="asiTrack Logo"
            fill
            sizes="40px"
            className="object-contain p-1"
            priority
          />
        </div>
        <span className="font-bold text-lg tracking-tight text-primary font-sans">
          asiTrack Onboarding
        </span>
      </div>

      {/* Greeting & Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight leading-snug">
          Lengkapi Profil Laktasi <span className="text-primary">Bunda!</span>
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-1">
          Dapatkan panduan laktasi terbaik yang disesuaikan dengan kondisi profil harian Bunda.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-[2rem] p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-gray-100 relative overflow-hidden">
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

          {/* Core Fields */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="nama_lengkap" className="text-[11px] font-bold text-gray-700 block">
                Nama Lengkap *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  name="nama_lengkap"
                  id="nama_lengkap"
                  required
                  placeholder="Nama Lengkap Bunda"
                  value={formData.nama_lengkap}
                  onChange={handleChange}
                  className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="username" className="text-[11px] font-bold text-gray-700 block">
                Username *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <AtSign size={16} />
                </div>
                <input
                  type="text"
                  name="username"
                  id="username"
                  required
                  placeholder="username_bunda"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                  className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-1 pb-2">
              <label htmlFor="tgl_melahirkan" className="text-[11px] font-bold text-gray-700 block">
                Tanggal Melahirkan *
              </label>
              <input
                type="date"
                name="tgl_melahirkan"
                id="tgl_melahirkan"
                required
                value={formData.tgl_melahirkan}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <hr className="border-gray-50" />

          {/* Usia & Anak Ke-berapa (Grid Row) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="usia" className="text-[11px] font-bold text-gray-700 block">
                Usia Bunda (Tahun)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Smile size={16} />
                </div>
                <input
                  type="number"
                  name="usia"
                  id="usia"
                  min="1"
                  placeholder="27"
                  value={formData.usia}
                  onChange={handleChange}
                  className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="anak_ke_berapa" className="text-[11px] font-bold text-gray-700 block">
                Anak Ke-berapa
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Calendar size={16} />
                </div>
                <input
                  type="number"
                  name="anak_ke_berapa"
                  id="anak_ke_berapa"
                  min="1"
                  placeholder="1"
                  value={formData.anak_ke_berapa}
                  onChange={handleChange}
                  className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Pendidikan */}
          <div className="space-y-1">
            <label htmlFor="pendidikan" className="text-[11px] font-bold text-gray-700 block">
              Pendidikan Terakhir
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <BookOpen size={16} />
              </div>
              <select
                name="pendidikan"
                id="pendidikan"
                value={formData.pendidikan}
                onChange={handleChange}
                className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-primary focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="">Pilih Pendidikan</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
                <option value="D3">Diploma (D3)</option>
                <option value="S1">Sarjana (S1)</option>
                <option value="S2">Magister (S2)</option>
                <option value="S3">Doktor (S3)</option>
              </select>
            </div>
          </div>

          {/* Pekerjaan */}
          <div className="space-y-1">
            <label htmlFor="pekerjaan" className="text-[11px] font-bold text-gray-700 block">
              Pekerjaan Bunda
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Briefcase size={16} />
              </div>
              <input
                type="text"
                name="pekerjaan"
                id="pekerjaan"
                placeholder="Contoh: Ibu Rumah Tangga, Guru, PNS"
                value={formData.pekerjaan}
                onChange={handleChange}
                className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Alamat */}
          <div className="space-y-1">
            <label htmlFor="alamat" className="text-[11px] font-bold text-gray-700 block">
              Alamat Tinggal
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 pt-2.5 pointer-events-none text-gray-400">
                <MapPin size={16} />
              </div>
              <textarea
                name="alamat"
                id="alamat"
                rows={2}
                placeholder="Alamat lengkap Bunda..."
                value={formData.alamat}
                onChange={handleChange}
                className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-400 resize-none"
              ></textarea>
            </div>
          </div>

          {/* Notifications Simulator Switch */}
          <div className="bg-primary/5 rounded-[1.5rem] p-4 border border-primary/10 flex items-center justify-between gap-4 mt-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary mt-0.5 shadow-sm border border-primary/5 shrink-0">
                <Bell size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-700 leading-tight">Pengingat Laktasi Harian</h4>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">
                  Aktifkan in-app pengingat jadwal ASI 2x sehari agar tetap terpantau.
                </p>
              </div>
            </div>
            
            {/* Custom iOS-like toggle */}
            <button
              type="button"
              onClick={handleToggle}
              className={`shrink-0 w-11 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${
                formData.notif_enabled ? "bg-primary" : "bg-gray-200"
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                  formData.notif_enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl text-xs font-bold shadow-[0_5px_15px_rgba(167,139,250,0.2)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 transition-all text-center block mt-6"
          >
            {loading ? "Menyimpan Konfigurasi..." : "Selesai & Masuk Beranda"}
          </button>

        </form>
      </div>
    </div>
  );
}
