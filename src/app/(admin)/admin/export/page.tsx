"use client";

import { Download, Filter, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";

export default function AdminExport() {
  const handleExport = () => {
    // Placeholder logic for exporting CSV
    const dummyData = [
      { nama_lengkap: "Bunda Budi", tgl_melahirkan: "2026-05-18", hari_ke: 3, jawaban: "ya", auto_filled: "false" },
      { nama_lengkap: "Bunda Ayu", tgl_melahirkan: "2026-05-20", hari_ke: 1, jawaban: "tidak", auto_filled: "false" },
    ];
    
    const csv = Papa.unparse(dummyData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `asiTrack_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Export Data Kuesioner</h2>
        <p className="text-gray-500 mt-1">Unduh data laporan ASI ibu menyusui ke dalam format CSV.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6 text-gray-800 font-semibold border-b border-gray-100 pb-4">
          <Filter size={20} />
          <span>Filter Export</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Periode Tanggal Melahirkan</label>
            <div className="flex gap-2">
              <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
              <span className="self-center text-gray-400">-</span>
              <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Pendidikan</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none">
              <option value="">Semua Pendidikan</option>
              <option value="SMA">SMA</option>
              <option value="S1">S1</option>
            </select>
          </div>
        </div>

        <div className="bg-primary-bg p-6 rounded-xl flex items-center justify-between border border-primary-light">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-sm">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Siap untuk diunduh</h3>
              <p className="text-sm text-gray-600">Berdasarkan filter, terdapat 124 data yang siap diexport.</p>
            </div>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-colors"
          >
            <Download size={20} />
            Export ke CSV
          </button>
        </div>
      </div>
    </div>
  );
}
