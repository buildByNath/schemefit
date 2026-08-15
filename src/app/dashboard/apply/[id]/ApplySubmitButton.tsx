"use client";

import React, { useTransition } from "react";
import { applyToScheme } from "@/app/actions";
import { Loader2, Send, CheckCircle2, ChevronRight, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function ApplySubmitButton({ schemeId }: { schemeId: string }) {
  const [isPending, startTransition] = useTransition();
  const [handoffStarted, setHandoffStarted] = React.useState(false);
  const router = useRouter();

  const handleApply = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/apply-real", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schemeId })
        });
        const data = await res.json();
        
        if (data.success) {
          setHandoffStarted(true);
          // We also trigger the actual DB application so it shows up in "My Applications"
          await applyToScheme(schemeId);
        } else {
          alert("Automation failed: " + data.error);
        }
      } catch (e) {
        console.error(e);
        alert("Network error during automation.");
      }
    });
  };

  if (handoffStarted) {
    return (
      <div className="flex flex-col items-center justify-center w-full space-y-6 py-6 animate-in fade-in zoom-in duration-500">
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3 w-full max-w-lg shadow-sm">
          <div className="bg-emerald-100 p-2 rounded-full">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Action Required: Complete Application</h4>
            <p className="text-xs text-emerald-600/80">Playwright has securely launched the official government portal. Please look at the newly opened window to complete your application.</p>
          </div>
        </div>

        <button 
          onClick={() => router.push("/dashboard/applications")}
          className="bg-[#0F172A] hover:bg-[#1e293b] text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          I have submitted the form <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleApply}
      disabled={isPending}
      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
    >
      {isPending ? (
        <><Loader2 className="h-5 w-5 animate-spin" /> Running Playwright Engine...</>
      ) : (
        <>Submit Verified Application <Send className="h-4 w-4 ml-1" /></>
      )}
    </button>
  );
}
