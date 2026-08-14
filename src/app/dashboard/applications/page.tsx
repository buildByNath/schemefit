import React from "react";
import { getUser, getApplications } from "@/lib/db";
import { ApplicationsList } from "@/components/ApplicationsList";
import { FileCheck, AlertCircle } from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Force dynamic rendering

export default async function ApplicationsPage() {
  const user = await getUser();
  const isProfileIncomplete = !user || !user.annual_income || !user.caste_category;

  const applications = isProfileIncomplete ? [] : await getApplications(user!.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6 md:p-8 bg-slate-50 min-h-screen">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-medium text-xs">
          Applications Vault
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          My Applications
        </h1>
        <p className="text-slate-500 text-sm max-w-xl">
          Track active welfare benefits status, review disapproved filings, and instantly compile statutory grievance complaints or RTI delay requests.
        </p>
      </div>

      {isProfileIncomplete ? (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Complete your profile first</p>
            <p className="text-xs text-amber-600 mt-0.5">You need a profile to start applying for welfare schemes.</p>
          </div>
          <Link href="/" className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-2 rounded-lg transition-colors">
            Setup Profile →
          </Link>
        </div>
      ) : (
        <ApplicationsList applications={applications} user={user!} />
      )}
    </div>
  );
}
