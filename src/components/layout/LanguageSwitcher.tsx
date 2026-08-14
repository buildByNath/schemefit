"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState("en");

  useEffect(() => {
    // Read the current language from cookie on mount
    const match = document.cookie.match(/(^| )NEXT_LOCALE=([^;]+)/);
    if (match) {
      setCurrentLang(match[2]);
    }
  }, []);

  const handleLanguageChange = (value: string) => {
    setCurrentLang(value);
    
    // Set cookie that expires in 1 year
    const d = new Date();
    d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
    document.cookie = `NEXT_LOCALE=${value};expires=${d.toUTCString()};path=/`;
    
    // Refresh the router to trigger server components to re-render with new cookie
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1.5 relative">
      <Globe className="h-4 w-4 text-slate-500 absolute left-2 pointer-events-none" />
      <select
        value={currentLang}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="h-8 pl-7 pr-8 py-1 text-xs border border-slate-200 bg-slate-50 font-medium rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-[#0369A1] cursor-pointer"
        aria-label="Select language"
      >
        <option value="en">English</option>
        <option value="hi">हिंदी</option>
        <option value="ta">தமிழ்</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
        <svg className="h-3 w-3 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}
