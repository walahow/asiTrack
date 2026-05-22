"use client";

import { useState } from "react";
import { User as UserIcon, Bell, Settings, LogOut, ChevronRight, Edit3, X, Check, Calendar, Mail, BookOpen, Briefcase, MapPin, Award } from "lucide-react";

interface UserProfile {
  nama_lengkap: string;
  username: string;
  tgl_melahirkan: string;
  usia?: number;
  anak_ke_berapa?: number;
  alamat?: string;
  pendidikan?: 'SD' | 'SMP' | 'SMA' | 'D3' | 'S1' | 'S2' | 'S3';
  pekerjaan?: string;
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Initial mock state matching the exact model schema
  const [profile, setProfile] = useState<UserProfile>({
    nama_lengkap: "Bunda Budi Rahayu",
    username: "bundabudi",
    tgl_melahirkan: "2026-05-19", // yyyy-MM-dd
    usia: 28,
    anak_ke_berapa: 2,
    alamat: "Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan",
    pendidikan: "S1",
    pekerjaan: "Ibu Rumah Tangga"
  });

  // Temporary form state
  const [tempProfile, setTempProfile] = useState<UserProfile>({ ...profile });

  // Safe formatting helper for dates (Indonesian month names)
  const formatTglMelahirkan = (dateStr: string) => {
    try {
      const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  // Safe laktasi day index calculation based on tgl_melahirkan in WIB
  const calculateHariKe = (tglStr: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const birth = new Date(tglStr);
      birth.setHours(0, 0, 0, 0);
      
      const diffTime = today.getTime() - birth.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 1) return "Belum Melahirkan (Masa Persiapan)";
      if (diffDays > 7) return "Selesai Pelacakan (Hari 7+)";
      return `Hari ke-${diffDays} Menyusui`;
    } catch {
      return "Hari ke-3 Menyusui";
    }
  };

  const handleEditClick = () => {
    setTempProfile({ ...profile });
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempProfile.nama_lengkap.trim() || !tempProfile.username.trim() || !tempProfile.tgl_melahirkan) {
      alert("Nama Lengkap, Username, dan Tanggal Melahirkan harus diisi.");
      return;
    }
    
    // Save state
    setProfile({ ...tempProfile });
    setIsEditing(false);
    
