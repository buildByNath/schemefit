import { LogoutButton } from "./LogoutButton";
import { MobileNav } from "./MobileNav";
import { ProfileDropdown } from "./ProfileDropdown";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { getUser } from "@/lib/db";

export async function Header() {
  const activeUser = await getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/98 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="container flex h-14 items-center justify-between gap-4">

        {/* Logo — visible on all sizes */}
        <div className="flex items-center gap-2 select-none shrink-0">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true" className="shrink-0">
            <rect width="26" height="26" rx="6" fill="#0F172A"/>
            {/* S letterform simplified as a scheme-path */}
            <path d="M8 9.5C8 8.12 9.12 7 10.5 7h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h3a1.5 1.5 0 0 1 0 3h-4C8.88 16 8 14.88 8 13.5" stroke="#0369A1" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M18 8v10" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.3"/>
          </svg>
          <span className="text-[15px] font-bold tracking-tight text-slate-900 hidden sm:inline">SchemeFit</span>
        </div>

        {/* Mobile hamburger — right of logo on mobile */}
        <div className="md:hidden flex-1 flex justify-end">
          <MobileNav />
        </div>

        {/* Right side nav */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <span className="text-sm text-slate-500">
            {activeUser?.full_name || "Guest"}
          </span>
          <LogoutButton />
          <ProfileDropdown
            user={activeUser ? {
              full_name: activeUser.full_name,
              email: activeUser.email,
              caste_category: activeUser.caste_category,
              annual_income: activeUser.annual_income,
              occupation: activeUser.occupation,
              education: activeUser.education,
              state: activeUser.state,
            } : null}
          />
        </div>
      </div>
    </header>
  );
}
