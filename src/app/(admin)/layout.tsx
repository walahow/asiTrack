import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { 
  LayoutDashboard, 
  FileText, 
  Video, 
  ClipboardList, 
  Download, 
  LogOut 
} from "lucide-react";
import MobileAdminNav from "@/components/admin/MobileAdminNav";
import DesktopAdminLogoutButton from "@/components/admin/DesktopAdminLogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth guard — second layer of defense
  const session = await auth();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-xl bg-white border border-primary/10 shadow-sm overflow-hidden">
            <Image
              src="/logo.png"
              alt="hypemom Logo"
              fill
              sizes="48px"
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary tracking-tight leading-none">hypemom</h1>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mt-1.5">Admin Portal</span>
          </div>
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
          <DesktopAdminLogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-white border border-primary/10 shadow-sm overflow-hidden">
              <Image
                src="/logo.png"
                alt="hypemom Logo"
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </div>
            <h1 className="text-xl font-bold text-primary tracking-tight">hypemom</h1>
          </div>
          <MobileAdminNav />
        </header>
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
