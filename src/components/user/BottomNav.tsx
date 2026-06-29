"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, BookOpen, PlaySquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", icon: Home, label: "Beranda" },
    { href: "/form", icon: ClipboardList, label: "Form" },
    { href: "/pojok-baca", icon: BookOpen, label: "Artikel" },
    { href: "/video", icon: PlaySquare, label: "Video" },
    { href: "/profile", icon: User, label: "Profil" },
  ];

  return (
    <nav className="fixed bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-white/80 rounded-[2rem] z-50 shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:hidden pb-safe">
      <div className="flex items-center justify-around px-2 py-2.5">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center justify-center w-full relative"
            >
              <div 
                className={cn(
                  "flex items-center justify-center p-2 rounded-xl transition-all duration-300",
                  isActive ? "bg-primary/10 text-primary scale-110" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                )}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span 
                className={cn(
                  "text-[10px] font-bold mt-1 transition-all duration-300",
                  isActive ? "text-primary opacity-100" : "text-gray-400 opacity-80"
                )}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
