import { Bell } from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import { MobileNav } from "./MobileNav";
import { ProfileDropdown } from "./ProfileDropdown";
import { getUser } from "@/lib/db";

export async function Header() {
  const activeUser = await getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="md:hidden">
          <MobileNav />
        </div>
        <div className="flex items-center gap-2 font-bold md:w-[200px]">
          <span className="hidden md:inline-block text-xl tracking-tight">SchemeFit</span>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <span className="text-sm font-medium text-muted-foreground mr-2 hidden sm:inline">
            {activeUser?.full_name || "Guest"}
          </span>

          <LogoutButton />

          {/* Notification bell */}
          <button className="relative p-2 hover:bg-accent rounded-full transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600"></span>
            <span className="sr-only">Notifications</span>
          </button>

          {/* Profile dropdown — replaces static User icon */}
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
