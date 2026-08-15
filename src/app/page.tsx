import { VoiceOnboarding } from "@/components/VoiceOnboarding";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { getUser } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getUser();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Banner */}
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900 tracking-tight">
            <span>SchemeFit</span>
          </div>
          {user && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
              style={{ minHeight: "40px" }}
            >
              <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
            </Link>
          )}
        </div>
      </header>

      {/* Main intake UI */}
      <main className="flex-1 flex flex-col items-center justify-center py-12">
        <VoiceOnboarding />
      </main>

    </div>
  );
}
