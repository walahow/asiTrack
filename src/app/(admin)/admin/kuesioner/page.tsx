import { Plus, Edit, Trash2 } from "lucide-react";

export default function AdminKuesioner() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Kuesioner</h2>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors">
          <Plus size={18} />
          Tambah Pertanyaan
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6 p-4 bg-primary-bg rounded-xl border border-primary-light">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          <div>
            <h3 className="font-bold text-primary">Pertanyaan Milestone (Primary)</h3>
            <p className="text-sm text-gray-600 mt-1">
              "Apakah ASI (cairan putih/kekuningan) sudah diproduksi di payudara?"
            </p>
          </div>
          <button className="ml-auto text-primary hover:text-primary-hover p-2">
            <Edit size={18} />
          </button>
        </div>

        <h3 className="font-semibold text-gray-700 mb-4">Pertanyaan Sekunder</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-3 text-sm font-semibold text-gray-600">Urutan</th>
              <th className="py-3 text-sm font-semibold text-gray-600">Pertanyaan</th>
              <th className="py-3 text-sm font-semibold text-gray-600">Tipe</th>
              <th className="py-3 text-sm font-semibold text-gray-600 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-4 text-center text-gray-500">2</td>
              <td className="py-4 font-medium text-gray-800">Berapa kali Bunda menyusui hari ini?</td>
              <td className="py-4"><span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Open Ended</span></td>
              <td className="py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18} /></button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
