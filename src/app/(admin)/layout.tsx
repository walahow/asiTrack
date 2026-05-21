import Link from "next/link";
import { 
  LayoutDashboard, 
  FileText, 
  Video, 
  ClipboardList, 
  Download, 
  LogOut 
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-primary tracking-tight">asiTrack</h1>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Portal</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary rounded-md transition-colors font-medium">
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link href="/admin/artikel" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary rounded-md transition-colors font-medium">
            <FileText size={20} />
            Artikel Laktasi
          </Link>
          <Link href="/admin/video" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary rounded-md transition-colors font-medium">
            <Video size={20} />
            Video Edukasi
          </Link>
          <Link href="/admin/kuesioner" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary rounded-md transition-colors font-medium">
            <ClipboardList size={20} />
            Kuesioner
          </Link>
          <Link href="/admin/export" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary rounded-md transition-colors font-medium">
            <Download size={20} />
            Export Data CSV
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center gap-3 px-3 py-2 w-full text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 md:hidden">
          <h1 className="text-xl font-bold text-primary">asiTrack Admin</h1>
        </header>
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
