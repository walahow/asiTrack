"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Home, BookOpen, PlaySquare, User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function DesktopTopNav() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  const navItems = [
    { name: "Beranda", href: "/dashboard", icon: <Home size={18} /> },
    { name: "Artikel Edukasi", href: "/pojok-baca", icon: <BookOpen size={18} /> },
    { name: "Video Panduan", href: "/video", icon: <PlaySquare size={18} /> },
  ];

  return (
    <nav className="hidden md:flex fixed top-0 inset-x-0 h-16 bg-white border-b border-gray-100 z-50 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      <div className="max-w-6xl mx-auto w-full px-6 flex items-center justify-between">
        
        {/* Left: Logo & Brand */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-primary/5 p-1 border border-primary/10 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Image
              src="/logo.png"
              alt="hypemom Logo"
              fill
              sizes="32px"
              className="object-contain p-0.5"
              priority
            />
          </div>
          <span className="font-black text-xl tracking-tight text-primary font-sans">
            hypemom
          </span>
        </Link>

        {/* Center: Navigation Links */}
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right: Profile & Logout */}
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              pathname === "/profile"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-gray-500 hover:text-primary hover:bg-primary/5 border border-transparent"
            }`}
          >
            <User size={18} />
            <span>Profil</span>
          </Link>
          
          <div className="h-6 w-px bg-gray-200"></div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors text-sm font-bold group"
          >
            <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </nav>
  );
}
