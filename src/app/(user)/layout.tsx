import FabNav from "@/components/user/FabNav";
import TimeTravelWidget from "@/components/user/TimeTravelWidget";
import DesktopTopNav from "@/components/user/DesktopTopNav";
import { ReactNode } from "react";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] relative flex flex-col md:pt-16">
      
      {/* 1. Desktop Navigation (Hidden on mobile) */}
      <DesktopTopNav />

      {/* 2. Main Content Area */}
      {/* 
        - On mobile: pb-24 ensures content isn't hidden behind the bottom nav 
        - On desktop: it centers perfectly under the top nav
      */}
      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full pb-24 md:pb-0">
        {children}
      </main>

      {/* 3. Mobile Navigation (Hidden on desktop) */}
      <div className="md:hidden">
        <FabNav />
      </div>
      
      {process.env.NODE_ENV !== "production" && <TimeTravelWidget />}
    </div>
  );
}
