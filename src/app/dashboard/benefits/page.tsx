import React from "react";
import { redirect } from "next/navigation";
import { getUser, getSchemes, getApplications } from "@/lib/db";
import { getEligibleSchemes } from "@/lib/matching";
import { BenefitsList } from "@/components/BenefitsList";
import { Gift } from "lucide-react";

export const revalidate = 0;

export default async function BenefitsPage() {
  const user = await getUser();

  if (!user || !user.annual_income || !user.caste_category) {
    redirect("/");
  }

  const allSchemes = await getSchemes();
  const userApps = await getApplications(user.id);
  const eligibleSchemes = getEligibleSchemes(user, allSchemes);

  // Pass plain string[] - Set is not serializable across the RSC boundary
  const appliedSchemeIds = userApps.map(app => app.scheme_id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6 md:p-8 bg-slate-50 min-h-screen">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-wider">
          <Gift className="h-3.5 w-3.5" />
          Document Matching Directory
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          My Welfare Benefits
        </h1>
        <p className="text-slate-500 text-xs max-w-xl">
          Review the list of matching programs, toggle documents in your vault, and monitor your exact completion status before submitting applications to government departments.
        </p>
      </div>

      <BenefitsList
        eligibleSchemes={eligibleSchemes}
        user={user}
        appliedSchemeIds={appliedSchemeIds}
      />
    </div>
  );
}
