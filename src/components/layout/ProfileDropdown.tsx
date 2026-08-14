"use client";

import { useState, useRef, useEffect } from "react";
import {
  User,
  Mail,
  Briefcase,
  GraduationCap,
  IndianRupee,
  Users,
  MapPin,
  ChevronRight,
  LogOut,
  Settings,
  Calendar,
  Heart,
  Accessibility,
  Activity,
  FileText
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ProfileData {
  full_name: string;
  email: string;
  caste_category?: string | null;
  annual_income?: number | null;
  occupation?: string | null;
  education?: string | null;
  state?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  marital_status?: string | null;
  religion?: string | null;
  is_differently_abled?: boolean | null;
  bpl_status?: boolean | null;
}

interface ProfileDropdownProps {
  user: ProfileData | null;
}

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="relative" ref={ref}>
      {/* Profile Avatar Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm ring-2 ring-indigo-200 hover:ring-indigo-300"
        aria-label="Open profile"
        id="profile-btn"
      >
        {initials}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          role="menu"
        >
          {/* Header gradient */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-lg font-bold border-2 border-white/30 flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-base truncate">
                  {user?.full_name || "Unknown User"}
                </p>
                <p className="text-indigo-200 text-xs truncate">
                  {user?.email || "No email"}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Profile Details
            </p>

            {[
              {
                icon: Users,
                label: "Category",
                value: user?.caste_category,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                icon: IndianRupee,
                label: "Annual Income",
                value: user?.annual_income
                  ? `₹${user.annual_income.toLocaleString("en-IN")}`
                  : null,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                icon: Briefcase,
                label: "Occupation",
                value: user?.occupation,
                color: "text-purple-600",
                bg: "bg-purple-50",
              },
              {
                icon: GraduationCap,
                label: "Education",
                value: user?.education,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
              {
                icon: MapPin,
                label: "State",
                value: user?.state,
                color: "text-rose-600",
                bg: "bg-rose-50",
              },
              {
                icon: Calendar,
                label: "DOB / Age",
                value: user?.date_of_birth,
                color: "text-orange-600",
                bg: "bg-orange-50",
              },
              {
                icon: User,
                label: "Gender & Marital",
                value: [user?.gender, user?.marital_status].filter(Boolean).join(", "),
                color: "text-pink-600",
                bg: "bg-pink-50",
              },
              {
                icon: Heart,
                label: "Religion",
                value: user?.religion,
                color: "text-violet-600",
                bg: "bg-violet-50",
              },
              {
                icon: Accessibility,
                label: "Differently Abled",
                value: user?.is_differently_abled === true ? "Yes" : user?.is_differently_abled === false ? "No" : null,
                color: "text-cyan-600",
                bg: "bg-cyan-50",
              },
              {
                icon: Activity,
                label: "BPL Status",
                value: user?.bpl_status === true ? "Yes (Card Holder)" : user?.bpl_status === false ? "No" : null,
                color: "text-teal-600",
                bg: "bg-teal-50",
              },
              {
                icon: Mail,
                label: "Email",
                value: user?.email,
                color: "text-slate-600",
                bg: "bg-slate-100",
              },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {value || (
                      <span className="text-slate-300 font-normal italic">Not set</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="border-t border-slate-100 p-2">
            <a
              href="/"
              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Settings className="h-3.5 w-3.5 text-slate-500" />
              Edit Profile
              <ChevronRight className="h-3 w-3 text-slate-300 ml-auto" />
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
              <ChevronRight className="h-3 w-3 text-red-200 ml-auto" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
