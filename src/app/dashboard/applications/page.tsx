import React from "react";
import { redirect } from "next/navigation";
import { getUser, getApplications } from "@/lib/db";
import { ApplicationsList } from "@/components/ApplicationsList";
import { FileCheck } from "lucide-react";

export const revalidate = 0; // Force dynamic rendering

export default async function ApplicationsPage() {
  const user = await getUser();
  
  // If user details are not initialized, redirect to onboarding
  if (!user || !user.annual_income || !user.caste_category) {
    redirect("/");
  }

  const applications = await getApplications(user.id);

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

      <ApplicationsList applications={applications} user={user} />
    </div>
  );
}
