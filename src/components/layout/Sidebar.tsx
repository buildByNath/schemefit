"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Gift, 
  Users, 
  Files, 
  FileCheck, 
  MessageSquare, 
  Settings,
  Building2,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUserAction } from "@/app/actions";

const baseItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Benefits", href: "/dashboard/benefits", icon: Gift },
  { title: "My Family", href: "/dashboard/family", icon: Users },
  { title: "My Documents", href: "/dashboard/documents", icon: Files },
  { title: "SmartDoc Studio", href: "/dashboard/smartdoc", icon: Settings },
  { title: "My Applications", href: "/dashboard/applications", icon: FileCheck },
  { title: "AI Chatbot", href: "/dashboard/chatbot", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isProviderRole, setIsProviderRole] = useState(false);

  useEffect(() => {
    async function checkRole() {
      const res = await getCurrentUserAction();
      if (res.success && res.user) {
        const u = res.user;
        if (
          u.role === "ngo" || 
          u.role === "private_sector" || 
          u.occupation === "NGO/Private sector" || 
          u.occupation === "NGO" || 
          u.occupation === "Private Sector"
        ) {
          setIsProviderRole(true);
        }
      }
    }
    checkRole();
  }, [pathname]);

  const navigationItems = [
    ...baseItems,
    ...(isProviderRole ? [{ title: "Provider Portal", href: "/dashboard/provider", icon: Building2, isProviderOnly: true }] : [])
  ];

  return (
    <nav aria-label="Main navigation" className="hidden md:flex w-[200px] flex-col justify-between gap-2 p-4 h-[calc(100vh-3.5rem)] border-r bg-white">
      <div className="space-y-1">
        {navigationItems.map((item: any) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.title}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer",
                isActive 
                  ? "bg-[#0369A1]/8 text-[#0369A1] font-semibold" 
                  : item.isProviderOnly
                  ? "text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 font-semibold border border-emerald-200/60"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-[#0369A1]" : item.isProviderOnly ? "text-emerald-600" : "text-slate-400")} />
              <span>{item.title}</span>
              {item.isProviderOnly && (
                <span className="ml-auto flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Role View Demo Switcher */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <p className="px-1 text-[10px] font-semibold text-slate-400">Role View</p>
        <button
          onClick={() => setIsProviderRole(!isProviderRole)}
          className={`w-full p-2.5 rounded-lg border text-[11px] font-semibold flex items-center justify-between gap-2 transition-all cursor-pointer ${
            isProviderRole
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-slate-50 border-slate-200 text-slate-700"
          }`}
          title="Toggle view between Student and NGO/Private Sector"
        >
          <div className="flex items-center gap-1.5 truncate">
            {isProviderRole ? (
              <>
                <Building2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">NGO / Sponsor</span>
              </>
            ) : (
              <>
                <UserCheck className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="truncate">Beneficiary</span>
              </>
            )}
          </div>
          <span className="text-[9px] font-semibold text-slate-400 shrink-0">switch</span>
        </button>
      </div>
    </nav>
  );
}

export function getNavigationItems() {
  return baseItems;
}
