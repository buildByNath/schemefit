import React from "react";
import { getUser, getSchemes, getApplications } from "@/lib/db";
import { getEligibleSchemes } from "@/lib/matching";
import { getDictionary } from "@/lib/i18n";
import { BenefitsList } from "@/components/BenefitsList";
import { Gift, AlertCircle } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function BenefitsPage() {
  const user = await getUser();
  const dict = await getDictionary();
  const isProfileIncomplete = !user || !user.annual_income || !user.caste_category;

  const allSchemes = await getSchemes();
  const userApps = isProfileIncomplete ? [] : await getApplications(user!.id);
  const eligibleSchemes = isProfileIncomplete ? [] : getEligibleSchemes(user!, allSchemes);
  const appliedSchemeIds = userApps.map(app => app.scheme_id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6 md:p-8 bg-slate-50 min-h-screen">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-wider">
          <Gift className="h-3.5 w-3.5" />
          {dict.benefits.tag}
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          {dict.benefits.title}
        </h1>
        <p className="text-slate-500 text-xs max-w-xl">
          {dict.benefits.desc}
        </p>
      </div>

      {isProfileIncomplete ? (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">{dict.applications.profile_incomplete}</p>
            <p className="text-xs text-amber-600 mt-0.5">{dict.benefits.profile_desc}</p>
          </div>
          <Link href="/" className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-2 rounded-lg transition-colors">
            {dict.applications.setup_profile}
          </Link>
        </div>
      ) : (
        <BenefitsList
          eligibleSchemes={eligibleSchemes}
          user={user!}
          appliedSchemeIds={appliedSchemeIds}
        />
      )}
    </div>
  );
}
