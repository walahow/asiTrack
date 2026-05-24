"use client";

import { LucideIcon } from "lucide-react";

interface BadgeIconProps {
  icon: LucideIcon;
  showBadge: boolean;
  size?: number;
  className?: string;
}

export default function BadgeIcon({ icon: Icon, showBadge, size = 20, className }: BadgeIconProps) {
  return (
    <div className="relative inline-flex items-center justify-center">
      <Icon size={size} className={className} />
      {showBadge && (
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 z-30">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-white"></span>
        </span>
      )}
    </div>
  );
}
