"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
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
  phone?: string | null;
  district?: string | null;
  address?: string | null;
  exchange_reg?: string | null;
  aadhar?: string | null;
  bank_account?: string | null;
  ifsc_code?: string | null;
  bank_name?: string | null;
}

interface ProfileDropdownProps {
  user: ProfileData | null;
}

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const supabase = createClient();

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
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="flex justify-between py-1.5">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="text-slate-900 text-right truncate max-w-[140px]" title={String(value || "Not set")}>
        {value || <span className="text-slate-300 italic">Not set</span>}
      </span>
    </div>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm ring-2 ring-transparent focus:ring-slate-200"
        aria-label="Open profile"
        id="profile-btn"
      >
        {initials}
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right"
          role="menu"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold border border-slate-200 flex-shrink-0">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user?.full_name || "Unknown User"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.email || "No email provided"}
              </p>
            </div>
          </div>

          {/* Scrollable Details */}
          <div className="p-4 max-h-[60vh] overflow-y-auto text-xs space-y-4">
            
            <div>
              <p className="font-semibold text-slate-900 mb-1 border-b border-slate-100 pb-1">Personal</p>
              <InfoRow label="DOB" value={user?.date_of_birth} />
              <InfoRow label="Gender" value={user?.gender} />
              <InfoRow label="Category" value={user?.caste_category} />
              <InfoRow label="Religion" value={user?.religion} />
              <InfoRow label="Differently Abled" value={user?.is_differently_abled ? "Yes" : user?.is_differently_abled === false ? "No" : null} />
            </div>

            <div>
              <p className="font-semibold text-slate-900 mb-1 border-b border-slate-100 pb-1">Contact & Address</p>
              <InfoRow label="Phone" value={user?.phone} />
              <InfoRow label="State" value={user?.state} />
              <InfoRow label="District" value={user?.district} />
              <InfoRow label="Address" value={user?.address} />
            </div>

            <div>
              <p className="font-semibold text-slate-900 mb-1 border-b border-slate-100 pb-1">Employment & Income</p>
              <InfoRow label="Education" value={user?.education} />
              <InfoRow label="Occupation" value={user?.occupation} />
              <InfoRow label="Income" value={user?.annual_income ? `₹${user.annual_income.toLocaleString("en-IN")}` : null} />
              <InfoRow label="BPL Status" value={user?.bpl_status ? "Yes" : user?.bpl_status === false ? "No" : null} />
              <InfoRow label="Exchange Reg." value={user?.exchange_reg} />
            </div>

            <div>
              <p className="font-semibold text-slate-900 mb-1 border-b border-slate-100 pb-1">Identity & Bank</p>
              <InfoRow label="Aadhaar" value={user?.aadhar} />
              <InfoRow label="Bank Name" value={user?.bank_name} />
              <InfoRow label="Account No." value={user?.bank_account} />
              <InfoRow label="IFSC Code" value={user?.ifsc_code} />
            </div>
            
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-100 p-1 bg-slate-50">
            <a
              href="/"
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/50 hover:text-slate-900 rounded-md transition-colors"
            >
              <Settings className="h-4 w-4 text-slate-500" />
              Edit Profile
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4 text-red-500" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
