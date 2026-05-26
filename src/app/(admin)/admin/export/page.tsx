"use client";

import { useState } from "react";
import { Download, Filter, FileSpreadsheet } from "lucide-react";

export default function AdminExport() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pendidikan, setPendidikan] = useState("");

  const handleExport = () => {
    const params = new URLSearchParams();
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    if (pendidikan) params.append("pendidikan", pendidikan);
    
    // Trigger download via our new API endpoint
    window.location.href = `/api/admin/export?${params.toString()}`;
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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <div className="w-full relative">
                <span className="sm:hidden absolute -top-2 left-2 bg-white px-1 text-[10px] font-bold text-gray-500 z-10">Dari</span>
                <input 
                  type="date" 
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
                />
              </div>
              <span className="hidden sm:block self-center text-gray-400">-</span>
              <div className="w-full relative">
                <span className="sm:hidden absolute -top-2 left-2 bg-white px-1 text-[10px] font-bold text-gray-500 z-10">Sampai</span>
                <input 
                  type="date" 
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Pendidikan</label>
            <select 
              value={pendidikan}
              onChange={(e) => setPendidikan(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            >
              <option value="">Semua Pendidikan</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
              <option value="D3">D3</option>
              <option value="S1">S1</option>
              <option value="S2">S2</option>
              <option value="S3">S3</option>
            </select>
          </div>
        </div>

        <div className="bg-primary-bg p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-primary-light">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-sm shrink-0">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Siap untuk diunduh</h3>
              <p className="text-sm text-gray-600">Tekan tombol untuk mulai mengunduh file CSV.</p>
            </div>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center justify-center w-full md:w-auto gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-colors shrink-0"
          >
            <Download size={20} />
            Export ke CSV
          </button>
        </div>
      </div>
    </div>
  );
}
