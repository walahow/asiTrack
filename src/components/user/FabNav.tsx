"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Orbit, Home, BookOpen, PlayCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import BadgeIcon from "./BadgeIcon";

export default function FabNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [showWarningDot, setShowWarningDot] = useState(false);

  // Close menu when route changes and fetch profile completion status
  useEffect(() => {
    setIsOpen(false);
    
    async function checkProfileStatus() {
      try {
        const res = await fetch("/api/user/profile");
        const data = await res.json();
        if (res.ok && data.status === "success") {
          // If profile is NOT fully filled, show warning dot!
          setShowWarningDot(!data.profile_fully_filled);
        }
      } catch (err) {
        console.error("Failed to check profile completion status in FabNav", err);
      }
    }
    checkProfileStatus();
  }, [pathname]);

  const navItems = [
    { name: "Profil", href: "/profile", icon: User },
    { name: "Video", href: "/video", icon: PlayCircle },
    { name: "Artikel", href: "/pojok-baca", icon: BookOpen },
    { name: "Beranda", href: "/dashboard", icon: Home },
  ];

  return (
    <>
      {/* Background Dimmer */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-white/60 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Menu Items */}
        <div className={cn(
          "flex flex-col items-end gap-3 transition-all duration-300 origin-bottom",
          isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none"
        )}>
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <div 
                key={item.href} 
                className="flex items-center gap-3 transition-all duration-300"
                style={{ 
                  transform: isOpen ? 'translateY(0)' : `translateY(${20 * (index + 1)}px)`,
                  transitionDelay: `${(navItems.length - index) * 50}ms`
                }}
              >
                <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-sm font-bold text-gray-700 shadow-sm border border-gray-100">
                  {item.name}
                </span>
                <Link
                  href={item.href}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110",
                    isActive ? "bg-primary text-white" : "bg-white text-primary"
                  )}
                >
                  <BadgeIcon 
                    icon={Icon} 
                    showBadge={item.name === "Profil" && showWarningDot} 
                    size={20} 
                  />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Main FAB */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-primary/30 transition-all duration-500 relative",
            isOpen ? "bg-white text-primary rotate-180" : "bg-primary text-white"
          )}
        >
          <BadgeIcon 
            icon={Orbit} 
            showBadge={!isOpen && showWarningDot} 
            size={28} 
          />
        </button>
      </div>
    </>
  );
}
