"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles, Check, X, ShieldAlert, Heart, Calendar, HelpCircle, Activity, Award } from "lucide-react";

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
  userResponses: UserResponse[];
}

export default function HistoryPage() {
  const [state, setState] = useState<TrackingState | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const stateRes = await fetch("/api/responses/state");
      const stateData = await stateRes.json();
      if (stateData.status !== "success") {
        throw new Error(stateData.message || "Gagal memuat status.");
      }
      setState(stateData.data);

      const questionsRes = await fetch("/api/questions");
      const questionsData = await questionsRes.json();
      if (questionsData.status !== "success") {
        throw new Error(questionsData.message || "Gagal memuat pertanyaan.");
      }
      setQuestions(questionsData.data);
    } catch (err: any) {
      setError(err.message || "Koneksi terputus. Pastikan database Anda aktif.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6 min-h-screen bg-[#FAF8F5]">
        <div className="relative w-16 h-16 animate-bounce mb-4">
          <Image src="/logo.png" alt="Loading Logo" fill className="object-contain" />
        </div>
        <p className="text-sm font-bold text-gray-500 animate-pulse">Memuat Catatan Laktasi...</p>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8 text-center min-h-screen bg-[#FAF8F5]">
        <ShieldAlert size={48} className="text-rose-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-800">Gagal Memuat Histori</h3>
        <p className="text-xs text-gray-500 mt-2">{error}</p>
        <button onClick={() => { setLoading(true); fetchData(); }} className="mt-6 px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl">
          Coba Lagi
        </button>
      </div>
    );
  }

  const { currentHariKe, milestoneAchieved, milestoneDay, userResponses, tgl_melahirkan } = state;

  // Resolve 7-day grid status
  const daysGrid = Array.from({ length: 7 }, (_, i) => {
    const dayNum = i + 1;
    let label = "Belum Mulai";
    let colorClass = "bg-gray-50 text-gray-300 border-gray-200 cursor-default";
    let icon = <Calendar size={14} />;
    let hasData = false;

    const isMilestone = milestoneAchieved && milestoneDay === dayNum;
    
    // Check if this day is logged (exists in userResponses or is auto-filled after the milestone)
    const responsesForDay = userResponses.filter((r) => r.hari_ke === dayNum);
    const isCompleted = responsesForDay.length > 0 || (milestoneAchieved && milestoneDay && dayNum >= milestoneDay);

    if (isMilestone) {
      label = "ASI Pertama! 🎉";
      colorClass = "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:scale-[1.02] cursor-pointer shadow-sm animate-pulse";
      icon = <Sparkles size={14} className="fill-amber-300/30" />;
      hasData = true;
    } else if (isCompleted) {
      const isAuto = responsesForDay.some((r) => r.auto_filled) || (milestoneDay && dayNum > milestoneDay);
      label = isAuto ? "Terisi Otomatis" : "Catatan Terisi";
      colorClass = "bg-purple-50 text-primary border-purple-100 hover:bg-purple-100 hover:scale-[1.02] cursor-pointer";
      icon = <Check size={14} />;
      hasData = true;
    } else if (dayNum === currentHariKe) {
      label = "Belum Terisi Harian";
      colorClass = "bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-100 hover:scale-[1.02] cursor-pointer animate-pulse";
      icon = <span className="font-bold text-sm">?</span>;
      hasData = true;
    } else if (dayNum < currentHariKe) {
      label = "Terlewat (Kosong)";
      colorClass = "bg-rose-50/50 text-rose-400 border-rose-100/50 hover:bg-rose-100/30 hover:scale-[1.02] cursor-pointer";
      icon = <X size={14} />;
      hasData = true;
    }

    return { dayNum, label, colorClass, icon, hasData, responses: responsesForDay };
  });

  const getFormattedDate = (birthDateStr: string, dayOffset: number) => {
    const birthDate = new Date(birthDateStr);
    birthDate.setDate(birthDate.getDate() + dayOffset);
    return birthDate.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDayClick = (dayNum: number, hasData: boolean) => {
    if (!hasData) return;
    setSelectedDay(selectedDay === dayNum ? null : dayNum);
  };

  return (
    <div className="flex flex-col flex-1 pb-24 pt-10 px-6 overflow-y-auto">
      
      {/* Back Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>
        <span className="text-xs font-bold text-gray-400">Histori Laktasi</span>
      </div>

      {/* Intro Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight leading-snug">
          Perjalanan <span className="text-primary">Laktasi Bunda</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1 font-semibold leading-relaxed">
          Pilih salah satu hari di bawah untuk melihat rincian laporan dan catatan harian Anda.
        </p>
      </div>

      {/* Celebrating Achievement Card (if milestone achieved) */}
      {milestoneAchieved && (
        <div className="mb-6 bg-gradient-to-br from-purple-100/50 to-white rounded-[2rem] p-5 border border-primary/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-md">
            <Award size={24} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-800">Milestone Terlalui! 🌸</h4>
            <p className="text-[10px] text-gray-400 font-semibold leading-normal mt-0.5">
              ASI pertama (kolostrum) telah berhasil diproduksi sejak Hari ke-{milestoneDay}. Hebat sekali Bunda!
            </p>
          </div>
        </div>
      )}

      {/* 7-Day Timeline Grid Layout */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {daysGrid.map((day) => (
          <button
            key={day.dayNum}
            disabled={!day.hasData}
            onClick={() => handleDayClick(day.dayNum, day.hasData)}
            className={`flex flex-col items-center text-center p-4 border rounded-[2rem] transition-all focus:outline-none ${day.colorClass}`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">
              Hari {day.dayNum}
            </span>
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm my-1 shrink-0">
              {day.icon}
            </div>
            <span className="text-[9px] font-extrabold mt-1 block">
              {day.label}
            </span>
          </button>
        ))}
      </div>

      {/* Expansion Panel for Daily Answers */}
      {selectedDay !== null && (
        <section className="bg-white rounded-[2.5rem] p-6 shadow-[0_10px_35px_rgba(0,0,0,0.02)] border border-gray-100 relative overflow-hidden transition-all duration-300">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-extrabold text-gray-800">
                Detail Laporan Hari ke-{selectedDay}
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                {getFormattedDate(tgl_melahirkan, selectedDay)}
              </p>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-xs font-bold text-primary hover:underline"
            >
              Tutup
            </button>
          </div>

          {/* Render Answers */}
          <div className="space-y-4">
            {daysGrid[selectedDay - 1].label === "Kosong" ? (
              <div className="text-center py-4 text-xs text-rose-500 font-bold bg-rose-50/50 rounded-xl border border-rose-100/50">
                ⚠️ Bunda tidak merekam laporan pada hari ini.
              </div>
            ) : daysGrid[selectedDay - 1].label === "Terisi Otomatis" ? (
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-purple-700 text-xs font-bold flex items-start gap-2">
                  <Sparkles size={16} className="shrink-0 mt-0.5" />
                  <span>
                    Hari ini terisi otomatis karena Bunda telah mencapai milestone produksi ASI.
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700">Apakah ASI sudah keluar?</span>
                  <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full">
                    Ya (Tercapai)
                  </span>
                </div>
              </div>
            ) : (
              daysGrid[selectedDay - 1].responses.map((resp) => {
                const matchedQ = questions.find((q) => q._id === resp.question_id);
                return (
                  <div key={resp._id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                    <div className="flex items-start gap-2">
                      <HelpCircle size={14} className="text-primary shrink-0 mt-0.5" />
                      <h4 className="text-xs font-bold text-gray-700 leading-normal">
                        {matchedQ ? matchedQ.pertanyaan : "Pertanyaan Laktasi"}
                      </h4>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] text-gray-400 font-semibold">Jawaban:</span>
                      {resp.jawaban.toLowerCase() === "ya" ? (
                        <span className="px-3 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                          <Check size={10} /> Ya
                        </span>
                      ) : resp.jawaban.toLowerCase() === "tidak" ? (
                        <span className="px-3 py-0.5 bg-amber-400 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                          <X size={10} /> Belum
                        </span>
                      ) : (
                        <span className="p-2 bg-white border border-gray-100 rounded-lg text-xs font-bold text-gray-800 block text-right max-w-[180px] truncate">
                          {resp.jawaban}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* Decorative Brand Watermark */}
      <div className="text-center mt-8">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
          asiTrack Support Center &bull; 🌸
        </span>
      </div>

    </div>
  );
}
