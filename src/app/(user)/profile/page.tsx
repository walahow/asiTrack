"use client";

import { useState } from "react";
import { User as UserIcon, Bell, Settings, LogOut, ChevronRight, Edit3, X, Check } from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex flex-col flex-1 pb-32 pt-10 px-6 overflow-y-auto">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight mb-2">Profil Bunda</h1>
          <p className="text-gray-500 font-medium">Kelola data & preferensi</p>
        </div>
      </header>

      <main className="space-y-6 flex-1">
        
        {/* Profile Card */}
        <section className="bg-white rounded-[2.5rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full opacity-50 pointer-events-none"></div>
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary shrink-0 relative">
              <UserIcon size={36} />
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <Edit3 size={14} />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Bunda Budi</h2>
              <div className="inline-flex items-center mt-2 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                Hari ke-3 Menyusui
              </div>
            </div>
          </div>
        </section>

        {/* Menu Options */}
        <section className="space-y-4">
          <button 
            onClick={() => setIsEditing(true)}
            className="w-full bg-white rounded-[2rem] p-4 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4 text-gray-700">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Settings size={22} />
              </div>
              <span className="font-bold text-lg">Lengkapi Profil</span>
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
          <div className="bg-white w-full max-w-md mx-auto rounded-t-[2.5rem] p-8 relative z-10 animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Ubah Profil</h3>
              <button onClick={() => setIsEditing(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-2">Nama Panggilan Ibu</label>
                <input type="text" defaultValue="Bunda Budi" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-2">Tanggal Melahirkan</label>
                <input type="date" defaultValue="2026-05-18" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                <p className="text-xs text-gray-500 mt-2 ml-2">Digunakan untuk menghitung hari laktasi Anda.</p>
              </div>

              <button 
                onClick={() => setIsEditing(false)}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-white py-4 px-6 rounded-2xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-colors"
              >
                <Check size={20} />
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
