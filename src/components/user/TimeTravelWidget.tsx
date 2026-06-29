"use client";

import { useState, useEffect } from "react";
import { FastForward, RotateCcw, ChevronUp, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TimeTravelWidget() {
  const router = useRouter();
  const [offset, setOffset] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Note: Only intended for development/testing
  // In a real production app, this should be hidden behind an env var check

  useEffect(() => {
    // Read current cookie on mount
    const match = document.cookie.match(new RegExp('(^| )hypnomom_timeOffsetDays=([^;]+)'));
    if (match && match[2]) {
      setOffset(parseInt(match[2], 10));
    }
  }, []);

  const updateOffset = (newOffset: number) => {
    // Set cookie to expire in 1 day, accessible across the app
    document.cookie = `hypnomom_timeOffsetDays=${newOffset}; path=/; max-age=86400`;
    setOffset(newOffset);
    // Force a full refresh to re-run server side logic
    window.location.reload();
  };

  const handleIncrement = () => updateOffset(offset + 1);
  const handleDecrement = () => updateOffset(offset - 1);
  const handleReset = () => updateOffset(0);

  if (!isExpanded) {
    return (
      <button 
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-all opacity-80 hover:opacity-100"
        title="Buka Simulator Waktu (Dev)"
      >
        <FastForward size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 bg-gray-900 text-white p-4 rounded-2xl shadow-2xl border border-gray-700 flex flex-col gap-3 min-w-[200px] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <FastForward size={14} className="text-amber-400" />
          <span className="text-xs font-bold text-gray-200">Dev Time Simulator</span>
        </div>
        <button 
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl p-3 flex flex-col items-center justify-center border border-gray-700">
        <span className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">Offset Hari Ini</span>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleDecrement}
            className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white transition-colors"
          >
            -1
          </button>
          <span className="text-xl font-black text-amber-400 min-w-[40px] text-center">
            {offset > 0 ? `+${offset}` : offset}
          </span>
          <button 
            onClick={handleIncrement}
            className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white transition-colors"
          >
            +1
          </button>
        </div>
      </div>

      <button 
        onClick={handleReset}
        disabled={offset === 0}
        className="w-full py-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-rose-500/20"
      >
        <RotateCcw size={14} />
        Reset ke Hari Asli
      </button>
    </div>
  );
}
