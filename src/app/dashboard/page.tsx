import React from "react";
import { getUser, getSchemes, getApplications, getFamilyMembers } from "@/lib/db";
import { getEligibleSchemes } from "@/lib/matching";
import { getDictionary } from "@/lib/i18n";
import { SchemeCard } from "@/components/SchemeCard";
import { FamilySection } from "@/components/FamilySection";
import { RefreshCw, AlertCircle, TrendingUp, CheckCircle, FileText, Info } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { demoUser } from "@/lib/seed";

export const revalidate = 0; // Force dynamic rendering

export default async function DashboardPage() {
  const user = await getUser();
  const dict = await getDictionary();

  // If user has no profile yet, show a gentle banner instead of redirecting
  const isProfileIncomplete = !user || !user.annual_income || !user.caste_category;

  const allSchemes = await getSchemes();
  const userApps = await getApplications(user?.id);
  const familyMembers = await getFamilyMembers(user?.id);

  // Show all schemes from database/JSON so no schemes are missing
  let eligibleSchemes = isProfileIncomplete ? [] : [...allSchemes];

  // Move U-GO scheme to the very last position
  const ugoIndex = eligibleSchemes.findIndex(s => s.id === "db859c25-f712-4022-9214-e25f6e80b2a6");
  if (ugoIndex !== -1) {
    const [ugo] = eligibleSchemes.splice(ugoIndex, 1);
    eligibleSchemes.push(ugo);
  }

  // Sum up total benefits
  const totalBenefits = eligibleSchemes.reduce((sum, scheme) => {
    return sum + (scheme.max_benefit_amount || 0);
  }, 0);

  // Sum up claimed benefits (Approved applications)
  const claimedBenefits = userApps
    .filter(app => app.status.toLowerCase() === "approved")
    .reduce((sum, app) => sum + (app.scheme?.max_benefit_amount || 0), 0);

  // Set used server-side only — never passed to a client component, so no serialization issue
  const appliedSchemeIdsSet = new Set(userApps.map(app => app.scheme_id));
  const isDemo = user?.id === demoUser.id;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">

      {/* Profile Incomplete Banner */}
      {isProfileIncomplete && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Complete your profile to see matched schemes</p>
            <p className="text-xs text-amber-600">We need a few details to find schemes you actually qualify for.</p>
          </div>
          <Link
            href="/"
            className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Get Started →
          </Link>
        </div>
      )}

      {/* Upper Status Bar */}
      {!isProfileIncomplete && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-xl p-5">
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-semibold text-[10px] uppercase border-blue-100">
                {user!.caste_category}
              </Badge>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-semibold text-[10px] border-slate-200">
                ₹{user!.annual_income!.toLocaleString("en-IN")} / yr
              </Badge>
              {isDemo && (
                <Badge className="bg-purple-100 text-purple-700 border-0 font-semibold text-[10px]">
                  Demo
                </Badge>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              {dict.dashboard.welcome_back}, {user!.full_name}
            </h1>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-lg transition-colors cursor-pointer tap-target"
          >
            <RefreshCw className="h-3.5 w-3.5" /> {dict.dashboard.update_profile}
          </Link>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total matched — dark accent card */}
        <div className="bg-[#0F172A] text-white rounded-xl p-6 border border-[#1e293b] space-y-3 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 80% 20%, #0369A1 0%, transparent 60%)' }} />
          <div className="flex items-center justify-between relative">
            <span className="text-xs font-medium text-slate-400">{dict.dashboard.total_matched_value}</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="relative">
            <h3 className="text-3xl font-black tracking-tight tabular-nums">
              ₹{totalBenefits.toLocaleString("en-IN")}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {dict.dashboard.across_schemes.replace("{count}", eligibleSchemes.length.toString())}
            </p>
          </div>
        </div>

        {/* Card 2: Benefits received */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{dict.dashboard.benefits_received}</span>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-3xl font-black tracking-tight tabular-nums text-slate-900">
              ₹{claimedBenefits.toLocaleString("en-IN")}
            </h3>
            <p className="text-xs text-slate-400 mt-1">{dict.dashboard.from_approved}</p>
          </div>
        </div>

        {/* Card 3: Applications filed */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{dict.dashboard.applications_filed}</span>
            <FileText className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-3xl font-black tracking-tight tabular-nums text-slate-900">
              {userApps.length}
            </h3>
            <p className="text-xs text-slate-400 mt-1">{dict.dashboard.submitted_to_portals}</p>
          </div>
        </div>
      </div>

      {/* Hidden element for Chrome Extension Sync */}
      {user && (
        <div
          id="schemefit-extension-sync-data"
          data-profile={JSON.stringify(user)}
          style={{ display: 'none' }}
        />
      )}

      {/* Household Profile Section */}
      <FamilySection initialMembers={familyMembers} isDemoMode={isDemo} />

      {/* Eligible Schemes Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900">
            {dict.dashboard.schemes_you_qualify_for}
          </h3>
          <span aria-live="polite" aria-atomic="true" className="text-xs text-slate-500 font-medium tabular-nums">
            {isDemo ? 0 : eligibleSchemes.length} {dict.dashboard.available}
          </span>
        </div>

        {isDemo || eligibleSchemes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <Info className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-700 mb-1">{dict.dashboard.all_caught_up}</h4>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              {dict.dashboard.no_unclaimed_schemes}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {eligibleSchemes.map((scheme, i) => (
              <div key={scheme.id} className="fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <SchemeCard
                  scheme={scheme}
                  hasApplied={appliedSchemeIdsSet.has(scheme.id)}
                  user={user || undefined}
                  dict={dict.scheme_card}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
