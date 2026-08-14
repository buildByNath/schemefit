import React from "react";
import { redirect } from "next/navigation";
import { getUser, getSchemes, getApplications, getFamilyMembers } from "@/lib/db";
import { getEligibleSchemes } from "@/lib/matching";
import { FamilyWealth } from "@/components/FamilyWealth";
import { Users } from "lucide-react";
import { demoUser } from "@/lib/seed";

export const revalidate = 0; // Force dynamic rendering

export default async function FamilyPage() {
  const user = await getUser();
  
  // If user details are not initialized (or empty), redirect to onboarding
  if (!user || !user.annual_income || !user.caste_category) {
    redirect("/");
  }

  const familyMembers = await getFamilyMembers(user.id);
  const allSchemes = await getSchemes();
  const userApps = await getApplications(user.id);
  
  // Get eligible schemes for the household
  const eligibleSchemes = getEligibleSchemes(user, allSchemes);
  
  // Pass as plain string[] — Set is NOT serializable across the Server→Client boundary
  const appliedSchemeIds = userApps.map(app => app.scheme_id);
  const isDemo = user.id === demoUser.id;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6 md:p-8 bg-slate-50 min-h-screen">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-wider">
          <Users className="h-3.5 w-3.5" />
          Household Savings & Wealth
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          My Family Benefits Ledger
        </h1>
        <p className="text-slate-500 text-xs max-w-xl">
          Track the direct welfare distributions received by individual family members and view potential unclaimed benefits with clear cash payouts.
        </p>
      </div>

      <FamilyWealth
        familyMembers={familyMembers}
        eligibleSchemes={eligibleSchemes}
        appliedSchemeIds={appliedSchemeIds}
        isDemoMode={isDemo}
      />
    </div>
  );
}