    // Show beautiful custom success toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="flex flex-col flex-1 pb-32 pt-10 px-6 overflow-y-auto bg-[#FAF8F5]">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 font-semibold text-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <Check size={18} />
          Profil berhasil diperbarui!
        </div>
      )}

      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight mb-2">Profil Bunda</h1>
          <p className="text-gray-500 font-medium">Kelola data & preferensi laktasi</p>
        </div>
      </header>

      <main className="space-y-6 flex-1">
        
        {/* Profile Avatar Card */}
        <section className="bg-white rounded-[2.5rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full opacity-65 pointer-events-none"></div>
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary shrink-0 relative">
              <UserIcon size={36} />
              <button 
                onClick={handleEditClick}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <Edit3 size={14} />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{profile.nama_lengkap}</h2>
              <div className="inline-flex items-center mt-2 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                {calculateHariKe(profile.tgl_melahirkan)}
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Profile Information */}
        <section className="bg-white rounded-[2.5rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-50 space-y-4">
          <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">Detail Informasi Diri</h3>
          
          <div className="grid grid-cols-1 gap-4 text-sm">
            <div className="flex items-center justify-between py-1 border-b border-gray-50/50">
              <span className="text-gray-400 font-medium flex items-center gap-2">
                <UserIcon size={16} className="text-primary/70" /> Username
              </span>
              <span className="font-bold text-gray-700">@{profile.username}</span>
            </div>
            
            <div className="flex items-center justify-between py-1 border-b border-gray-50/50">
              <span className="text-gray-400 font-medium flex items-center gap-2">
                <Calendar size={16} className="text-primary/70" /> Tanggal Melahirkan
              </span>
              <span className="font-bold text-gray-700">{formatTglMelahirkan(profile.tgl_melahirkan)}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50/50">
              <span className="text-gray-400 font-medium flex items-center gap-2">
                <Mail size={16} className="text-primary/70" /> Usia Ibu
              </span>
              <span className="font-bold text-gray-700">{profile.usia ? `${profile.usia} Tahun` : "-"}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50/50">
              <span className="text-gray-400 font-medium flex items-center gap-2">
                <Award size={16} className="text-primary/70" /> Anak Ke-
              </span>
              <span className="font-bold text-gray-700">{profile.anak_ke_berapa ?? "-"}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50/50">
              <span className="text-gray-400 font-medium flex items-center gap-2">
                <BookOpen size={16} className="text-primary/70" /> Pendidikan Terakhir
              </span>
              <span className="font-bold text-gray-700">{profile.pendidikan ?? "-"}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50/50">
              <span className="text-gray-400 font-medium flex items-center gap-2">
                <Briefcase size={16} className="text-primary/70" /> Pekerjaan
              </span>
              <span className="font-bold text-gray-700">{profile.pekerjaan ?? "-"}</span>
            </div>

            <div className="flex flex-col gap-1.5 py-1">
              <span className="text-gray-400 font-medium flex items-center gap-2">
                <MapPin size={16} className="text-primary/70" /> Alamat
              </span>
              <span className="font-semibold text-gray-700 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50 text-xs leading-relaxed block">
                {profile.alamat || "-"}
              </span>
            </div>
          </div>
        </section>

        {/* Menu Options */}
        <section className="space-y-4">
          <button 
            onClick={handleEditClick}
            className="w-full bg-white rounded-[2rem] p-4 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4 text-gray-700">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Settings size={22} />
              </div>
              <span className="font-bold text-lg">Ubah Profil</span>
            </div>
            <ChevronRight size={20} className="text-gray-400 group-hover:text-primary transition-colors" />
          </button>
          
          <button className="w-full bg-white rounded-[2rem] p-4 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-4 text-gray-700">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Bell size={22} />
              </div>
              <span className="font-bold text-lg">Notifikasi Harian</span>
            </div>
            <ChevronRight size={20} className="text-gray-400 group-hover:text-primary transition-colors" />
          </button>
          
          <button className="w-full bg-white rounded-[2rem] p-4 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-4 text-red-600">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                <LogOut size={22} />
              </div>
              <span className="font-bold text-lg">Keluar</span>
            </div>
          </button>
        </section>
      </main>

      {/* Edit Profile Modal / Bottom Sheet */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsEditing(false)}></div>
          <form 
            onSubmit={handleSave} 
            className="bg-white w-full max-w-md mx-auto rounded-t-[2.5rem] p-8 relative z-10 animate-in slide-in-from-bottom-full duration-300 max-h-[85vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="text-2xl font-bold text-gray-800">Ubah Profil</h3>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)} 
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Scrollable Form Inputs */}
            <div className="flex-1 overflow-y-auto pr-1 -mr-2 space-y-4 pb-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-2">Nama Lengkap *</label>
                <input 
                  type="text" 
                  value={tempProfile.nama_lengkap} 
                  onChange={(e) => setTempProfile({ ...tempProfile, nama_lengkap: e.target.value })}
                  placeholder="Nama Lengkap Bunda"
                  required 
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-sm text-gray-800 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-2">Username *</label>
                <input 
                  type="text" 
                  value={tempProfile.username} 
                  onChange={(e) => setTempProfile({ ...tempProfile, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  placeholder="username_bunda"
                  required 
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-sm text-gray-800 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-2">Tanggal Melahirkan *</label>
                <input 
                  type="date" 
                  value={tempProfile.tgl_melahirkan} 
                  onChange={(e) => setTempProfile({ ...tempProfile, tgl_melahirkan: e.target.value })}
                  required 
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-sm text-gray-800 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                />
                <p className="text-[10px] text-gray-500 mt-1 ml-2">Menentukan kalkulasi otomatis hari perawatan laktasi (Hari ke-1 s/d Hari ke-7).</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-2">Usia Ibu (Tahun)</label>
                  <input 
                    type="number" 
                    value={tempProfile.usia || ""} 
                    onChange={(e) => setTempProfile({ ...tempProfile, usia: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Usia Bunda"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-sm text-gray-800 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-2">Anak Ke-berapa</label>
                  <input 
                    type="number" 
                    value={tempProfile.anak_ke_berapa || ""} 
                    onChange={(e) => setTempProfile({ ...tempProfile, anak_ke_berapa: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Contoh: 1, 2"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-sm text-gray-800 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-2">Pendidikan Terakhir</label>
                <select 
                  value={tempProfile.pendidikan || ""} 
                  onChange={(e) => setTempProfile({ ...tempProfile, pendidikan: e.target.value ? e.target.value as any : undefined })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-sm text-gray-800 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                >
                  <option value="">Pilih Pendidikan</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="D3">D3</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                  <option value="S3">S3</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-2">Pekerjaan</label>
                <input 
                  type="text" 
                  value={tempProfile.pekerjaan || ""} 
                  onChange={(e) => setTempProfile({ ...tempProfile, pekerjaan: e.target.value })}
                  placeholder="Pekerjaan saat ini"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-sm text-gray-800 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-2">Alamat Lengkap</label>
                <textarea 
                  value={tempProfile.alamat || ""} 
                  onChange={(e) => setTempProfile({ ...tempProfile, alamat: e.target.value })}
                  placeholder="Alamat domisili lengkap Bunda..."
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-sm text-gray-800 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" 
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="shrink-0 pt-4 border-t border-gray-100 flex gap-3">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-50 text-gray-500 py-3.5 px-6 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3.5 px-6 rounded-2xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-colors"
              >
                <Check size={18} />
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

