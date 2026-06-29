"use client";

import { useState, useEffect } from "react";
import { Search, UserCircle, CheckCircle, Calendar, Sparkles, X, Activity, Loader2 } from "lucide-react";

export default function AdminKuesionerPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const [userData, setUserData] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (query = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users${query ? `?search=${encodeURIComponent(query)}` : ""}`);
      const json = await res.json();
      if (json.status === "success") {
        setUsers(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleSelectUser = async (id: string) => {
    setSelectedUserId(id);
    setUserLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}/responses`);
      const json = await res.json();
      if (json.status === "success") {
        setUserData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUserLoading(false);
    }
  };

  const renderTimeline = () => {
    if (!userData || !userData.user || !userData.responses) return null;
    
    // Create 7-day grid
    const daysGrid = Array.from({ length: 7 }, (_, i) => {
      const dayNum = i + 1;
      const responsesForDay = userData.responses.filter((r: any) => r.hari_ke === dayNum);
      const isAuto = responsesForDay.some((r: any) => r.auto_filled);
      const hasData = responsesForDay.length > 0;
      
      let statusClass = "bg-gray-50 border-gray-200 text-gray-400";
      let statusLabel = "Kosong";
      let Icon = X;

      if (hasData) {
        if (isAuto) {
          statusClass = "bg-purple-50 border-purple-200 text-purple-600";
          statusLabel = "Auto-filled";
          Icon = Sparkles;
        } else {
          statusClass = "bg-emerald-50 border-emerald-200 text-emerald-600";
          statusLabel = "Terisi";
          Icon = CheckCircle;
        }
      }

      return {
        dayNum,
        responses: responsesForDay,
        statusClass,
        statusLabel,
        Icon,
      };
    });

    return (
      <div className="space-y-6 mt-6">
        <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
          <Activity className="text-primary" size={20} />
          Catatan Laktasi (Hari 1-7)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {daysGrid.map((day) => (
            <div key={day.dayNum} className={`p-4 border rounded-2xl ${day.statusClass} flex flex-col`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm">Hari ke-{day.dayNum}</span>
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider">
                  <day.Icon size={12} /> {day.statusLabel}
                </span>
              </div>
              
              {day.responses.length > 0 ? (
                <div className="space-y-3 mt-auto">
                  {day.responses.map((resp: any) => (
                    <div key={resp._id} className="bg-white/60 p-3 rounded-xl border border-black/5">
                      <p className="text-[11px] font-bold text-gray-700 mb-1 leading-snug">
                        {resp.question_id?.pertanyaan || "Pertanyaan Laktasi"}
                      </p>
                      <div className="flex justify-between items-end">
                        <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                          resp.jawaban.toLowerCase() === "ya" ? "bg-emerald-100 text-emerald-700" :
                          resp.jawaban.toLowerCase() === "tidak" ? "bg-rose-100 text-rose-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {resp.jawaban}
                        </span>
                        {resp.auto_filled && (
                          <span className="text-[9px] text-purple-500 font-bold">Auto</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center py-4 opacity-50">
                  <span className="text-xs font-semibold">Tidak ada catatan</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Left Sidebar: User List */}
      <div className="w-full md:w-1/3 bg-white border border-gray-200 rounded-3xl overflow-hidden flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">Pilih Pengguna</h3>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau username..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </form>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
          ) : users.length === 0 ? (
            <div className="text-center p-8 text-gray-400 text-sm">Tidak ada pengguna ditemukan</div>
          ) : (
            <div className="space-y-1">
              {users.map(user => (
                <button
                  key={user._id}
                  onClick={() => handleSelectUser(user._id)}
                  className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
                    selectedUserId === user._id 
                      ? "bg-primary text-white shadow-md" 
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    selectedUserId === user._id ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                  }`}>
                    <UserCircle size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className={`text-sm font-bold truncate ${selectedUserId === user._id ? "text-white" : "text-gray-800"}`}>
                      {user.nama_lengkap}
                    </p>
                    <p className={`text-xs truncate ${selectedUserId === user._id ? "text-primary-50" : "text-gray-500"}`}>
                      @{user.username}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Content: User Details & Logs */}
      <div className="w-full md:w-2/3 bg-white border border-gray-200 rounded-3xl overflow-y-auto shadow-sm p-6 lg:p-8">
        {!selectedUserId ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
              <UserCircle size={40} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium">Pilih pengguna di panel kiri untuk melihat data laktasi.</p>
          </div>
        ) : userLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
          </div>
        ) : userData?.user ? (
          <div>
            <div className="flex items-start justify-between border-b border-gray-100 pb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-800 mb-1">{userData.user.nama_lengkap}</h2>
                <p className="text-primary font-bold text-sm">@{userData.user.username}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                  userData.user.profile_completed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {userData.user.profile_completed ? "Profil Lengkap" : "Belum Melengkapi Profil"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-gray-100">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Tgl Melahirkan</p>
                <p className="text-sm font-semibold text-gray-800">
                  {userData.user.tgl_melahirkan ? new Date(userData.user.tgl_melahirkan).toLocaleDateString("id-ID") : "-"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Usia</p>
                <p className="text-sm font-semibold text-gray-800">{userData.user.usia || "-"} thn</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Anak Ke</p>
                <p className="text-sm font-semibold text-gray-800">{userData.user.anak_ke_berapa || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Pendidikan</p>
                <p className="text-sm font-semibold text-gray-800">{userData.user.pendidikan || "-"}</p>
              </div>
            </div>

            {renderTimeline()}
          </div>
        ) : (
          <div className="text-center py-8 text-rose-500 font-medium">Gagal memuat detail pengguna.</div>
        )}
      </div>
    </div>
  );
}
