"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Info } from "lucide-react";

export default function NewQuestion() {
  const router = useRouter();
  const [pertanyaan, setPertanyaan] = useState("");
  const [tipe, setTipe] = useState("yes_no");
  const [isPrimary, setIsPrimary] = useState(false);
  const [active, setActive] = useState(true);
  const [order, setOrder] = useState(1);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pertanyaan) {
      alert("Pertanyaan wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pertanyaan,
          tipe,
          is_primary: isPrimary,
          active,
          order: Number(order),
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        router.push("/admin/kuesioner");
      } else {
        alert(data.message || "Gagal menyimpan pertanyaan");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl pb-12">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/kuesioner"
          className="p-2 bg-white rounded-full border border-gray-200 text-gray-500 hover:text-gray-800 shadow-sm transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">Tambah Pertanyaan</h2>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 text-blue-800 mb-2">
          <Info className="shrink-0 mt-0.5" size={18} />
          <p className="text-sm">
            Jika memilih <strong>Pertanyaan Primary</strong>, sistem akan menganggapnya sebagai milestone (Hanya boleh ada 1, pertanyaan primary lama akan digantikan).
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Pertanyaan <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            value={pertanyaan}
            onChange={(e) => setPertanyaan(e.target.value)}
            placeholder="Misal: Berapa kali Bunda menyusui hari ini?"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-800 font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipe Jawaban</label>
            <select 
              value={tipe}
              onChange={(e) => setTipe(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-800 font-medium"
            >
              <option value="yes_no">Ya / Tidak (Yes/No)</option>
              <option value="open_ended">Teks Terbuka (Open Ended)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Urutan Tampil (Order)</label>
            <input 
              type="number" 
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              min={1}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-800 font-medium"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
            <input 
              type="checkbox" 
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div>
              <span className="block text-sm font-semibold text-gray-800">Jadikan Pertanyaan Primary</span>
              <span className="block text-xs text-gray-500">Memicu auto-fill milestone</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
            <input 
              type="checkbox" 
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div>
              <span className="block text-sm font-semibold text-gray-800">Aktif</span>
              <span className="block text-xs text-gray-500">Tampilkan di form harian ibu</span>
            </div>
          </label>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-colors disabled:opacity-70"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {saving ? "Menyimpan..." : "Simpan Pertanyaan"}
          </button>
        </div>
      </form>
    </div>
  );
}
