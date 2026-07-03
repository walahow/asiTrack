"use client";

import { useState } from "react";
import { Download, FileText, Filter, Calendar } from "lucide-react";

export default function AdminExportPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pendidikan, setPendidikan] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const PENDIDIKAN_OPTIONS = ["SD", "SMP", "SMA", "D3", "S1", "S2", "S3"];

  const togglePendidikan = (val: string) => {
    setPendidikan((prev) =>
      prev.includes(val) ? prev.filter((p) => p !== val) : [...prev, val]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      if (pendidikan.length > 0) params.append("pendidikan", pendidikan.join(","));

      const url = `/api/admin/export?${params.toString()}`;
      
      // We can just open this URL to trigger a file download natively in the browser
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert("Gagal mengunduh CSV");
    } finally {
      // Small timeout to remove loading state
      setTimeout(() => setIsExporting(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Export Data (CSV)</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Unduh seluruh log data laktasi berdasarkan filter untuk keperluan analisis.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm p-6 lg:p-8">
        <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2">
          <Filter size={20} className="text-primary" /> Filter Export
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Rentang Tanggal Lahir */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Calendar size={16} /> Tanggal Melahirkan (Opsional)
            </h4>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 w-full">
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Dari</label>
                <input 
                  type="date" 
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Sampai</label>
                <input 
                  type="date" 
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Filter Pendidikan */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-700">Pendidikan Ibu (Opsional)</h4>
            <div className="flex flex-wrap gap-2">
              {PENDIDIKAN_OPTIONS.map((edu) => (
                <button
                  key={edu}
                  onClick={() => togglePendidikan(edu)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    pendidikan.includes(edu)
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {edu}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-500 font-medium">
            Format: CSV (Comma Separated Values)
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white shadow-md transition-all ${
              isExporting ? "bg-primary/70 cursor-wait" : "bg-primary hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0"
            }`}
          >
            {isExporting ? (
              <>Mengunduh...</>
            ) : (
              <>
                <Download size={18} />
                Unduh Data CSV
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
