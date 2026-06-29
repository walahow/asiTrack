"use client";

import { useState, useEffect } from "react";
import { Users, FileText, Video, Activity, Loader2, CheckCircle, Percent } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/dashboard-stats");
        const json = await res.json();
        if (json.status === "success") {
          setStats(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <span className="text-sm text-gray-500">Real-time statistics</span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Pengguna</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalUsers}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary-bg text-primary flex items-center justify-center shrink-0">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ibu Aktif (Hari 1-7)</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.activeUsers}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Mencapai Milestone</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.milestoneAchievedCount}</h3>
            </div>
          </div>

        </div>
      ) : (
        <div className="p-6 bg-red-50 text-red-600 rounded-2xl">Gagal memuat statistik.</div>
      )}
    </div>
  );
}
