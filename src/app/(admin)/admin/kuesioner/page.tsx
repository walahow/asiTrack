"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2, Info } from "lucide-react";
import Link from "next/link";

export default function AdminKuesioner() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/admin/questions");
      const json = await res.json();
      if (json.status === "success") {
        setQuestions(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, isPrimary: boolean) => {
    if (isPrimary) {
      alert("Pertanyaan milestone (primary) tidak dapat dihapus!");
      return;
    }
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

  const primaryQuestion = questions.find(q => q.is_primary);
  const secondaryQuestions = questions.filter(q => !q.is_primary).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Kuesioner</h2>
        <Link 
          href="/admin/kuesioner/new"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus size={18} />
          Tambah Pertanyaan
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <>
            {primaryQuestion ? (
              <div className="flex items-center gap-3 mb-8 p-4 bg-primary-bg rounded-xl border border-primary-light relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Info size={100} />
                </div>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                <div className="relative z-10">
                  <h3 className="font-bold text-primary">Pertanyaan Milestone (Primary)</h3>
                  <p className="text-sm text-gray-700 mt-1 font-medium">
                    &ldquo;{primaryQuestion.pertanyaan}&rdquo;
                  </p>
                </div>
                <Link 
                  href={`/admin/kuesioner/${primaryQuestion._id}/edit`}
                  className="ml-auto text-primary hover:bg-white hover:text-primary-hover p-2 rounded-lg transition-colors relative z-10 border border-transparent hover:border-primary-light"
                >
                  <Edit size={18} />
                </Link>
              </div>
            ) : (
              <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
                <Info size={20} />
                <span>Belum ada pertanyaan milestone (primary). Mohon tambahkan satu untuk sistem tracking!</span>
              </div>
            )}

            <h3 className="font-semibold text-gray-700 mb-4">Pertanyaan Sekunder</h3>
            {secondaryQuestions.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Belum ada pertanyaan sekunder.</p>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-3 text-sm font-semibold text-gray-600 w-16 text-center">Urutan</th>
                        <th className="py-3 text-sm font-semibold text-gray-600">Pertanyaan</th>
                        <th className="py-3 text-sm font-semibold text-gray-600 whitespace-nowrap">Tipe</th>
                        <th className="py-3 text-sm font-semibold text-gray-600 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {secondaryQuestions.map((q) => (
                        <tr key={q._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 text-center font-medium text-gray-500">{q.order}</td>
                          <td className="py-4 font-medium text-gray-800">{q.pertanyaan}</td>
                          <td className="py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md font-medium border border-gray-200">
                              {q.tipe === "yes_no" ? "Ya / Tidak" : "Open Ended"}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Link 
                                href={`/admin/kuesioner/${q._id}/edit`}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit size={18} />
                              </Link>
                              <button 
                                onClick={() => handleDelete(q._id, q.is_primary)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {secondaryQuestions.map((q) => (
                    <div key={q._id} className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-200 text-gray-600 font-bold flex items-center justify-center shrink-0">
                          {q.order}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 leading-snug">{q.pertanyaan}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-[10px] text-gray-500 bg-white px-2 py-1 rounded-md font-bold border border-gray-200">
                              {q.tipe === "yes_no" ? "Ya / Tidak" : "Open Ended"}
                            </span>
                            <div className="flex gap-1.5">
                              <Link 
                                href={`/admin/kuesioner/${q._id}/edit`}
                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                <Edit size={16} />
                              </Link>
                              <button 
                                onClick={() => handleDelete(q._id, q.is_primary)}
                                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
