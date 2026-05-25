"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, X, Sparkles, PartyPopper, CheckCircle2, CircleDashed, Calendar, ShieldCheck, Heart, AlertCircle, Smile } from "lucide-react";

interface Question {
  _id: string;
  pertanyaan: string;
  tipe: "yes_no" | "open_ended";
  is_primary: boolean;
  order: number;
}

interface UserResponse {
  _id: string;
  question_id: string;
  hari_ke: number;
  jawaban: string;
  auto_filled: boolean;
  response_date: string;
}

interface TrackingState {
  nama_lengkap: string;
  tgl_melahirkan: string;
  currentHariKe: number;
  milestoneAchieved: boolean;
  milestoneDay: number | null;
  completed: boolean;
  pendingDays: number[];
  profile_completed: boolean;
  userResponses: UserResponse[];
}

export default function DashboardHome() {
  const [state, setState] = useState<TrackingState | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [primaryQ, setPrimaryQ] = useState<Question | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Submit states inside dashboard card
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const fetchData = async () => {
    try {
      const [stateRes, questionsRes] = await Promise.all([
        fetch("/api/responses/state"),
        fetch("/api/questions"),
      ]);

      const stateData = await stateRes.json();
      const questionsData = await questionsRes.json();

      if (stateData.status === "success" && questionsData.status === "success") {
        setState(stateData.data);
        setQuestions(questionsData.data);
        
        // Extract the primary question for the daily check-in card
        const primary = questionsData.data.find((q: Question) => q.is_primary);
        if (primary) {
          setPrimaryQ(primary);
        }
      } else {
        setError("Gagal memuat status pelacakan.");
      }
    } catch (err) {
      setError("Koneksi gagal. Pastikan database Anda aktif.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAnswerSubmit = async (jawaban: string) => {
    if (!primaryQ || !state) return;
    setSubmitting(false);
    setSubmitError("");
    setSubmitSuccess("");
    setSubmitting(true);

    const payload = {
      hari_ke: state.currentHariKe,
      answers: [
        {
          question_id: primaryQ._id,
          jawaban,
        },
      ],
    };

    try {
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan jawaban.");
      }

      setSubmitSuccess(data.message || "Jawaban berhasil disimpan!");
      
      // Reload state after short delay
      setTimeout(async () => {
        setLoading(true);
        await fetchData();
        setSubmitSuccess("");
        setLoading(false);
      }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || "Terjadi kesalahan koneksi.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6 min-h-screen bg-[#FAF8F5]">
        <div className="relative w-16 h-16 animate-bounce mb-4">
          <Image src="/logo.png" alt="Loading Logo" fill sizes="64px" priority className="object-contain" />
        </div>
        <p className="text-sm font-bold text-gray-500 animate-pulse">Menghubungkan Laktasi Bunda...</p>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8 text-center min-h-screen bg-[#FAF8F5]">
        <AlertCircle size={48} className="text-rose-500 mb-4 animate-shake" />
        <h3 className="text-lg font-bold text-gray-800">Gagal Memuat Dashboard</h3>
        <p className="text-xs text-gray-500 mt-2 max-w-xs">{error || "Silakan masuk kembali."}</p>
        <Link href="/auth/login" className="mt-6 px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md">
          Masuk Ulang
        </Link>
      </div>
    );
  }

  const { nama_lengkap, currentHariKe, milestoneAchieved, milestoneDay, completed, pendingDays, userResponses } = state;

  // Filter other pending days that are NOT today (past days mother missed)
  const otherPendingDays = pendingDays.filter((d) => d !== currentHariKe);
  const hasPastPending = otherPendingDays.length > 0;
  
  // Check if today is pending (unanswered)
  const isTodayPending = pendingDays.includes(currentHariKe);

  // Generate 7-day timeline nodes dynamically
  const timeline = Array.from({ length: 7 }, (_, i) => {
    const dayNum = i + 1;
    let status: "milestone" | "completed" | "motherly_question" | "forgotten" | "future" = "future";

    const isMilestone = milestoneAchieved && milestoneDay === dayNum;
    
    // Check if this day is logged (exists in userResponses or is auto-filled after the milestone)
    const hasResponse = userResponses.some((r) => r.hari_ke === dayNum);
    const isCompleted = hasResponse || (milestoneAchieved && milestoneDay && dayNum >= milestoneDay);

    if (isMilestone) {
      status = "milestone";
    } else if (isCompleted) {
      status = "completed";
    } else if (dayNum === currentHariKe && pendingDays.includes(dayNum)) {
      status = "motherly_question";
    } else if (dayNum < currentHariKe) {
      status = "forgotten";
    } else {
      status = "future";
    }

    return { dayNum, status };
  });

  return (
    <div className="flex flex-col flex-1 pb-24 pt-10 px-6 overflow-y-auto">
      
      {/* App Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-[1.25rem] overflow-hidden bg-primary/5 p-2 border border-primary/10 flex items-center justify-center shadow-sm">
            <Image
              src="/logo.png"
              alt="asiTrack Logo"
              fill
              sizes="64px"
              className="object-contain p-1"
              priority
            />
          </div>
          <span className="font-black text-2xl tracking-tight text-primary font-sans">
            asiTrack
          </span>
        </div>
      </div>

      {/* Greeting Banner */}
      <div className="mb-6 bg-gradient-to-br from-[#F5F3FF] to-white rounded-[2rem] p-6 border border-primary/5 shadow-sm relative overflow-hidden">
        <div className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-primary/5 shrink-0">
          <Heart size={96} className="fill-primary/5 stroke-none" />
        </div>
        <h1 className="text-2xl font-black text-gray-800 tracking-tight leading-tight">
          Halo, <span className="text-primary">Bunda {nama_lengkap}!</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1 font-semibold leading-relaxed">
          {currentHariKe < 1 
            ? "Mempersiapkan penyambutan si kecil 👶" 
            : `Hari ke-${currentHariKe} Pelayanan Laktasi Bunda 🌸`}
        </p>
      </div>

      <main className="space-y-6 flex flex-col">
        
        {/* Core Actions Card */}
        {completed ? (
          /* Case 1: All 7 days tracked successfully or milestone achieved */
          <section className="bg-gradient-to-br from-emerald-50 to-white rounded-[2.5rem] p-8 shadow-[0_10px_35px_rgba(0,0,0,0.02)] border border-emerald-100/50 relative overflow-hidden group text-center">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-100/30 rounded-full blur-xl"></div>
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-xl font-extrabold text-gray-800 leading-snug mb-3">
              Perjalanan Laktasi <span className="text-emerald-600">Lengkap!</span>
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto mb-6">
              Bunda sungguh luar biasa! 7 hari pertama pasca kelahiran telah berhasil dipantau. Produksi ASI Bunda kini tercatat dengan baik demi awal terbaik bagi si kecil.
            </p>
            <Link
              href="/form/history"
              className="inline-flex items-center justify-center bg-emerald-600 text-white py-3 px-8 rounded-xl text-xs font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              Lihat Histori Catatan
            </Link>
          </section>
        ) : currentHariKe < 1 ? (
          /* Case 2: Waiting for birth date */
          <section className="bg-white rounded-[2.5rem] p-8 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-gray-100 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5 animate-pulse">
              <Calendar size={32} />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Menanti Hari Bahagia...</h2>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
              Sistem pencatatan laktasi otomatis akan terbuka 1 hari setelah tanggal melahirkan yang Bunda daftarkan. Tetap tenang, persiapkan energi, dan selamat menanti kelahiran si kecil! 💕
            </p>
          </section>
        ) : !isTodayPending ? (
          /* Case 3: Today is already answered, but there are past pending days to complete */
          <section className="bg-gradient-to-br from-[#F5F3FF] to-white rounded-[2.5rem] p-8 shadow-[0_10px_35px_rgba(0,0,0,0.02)] border border-primary/10 relative overflow-hidden text-center">
            {hasPastPending && (
              <Link 
                href="/form" 
                className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 text-[10px] font-extrabold rounded-full shadow-sm animate-pulse border border-amber-200 cursor-pointer z-20"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                </span>
                {otherPendingDays.length} Hari Terlewat
              </Link>
            )}
            
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="text-lg font-extrabold text-gray-800 mb-1">Catatan Hari Ini Selesai!</h2>
            <p className="text-xs text-gray-500 max-w-xs mx-auto mb-5 leading-relaxed">
              Laporan hari ini sudah terisi dengan aman. Terima kasih atas disiplin Bunda!
            </p>
            {hasPastPending ? (
              <Link
                href="/form"
                className="inline-flex items-center justify-center bg-primary text-white py-3 px-6 rounded-xl text-xs font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                Lengkapi {otherPendingDays.length} Hari Terlewat
              </Link>
            ) : (
              <Link
                href="/form/history"
                className="inline-flex items-center justify-center bg-gray-50 text-gray-700 border border-gray-200 py-3 px-6 rounded-xl text-xs font-bold shadow-sm hover:bg-gray-100 transition-all"
              >
                Lihat Histori Catatan
              </Link>
            )}
          </section>
        ) : (
          /* Case 4: Today is unanswered. Embed the clinical question card directly! */
          <section className="bg-white rounded-[2.5rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group">
            
            {/* Top Right Corner Pending Days Pulsing Notification */}
            {hasPastPending && (
              <Link 
                href="/form" 
                className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 text-[10px] font-extrabold rounded-full shadow-sm animate-pulse border border-amber-200 cursor-pointer z-20"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                </span>
                {otherPendingDays.length} Hari Terlewat
              </Link>
            )}

            <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-700"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full mb-5">
                <Sparkles size={12} />
                Cek Harian: Hari ke-{currentHariKe}
              </div>
              
              {/* Submission Feedback inside card */}
              {submitError && (
                <div className="flex items-center gap-2 p-3.5 mb-4 bg-rose-50 text-rose-600 rounded-xl text-[11px] font-bold border border-rose-100">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {submitSuccess && (
                <div className="flex items-center gap-2 p-3.5 mb-4 bg-emerald-50 text-emerald-600 rounded-xl text-[11px] font-bold border border-emerald-100">
                  <Sparkles size={14} className="shrink-0" />
                  <span>{submitSuccess}</span>
                </div>
              )}

              <h2 className="text-2xl font-black text-gray-800 leading-snug mb-8">
                {primaryQ ? primaryQ.pertanyaan : "Apakah ASI sudah mulai keluar hari ini?"}
              </h2>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleAnswerSubmit("ya")}
                  disabled={submitting}
                  className="w-full flex items-center justify-between bg-primary text-white py-4 px-6 rounded-2xl font-bold shadow-[0_8px_20px_rgba(167,139,250,0.3)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 transition-all duration-300 cursor-pointer"
                >
                  <span className="text-xs">Ya, Sudah Keluar</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Check size={16} />
                  </div>
                </button>
                
                <button
                  onClick={() => handleAnswerSubmit("tidak")}
                  disabled={submitting}
                  className="w-full flex items-center justify-between bg-gray-50 text-gray-600 border border-gray-100 py-4 px-6 rounded-2xl font-bold hover:bg-gray-100 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 transition-all duration-300 cursor-pointer"
                >
                  <span className="text-xs">Belum Keluar</span>
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                    <X size={16} />
                  </div>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 7-Day Checkpoint Tracker Visual Timeline */}
        <section>
          <div className="mb-4">
            <h3 className="text-md font-bold text-gray-800">Perjalanan Laktasi 7 Hari</h3>
            <p className="text-[11px] text-gray-400 font-medium">Visualisasi progres harian pasca persalinan</p>
          </div>
          
          <div className="bg-white rounded-[2rem] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-gray-50">
            <div className="flex items-center justify-between w-full relative px-1">
              
              {/* Background Line */}
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-gray-100 rounded-full -z-10"></div>
              
              {/* Progress Line */}
              <div 
                className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full -z-10 transition-all duration-1000"
                style={{ 
                  width: `${
                    currentHariKe <= 0
                      ? "0%"
                      : currentHariKe >= 7
                      ? "100%"
                      : `calc(${((Math.min(currentHariKe, 7) - 1) / 6) * 100}% - 4px)`
                  }` 
                }}
              ></div>

              {timeline.map((item) => (
                <div key={item.dayNum} className="flex flex-col items-center relative z-10">
                  {/* Icon Node */}
                  <div className="mb-2 relative flex items-center justify-center">
                    
                    {/* State 1: Specific Milestone Celebration Day (Orange bouncing dot) */}
                    {item.status === "milestone" && (
                      <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-white shadow-lg shadow-amber-400/25 animate-bounce relative z-10">
                        <PartyPopper size={18} />
                        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-100 border border-amber-400"></span>
                        </span>
                      </div>
                    )}

                    {/* State 2: Logged Day / Auto-Filled subsequent days (Check purple badge) */}
                    {item.status === "completed" && (
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20">
                        <CheckCircle2 size={16} />
                      </div>
                    )}
                    
                    {/* State 3: Current Unanswered Day (Motherly Question Mark) */}
                    {item.status === "motherly_question" && (
                      <div className="w-10 h-10 rounded-full bg-rose-50 border-2 border-rose-200 text-rose-500 flex items-center justify-center font-bold text-lg relative animate-pulse shadow-md">
                        ?
                        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-200 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-100 border border-rose-300"></span>
                        </span>
                      </div>
                    )}
                    
                    {/* State 4: Forgotten Missed Days in the past (empty/dashed or light cross) */}
                    {item.status === "forgotten" && (
                      <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-400 border border-rose-100 flex items-center justify-center shadow-sm">
                        <X size={14} />
                      </div>
                    )}

                    {/* State 5: Future Pending Days */}
                    {item.status === "future" && (
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-300">
                        <CircleDashed size={14} />
                      </div>
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className={`text-[10px] font-bold ${
                    item.status === "milestone" 
                      ? "text-amber-500" 
                      : item.status === "completed"
                      ? "text-primary" 
                      : item.status === "motherly_question"
                      ? "text-rose-500"
                      : "text-gray-400"
                  }`}>
                    H{item.dayNum}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Informative Security Footer */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold text-gray-400 mt-4 justify-center">
          <ShieldCheck size={14} className="text-primary shrink-0" />
          <span>Sesi Keamanan Enkripsi Terlindungi &bull; asiTrack MedTech</span>
        </div>

      </main>
    </div>
  );
}
