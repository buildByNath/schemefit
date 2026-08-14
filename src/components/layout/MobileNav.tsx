"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { getNavigationItems } from "./Sidebar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = getNavigationItems();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<button className="md:hidden p-2 -ml-2 hover:bg-accent rounded-md" />}>
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle Menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">Navigate through SATURNX</SheetDescription>
        <div className="flex flex-col gap-2 p-4 pt-10">
          <div className="text-xl font-bold mb-4 px-2">SATURNX</div>
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-4 rounded-lg px-4 py-3 transition-all", // large 48px touch targets for mobile
                  isActive ? "bg-muted text-primary font-medium" : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-base">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
