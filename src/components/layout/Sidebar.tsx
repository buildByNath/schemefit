"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Gift, 
  Users, 
  Files, 
  FileCheck, 
  Calendar, 
  MessageSquare, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Benefits", href: "/benefits", icon: Gift },
  { title: "Family", href: "/family", icon: Users },
  { title: "Documents", href: "/documents", icon: Files },
  { title: "Applications", href: "/applications", icon: FileCheck },
  { title: "Calendar", href: "/calendar", icon: Calendar },
  { title: "Assistant", href: "/assistant", icon: MessageSquare },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex w-[200px] flex-col gap-2 p-4 h-[calc(100vh-3.5rem)] border-r">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.title}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
              isActive ? "bg-muted text-primary font-medium" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

export function getNavigationItems() {
  return items;
}
