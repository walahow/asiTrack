"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles, Check, X, AlertCircle, Smile, HelpCircle, CheckCircle } from "lucide-react";

interface Question {
  _id: string;
  pertanyaan: string;
  tipe: "yes_no" | "open_ended";
  is_primary: boolean;
  order: number;
}

interface TrackingState {
  nama_lengkap: string;
  tgl_melahirkan: string;
  currentHariKe: number;
  milestoneAchieved: boolean;
  pendingDays: number[];
}

export default function FormPage() {
  const router = useRouter();
  
  const [state, setState] = useState<TrackingState | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Slide-over Form states
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fetchData = async () => {
    try {
      // 1. Fetch tracking state
      const stateRes = await fetch("/api/responses/state");
      const stateData = await stateRes.json();
      if (stateData.status !== "success") {
        throw new Error(stateData.message || "Gagal memuat status pelacakan.");
      }
      setState(stateData.data);

      // 2. Fetch questions
      const questionsRes = await fetch("/api/questions", { cache: "no-store" });
      const questionsData = await questionsRes.json();
      if (questionsData.status !== "success") {
        throw new Error(questionsData.message || "Gagal memuat formulir kuesioner.");
      }
      
      const sortedQuestions = [...questionsData.data].sort((a, b) => {
        if (a.is_primary) return -1;
        if (b.is_primary) return 1;
        return a.order - b.order;
      });
      setQuestions(sortedQuestions);
    } catch (err: any) {
      setError(err.message || "Koneksi terputus. Pastikan database aktif.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format date helper relative to birth date
  const getFormattedDateForDay = (birthDateStr: string, dayOffset: number) => {
    const birthDate = new Date(birthDateStr);
    birthDate.setDate(birthDate.getDate() + dayOffset);
    return birthDate.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleOpenForm = (dayNum: number) => {
    setActiveDay(dayNum);
    setAnswers({});
    setFormError("");
    setFormSuccess("");
  };

  const handleCloseForm = () => {
    setActiveDay(null);
  };

  const handleSelectAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeDay === null) return;
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    // Validate that all questions are answered
    const unanswered = questions.filter((q) => !answers[q._id]);
    if (unanswered.length > 0) {
      setFormError("Mohon jawab seluruh pertanyaan sebelum menyimpan.");
      setSubmitting(false);
      return;
    }

    // Format payload
    const payload = {
      hari_ke: activeDay,
      answers: Object.entries(answers).map(([question_id, jawaban]) => ({
        question_id,
        jawaban,
      })),
    };

    try {
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan laporan.");
      }

      setFormSuccess(data.message || "Laporan berhasil disimpan!");
      
      // Refresh local data after short delay
      setTimeout(async () => {
        setActiveDay(null);
        setLoading(true);
        await fetchData();
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan koneksi.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6 min-h-screen bg-[#FAF8F5]">
        <div className="relative w-20 h-20 bg-white border border-primary/10 rounded-3xl shadow-md shadow-primary/5 animate-bounce mb-4 overflow-hidden">
          <Image src="/logo.png" alt="Loading Logo" fill sizes="80px" priority className="object-cover" />
        </div>
        <p className="text-sm font-bold text-gray-500 animate-pulse">Memuat Formulir Harian...</p>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8 text-center min-h-screen bg-[#FAF8F5]">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-800">Gagal Memuat Kuesioner</h3>
        <p className="text-xs text-gray-500 mt-2">{error}</p>
        <button onClick={() => { setLoading(true); fetchData(); }} className="mt-6 px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl">
          Coba Lagi
        </button>
      </div>
    );
  }

  const { pendingDays, tgl_melahirkan } = state;

  return (
    <div className="flex flex-col flex-1 pb-24 md:pb-12 pt-10 px-6 max-w-4xl mx-auto w-full">
      
      {/* Back Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>
        <span className="text-xs font-bold text-gray-400">Pencatatan Laktasi</span>
      </div>

      {/* Main Intro */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight leading-snug">
          Formulir <span className="text-primary">Laktasi Harian</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1 font-semibold leading-relaxed">
          {state.currentHariKe < 1 
            ? "Pelacakan laktasi Hari ke-1 akan dimulai besok."
            : pendingDays.length === 0 
              ? "Luar biasa Bunda! Semua laporan pelacakan laktasi terisi penuh." 
              : `Terdapat ${pendingDays.length} laporan harian yang perlu diisi.`}
        </p>
      </div>

      {/* Pending Days Cards List */}
      <div className="space-y-4">
        {state.currentHariKe < 1 ? (
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Smile size={28} />
            </div>
            <h3 className="text-md font-bold text-gray-800">Masa Persiapan Laktasi</h3>
            <p className="text-xs text-gray-400 max-w-xs mt-2 font-medium">
              Bunda saat ini berada di masa persiapan. Pelacakan laktasi harian (Hari ke-1) akan otomatis terbuka esok hari. Selamat beristirahat!
            </p>
            <Link href="/dashboard" className="mt-6 px-6 py-2.5 bg-gray-50 text-gray-500 text-xs font-bold rounded-xl border border-gray-100">
              Kembali ke Beranda
            </Link>
          </div>
        ) : pendingDays.length === 0 ? (
          <div className="bg-[#E8F5E9]/50 rounded-[2rem] p-8 border border-emerald-100 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
              <CheckCircle size={28} />
            </div>
            <h3 className="text-md font-bold text-gray-800">Semua Laporan Terisi!</h3>
            <p className="text-xs text-gray-400 max-w-xs mt-2 font-medium">
              Bunda telah mencatat laktasi harian dengan disiplin. Teruskan perjuangan demi kesehatan si kecil!
            </p>
            <Link href="/dashboard" className="mt-6 px-6 py-2.5 bg-[#E8F5E9] text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100">
              Kembali ke Beranda
            </Link>
          </div>
        ) : (
          pendingDays.map((dayNum) => (
            <div
              key={dayNum}
              className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_8px_25px_rgba(0,0,0,0.02)] hover:shadow-md hover:scale-[1.01] transition-all flex flex-col justify-between"
            >
              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold border border-amber-100 mb-3.5">
                  <Smile size={12} />
                  Belum Terisi
                </span>
                
                <h3 className="text-lg font-extrabold text-gray-800 leading-tight">
                  Laporan Hari ke-{dayNum}
                </h3>
                
                <p className="text-[11px] text-gray-400 font-semibold mt-1">
                  📅 {getFormattedDateForDay(tgl_melahirkan, dayNum)}
                </p>
              </div>

              <button
                onClick={() => handleOpenForm(dayNum)}
                className="mt-6 w-full text-center bg-primary text-white py-3 rounded-xl text-xs font-bold hover:scale-[1.01] active:scale-[0.99] transition-all shadow-sm"
              >
                Mulai Isi Laporan
              </button>
            </div>
          ))
        )}
      </div>

      {/* Floating Bottom Slider Form Sheet */}
      {activeDay !== null && (
        <>
          {/* Overlay Dimmer */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
            onClick={handleCloseForm}
          />

          {/* Sliding sheet / Modal container */}
          <div className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full max-w-md bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] p-6 shadow-2xl z-50 max-h-[85vh] overflow-y-auto flex flex-col justify-between">
            
            {/* Sheet Handle (Mobile Only) */}
            <div className="md:hidden w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5 shrink-0" />

            {/* Sheet Header */}
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div>
                <h2 className="text-lg font-black text-gray-800 leading-tight">Catat Laktasi H-{activeDay}</h2>
                <span className="text-[10px] text-gray-400 font-bold block mt-0.5">
                  {getFormattedDateForDay(tgl_melahirkan, activeDay)}
                </span>
              </div>
              <button
                onClick={handleCloseForm}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            {/* Dynamic Scrollable Form Content */}
            <form onSubmit={handleSubmit} className="space-y-5 flex-1 overflow-y-auto pr-1">
              
              {/* Form Alerts */}
              {formError && (
                <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-100">
                  <Sparkles size={16} className="shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {questions.map((question) => {
                // Secondary questions should only show if the primary question is answered "ya"
                if (!question.is_primary) {
                  const primaryQuestion = questions.find(q => q.is_primary);
                  if (primaryQuestion && answers[primaryQuestion._id]?.toLowerCase() !== "ya") {
                    return null;
                  }
                }

                return (
                  <div key={question._id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3.5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <HelpCircle size={12} />
                      </div>
                      <h4 className="text-xs font-bold text-gray-800 leading-normal">
                        {question.pertanyaan}
                      </h4>
                    </div>
  
                    {/* Input Renderer based on Question Type */}
                    {question.tipe === "yes_no" ? (
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleSelectAnswer(question._id, "ya")}
                          className={`py-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                            answers[question._id] === "ya"
                              ? "bg-primary border-primary text-white shadow-sm"
                              : "bg-white border-gray-100 text-gray-600"
                          }`}
                        >
                          <Check size={14} />
                          Ya, Benar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectAnswer(question._id, "tidak")}
                          className={`py-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                            answers[question._id] === "tidak"
                              ? "bg-amber-400 border-amber-400 text-white shadow-sm"
                              : "bg-white border-gray-100 text-gray-600"
                          }`}
                        >
                          <X size={14} />
                          Belum / Tidak
                        </button>
                      </div>
                    ) : (
                      <textarea
                        rows={2}
                        placeholder="Masukkan catatan tambahan Bunda di sini..."
                        value={answers[question._id] || ""}
                        onChange={(e) => handleSelectAnswer(question._id, e.target.value)}
                        className="w-full p-3.5 bg-white border border-gray-100 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-primary transition-all placeholder:text-gray-400 resize-none"
                      />
                    )}
                  </div>
                );
              })}

              {/* Action Buttons */}
              <div className="pt-4 shrink-0">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-white py-3.5 rounded-xl text-xs font-extrabold shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all text-center block"
                >
                  {submitting ? "Menyimpan Catatan..." : "Simpan Laporan"}
                </button>
              </div>

            </form>

          </div>
        </>
      )}

    </div>
  );
}
