"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function DesktopAdminLogoutButton() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-3 px-3 py-2 w-full text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium"
    >
      <LogOut size={20} />
      Logout
    </button>
  );
}
