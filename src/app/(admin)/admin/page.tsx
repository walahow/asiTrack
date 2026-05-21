import { Users, FileText, Video, Activity } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <span className="text-sm text-gray-500">Welcome back, Super Admin</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <h3 className="text-2xl font-bold text-gray-800">124</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-bg text-primary flex items-center justify-center">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Responses</p>
            <h3 className="text-2xl font-bold text-gray-800">89</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Articles</p>
            <h3 className="text-2xl font-bold text-gray-800">12</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <Video size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Videos</p>
            <h3 className="text-2xl font-bold text-gray-800">8</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
