"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function EditVideo() {
  const router = useRouter();
  const params = useParams();
  const videoId = params.id as string;

  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [kategori, setKategori] = useState("relaksasi");
  const [published, setPublished] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await fetch(`/api/admin/videos/${videoId}`);
        const data = await res.json();
        if (data.status === "success") {
          setTitle(data.data.title || "");
          setYoutubeUrl(data.data.youtube_url || "");
          setDeskripsi(data.data.deskripsi || "");
          setKategori(data.data.kategori || "relaksasi");
          setPublished(data.data.published || false);
        } else {
          alert("Gagal memuat video: " + data.message);
          router.push("/admin/video");
        }
      } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    };
    if (videoId) fetchVideo();
  }, [videoId, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !youtubeUrl) {
      alert("Judul dan YouTube URL wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/videos/${videoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          youtube_url: youtubeUrl,
          deskripsi,
          kategori,
          published,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        router.push("/admin/video");
      } else {
        alert(data.message || "Gagal memperbarui video");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/video"
          className="p-2 bg-white rounded-full border border-gray-200 text-gray-500 hover:text-gray-800 shadow-sm transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">Edit Video Edukasi</h2>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Video <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Misal: Pijat Oksitosin untuk Melancarkan ASI"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-800 font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">URL YouTube <span className="text-red-500">*</span></label>
          <input 
            type="url" 
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Misal: https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-800 font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
          <select 
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-800 font-medium"
          >
            <option value="relaksasi">Relaksasi</option>
            <option value="terapi">Terapi</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Video - Opsional</label>
          <textarea 
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Tambahkan catatan untuk bunda..."
            rows={4}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-800 resize-none text-sm"
          />
        </div>

        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div>
              <span className="block text-sm font-semibold text-gray-800">Publish Video</span>
              <span className="block text-xs text-gray-500">Video akan tampil di pojok edukasi ibu.</span>
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
            {saving ? "Menyimpan..." : "Update Video"}
          </button>
        </div>
      </form>
    </div>
  );
}
