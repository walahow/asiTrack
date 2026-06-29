import BottomNav from "@/components/user/BottomNav";
import TimeTravelWidget from "@/components/user/TimeTravelWidget";
import DesktopTopNav from "@/components/user/DesktopTopNav";
import { ReactNode } from "react";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-fuchsia-100 relative flex flex-col md:pt-16 overflow-hidden z-0">
      {/* Background decorative shapes */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[40%] bg-purple-300/40 rounded-full blur-[100px] -z-10"></div>
      <div className="fixed bottom-[10%] right-[-10%] w-[60%] h-[50%] bg-indigo-300/30 rounded-full blur-[120px] -z-10 animate-pulse"></div>

      {/* 1. Desktop Navigation (Hidden on mobile) */}
      <DesktopTopNav />

      {/* 2. Main Content Area */}
      {/* 
        - On mobile: pb-24 ensures content isn't hidden behind the bottom nav 
        - On desktop: it centers perfectly under the top nav
      */}
      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full pb-24 md:pb-0 relative z-10">
        {children}
      </main>

      {/* 3. Mobile Navigation (Hidden on desktop) */}
      <BottomNav />
      
      {process.env.NODE_ENV !== "production" && <TimeTravelWidget />}
    </div>
  );
}
