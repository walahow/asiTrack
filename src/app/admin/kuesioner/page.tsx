"use client";

import { useState, useEffect } from "react";
import { Search, UserCircle, CheckCircle, Sparkles, X, Activity, Loader2, Plus, Edit, Trash2, Settings, Users } from "lucide-react";

export default function AdminKuesionerPage() {
  const [activeTab, setActiveTab] = useState<"users" | "questions">("users");

  // User Tab State
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [userDataLoading, setUserDataLoading] = useState(false);

  // Question Tab State
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [showQModal, setShowQModal] = useState(false);
  const [editingQ, setEditingQ] = useState<any>(null);
  
  // Q Form
  const [qForm, setQForm] = useState({
    pertanyaan: "",
    tipe: "yes_no",
    is_primary: false,
    active: true,
    order: 1
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === "questions") {
      fetchQuestions();
    }
  }, [activeTab]);

  // --- Users Logic ---
  const fetchUsers = async (query = "") => {
    setUsersLoading(true);
    try {
      const res = await fetch(`/api/admin/users${query ? `?search=${encodeURIComponent(query)}` : ""}`);
      const json = await res.json();
      if (json.status === "success") {
        setUsers(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleSelectUser = async (id: string) => {
    setSelectedUserId(id);
    setUserDataLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}/responses`);
      const json = await res.json();
      if (json.status === "success") {
        setUserData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUserDataLoading(false);
    }
  };

  // --- Questions Logic ---
  const fetchQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const res = await fetch("/api/admin/questions");
      const json = await res.json();
      if (json.status === "success") {
        setQuestions(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleOpenAddQ = () => {
    setEditingQ(null);
    setQForm({ pertanyaan: "", tipe: "yes_no", is_primary: false, active: true, order: questions.length + 1 });
    setShowQModal(true);
  };

  const handleOpenEditQ = (q: any) => {
    setEditingQ(q);
    setQForm({
      pertanyaan: q.pertanyaan,
      tipe: q.tipe,
      is_primary: q.is_primary,
      active: q.active,
      order: q.order
    });
    setShowQModal(true);
  };

  const handleDeleteQ = async (id: string) => {
    if (!confirm("Yakin ingin menghapus pertanyaan ini?")) return;
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.status === "success") {
        fetchQuestions();
      } else {
        alert(json.message || "Gagal menghapus");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveQ = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingQ ? `/api/admin/questions/${editingQ._id}` : "/api/admin/questions";
      const method = editingQ ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(qForm)
      });
      const json = await res.json();
      if (json.status === "success") {
        setShowQModal(false);
        fetchQuestions();
      } else {
        alert(json.message || "Gagal menyimpan");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Render Helpers ---
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
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200 mb-6 pb-2 shrink-0">
        <button 
          onClick={() => setActiveTab("users")}
          className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "users" ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-gray-600"}`}
        >
          <Users size={18} />
          Data Pengguna
        </button>
        <button 
          onClick={() => setActiveTab("questions")}
          className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "questions" ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-gray-600"}`}
        >
          <Settings size={18} />
          Kelola Kuesioner
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        
        {activeTab === "users" ? (
          <>
            {/* Left Sidebar: User List */}
            <div className={`w-full md:w-1/3 bg-white border border-gray-200 rounded-3xl overflow-hidden flex-col shadow-sm ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
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
                {usersLoading ? (
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
            <div className={`w-full md:w-2/3 bg-white border border-gray-200 rounded-3xl overflow-y-auto shadow-sm p-6 lg:p-8 ${!selectedUserId ? 'hidden md:block' : 'block'}`}>
              {!selectedUserId ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                    <UserCircle size={40} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-medium">Pilih pengguna di panel kiri untuk melihat data laktasi.</p>
                </div>
              ) : userDataLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="animate-spin text-primary w-8 h-8" />
                </div>
              ) : userData?.user ? (
                <div>
                  <div className="flex flex-col md:flex-row md:items-start justify-between border-b border-gray-100 pb-6 gap-4">
                    <div>
                      <button onClick={() => setSelectedUserId(null)} className="md:hidden flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-primary mb-3">
                        <X size={16} /> Kembali
                      </button>
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
          </>
        ) : (
          <div className="w-full bg-white border border-gray-200 rounded-3xl overflow-hidden flex flex-col shadow-sm">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Kelola Pertanyaan</h3>
                <p className="text-sm text-gray-500 mt-1">Atur daftar pertanyaan yang akan dijawab ibu setiap harinya.</p>
              </div>
              <button 
                onClick={handleOpenAddQ}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Plus size={18} />
                Tambah
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {questionsLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
              ) : questions.length === 0 ? (
                <div className="text-center p-8 text-gray-400">Tidak ada pertanyaan ditemukan.</div>
              ) : (
                <div className="space-y-4">
                  {questions.map(q => (
                    <div key={q._id} className={`p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all hover:shadow-sm ${q.active ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100 opacity-70"}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 font-black flex items-center justify-center shrink-0">
                          {q.order}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 mb-1 flex flex-wrap items-center gap-2">
                            {q.pertanyaan}
                            {q.is_primary && (
                              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Primary Milestone</span>
                            )}
                            {!q.active && (
                              <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Nonaktif</span>
                            )}
                          </h4>
                          <p className="text-xs text-gray-500">Tipe Jawaban: <span className="font-semibold">{q.tipe === 'yes_no' ? "Ya/Tidak" : "Isian Singkat"}</span></p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => handleOpenEditQ(q)}
                          className="w-9 h-9 rounded-xl border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteQ(q._id)}
                          className="w-9 h-9 rounded-xl border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Q Form */}
      {showQModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-xl text-gray-800">{editingQ ? "Edit Pertanyaan" : "Tambah Pertanyaan"}</h3>
              <button onClick={() => setShowQModal(false)} className="text-gray-400 hover:text-gray-600 p-2"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="q-form" onSubmit={handleSaveQ} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Pertanyaan</label>
                  <input 
                    type="text" 
                    required
                    value={qForm.pertanyaan}
                    onChange={(e) => setQForm({...qForm, pertanyaan: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Contoh: Apakah ASI sudah keluar?"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Urutan Tampil (Order)</label>
                    <input 
                      type="number" 
                      required min={1}
                      value={qForm.order}
                      onChange={(e) => setQForm({...qForm, order: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tipe Jawaban</label>
                    <select 
                      value={qForm.tipe}
                      onChange={(e) => setQForm({...qForm, tipe: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                    >
                      <option value="yes_no">Ya / Tidak</option>
                      <option value="open_ended">Isian Singkat</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                  <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={qForm.is_primary}
                      onChange={(e) => setQForm({...qForm, is_primary: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="font-bold text-sm text-gray-800">Primary Milestone</p>
                      <p className="text-xs text-gray-500">Jika "Ya", sistem akan melakukan auto-fill sisa hari.</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={qForm.active}
                      onChange={(e) => setQForm({...qForm, active: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="font-bold text-sm text-gray-800">Aktif Tampil</p>
                      <p className="text-xs text-gray-500">Centang agar form ini muncul ke pengguna.</p>
                    </div>
                  </label>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 mt-auto flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setShowQModal(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="q-form"
                className="px-6 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
