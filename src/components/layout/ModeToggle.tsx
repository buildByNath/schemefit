"use client";

import React, { useTransition } from "react";
import { toggleUserModeAction } from "@/app/actions";
import { Sparkles, User, RefreshCw } from "lucide-react";

interface ModeToggleProps {
  currentMode: string;
  userName: string;
}

export function ModeToggle({ currentMode, userName }: ModeToggleProps) {
  const [isPending, startTransition] = useTransition();
  const isDemo = currentMode === "demo" || !currentMode;

  const handleToggle = () => {
    startTransition(async () => {
      await toggleUserModeAction();
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`relative flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold shadow-sm transition-all duration-300 group cursor-pointer ${
        isDemo
          ? "bg-indigo-50/80 hover:bg-indigo-100/80 border-indigo-200 text-indigo-700 hover:border-indigo-300 animate-pulse"
          : "bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-200 text-emerald-700 hover:border-emerald-300"
      }`}
      style={{ minHeight: "36px" }}
      title={isDemo ? "Switch to User Mode" : "Switch to Demo Mode"}
    >
      {/* Pulsing indicator dot */}
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDemo ? "bg-indigo-400" : "bg-emerald-400"}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isDemo ? "bg-indigo-500" : "bg-emerald-500"}`}></span>
      </span>

      <span className="flex items-center gap-1">
        {isPending ? (
          <RefreshCw className="h-3 w-3 animate-spin text-slate-500" />
        ) : isDemo ? (
          <Sparkles className="h-3.5 w-3.5 text-indigo-500 group-hover:scale-110 transition-transform" />
        ) : (
          <User className="h-3.5 w-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
        )}
        <span className="hidden sm:inline font-bold tracking-wide uppercase text-[10px]">
          {isDemo ? "Demo Profile" : "User Profile"}
        </span>
      </span>

      <div className="h-3 w-px bg-slate-300/60 hidden sm:block"></div>

      <span className="text-slate-700 max-w-[100px] truncate text-[11px] font-medium hidden sm:inline-block">
        {userName}
      </span>
    </button>
  );
}
