"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, FileText, Video, ClipboardList, Download, LogOut } from "lucide-react";
import MobileAdminNav from "@/components/admin/MobileAdminNav";
import DesktopAdminLogoutButton from "@/components/admin/DesktopAdminLogoutButton";
import Image from "next/image";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If we are on the login page, don't show the sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const mainLinks = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/kuesioner", icon: ClipboardList, label: "Kuesioner" },
    { href: "/admin/export", icon: Download, label: "Export Data CSV" },
  ];

  const educationLinks = [
    { href: "/admin/artikel", icon: FileText, label: "Artikel Laktasi" },
    { href: "/admin/video", icon: Video, label: "Video Edukasi" },
  ];

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col bg-white border-r border-gray-200 z-10 shadow-sm">
        <div className="h-20 flex items-center px-8 border-b border-gray-100 shrink-0">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 relative rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
              <Image src="/logo.png" alt="Logo" fill className="object-cover" />
            </div>
            <span className="text-xl font-black text-gray-800 tracking-tight">hypnomom <span className="text-primary">Admin</span></span>
          </Link>
        </div>

        <nav className="flex-1 p-6 space-y-6 overflow-y-auto">
          
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Menu Utama</p>
            {mainLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-semibold ${
                    isActive 
                      ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                  }`}
                >
                  <Icon size={20} className={isActive ? "text-white" : "text-gray-400"} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Education</p>
            {educationLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-semibold ${
                    isActive 
                      ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                  }`}
                >
                  <Icon size={20} className={isActive ? "text-white" : "text-gray-400"} />
                  {link.label}
                </Link>
              );
            })}
          </div>

        </nav>

        <div className="p-6 border-t border-gray-100 shrink-0">
          <DesktopAdminLogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-20">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 relative rounded-md overflow-hidden bg-primary/10">
              <Image src="/logo.png" alt="Logo" fill className="object-cover" />
            </div>
            <span className="font-black text-gray-800">hypnomom</span>
          </Link>
          <MobileAdminNav />
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
          <div className="max-w-6xl mx-auto w-full pb-20">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
