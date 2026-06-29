"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, BookOpen, PlayCircle, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

export default function DesktopUserSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Beranda", href: "/dashboard", icon: Home },
    { name: "Artikel Edukasi", href: "/pojok-baca", icon: BookOpen },
    { name: "Video Panduan", href: "/video", icon: PlayCircle },
    { name: "Profil Saya", href: "/profile", icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-20 left-0 top-0">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-xl bg-white border border-primary/10 shadow-sm overflow-hidden">
          <Image
            src="/logo.png"
            alt="hypnomom Logo"
            fill
            sizes="40px"
            className="object-cover"
            priority
          />
        </div>
        <h1 className="text-xl font-black text-primary tracking-tight font-sans">
          hypnomom
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu Utama</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200",
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-gray-600 hover:bg-gray-50 hover:text-primary"
              )}
            >
              <Icon size={20} className={cn("shrink-0", isActive ? "text-white" : "text-gray-400")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-6 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 px-4 py-3 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} className="text-red-500" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
