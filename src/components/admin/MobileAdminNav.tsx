"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, FileText, Video, ClipboardList, Download, LogOut } from "lucide-react";

export default function MobileAdminNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button */}
      <button 
        onClick={toggleMenu}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Menu size={24} />
      </button>

      {/* Full Screen Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col md:hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="h-20 border-b border-gray-100 flex items-center justify-between px-6 bg-white">
            <h2 className="text-xl font-bold text-primary tracking-tight">Menu Admin</h2>
            <button 
              onClick={closeMenu}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">Menu Utama</p>
              <Link 
                href="/admin" 
                onClick={closeMenu}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors font-semibold ${pathname === "/admin" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-700 hover:bg-white hover:shadow-sm"}`}
              >
                <LayoutDashboard size={22} className={pathname === "/admin" ? "text-white" : "text-gray-500"} />
                Dashboard
              </Link>
              <Link 
                href="/admin/kuesioner" 
                onClick={closeMenu}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors font-semibold ${pathname === "/admin/kuesioner" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-700 hover:bg-white hover:shadow-sm"}`}
              >
                <ClipboardList size={22} className={pathname === "/admin/kuesioner" ? "text-white" : "text-gray-500"} />
                Kuesioner
              </Link>
              <Link 
                href="/admin/export" 
                onClick={closeMenu}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors font-semibold ${pathname === "/admin/export" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-700 hover:bg-white hover:shadow-sm"}`}
              >
                <Download size={22} className={pathname === "/admin/export" ? "text-white" : "text-gray-500"} />
                Export Data CSV
              </Link>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">Education</p>
              <Link 
                href="/admin/artikel" 
                onClick={closeMenu}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors font-semibold ${pathname === "/admin/artikel" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-700 hover:bg-white hover:shadow-sm"}`}
              >
                <FileText size={22} className={pathname === "/admin/artikel" ? "text-white" : "text-gray-500"} />
                Artikel Laktasi
              </Link>
              <Link 
                href="/admin/video" 
                onClick={closeMenu}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors font-semibold ${pathname === "/admin/video" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-700 hover:bg-white hover:shadow-sm"}`}
              >
                <Video size={22} className={pathname === "/admin/video" ? "text-white" : "text-gray-500"} />
                Video Edukasi
              </Link>
            </div>
          </nav>
          
          <div className="p-6 border-t border-gray-100 bg-white">
            <button 
              onClick={async () => {
                const { signOut } = await import("next-auth/react");
                await signOut({ callbackUrl: "/admin/login" });
              }}
              className="flex items-center justify-center gap-3 px-4 py-3.5 w-full bg-red-50 text-red-600 rounded-xl transition-colors font-bold hover:bg-red-100"
            >
              <LogOut size={22} />
              Logout dari Portal
            </button>
          </div>
        </div>
      )}
    </>
  );
}
