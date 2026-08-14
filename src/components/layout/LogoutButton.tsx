"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout}
      className="p-2 hover:bg-accent rounded-full transition-colors text-red-500 hover:text-red-600"
      title="Sign Out"
    >
      <LogOut className="h-5 w-5" />
      <span className="sr-only">Sign out</span>
    </button>
  );
}
