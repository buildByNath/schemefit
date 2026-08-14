import React from "react";
import { getUser, getSchemes, getApplications, getFamilyMembers } from "@/lib/db";
import { getEligibleSchemes } from "@/lib/matching";
import { SchemeCard } from "@/components/SchemeCard";
import { FamilySection } from "@/components/FamilySection";
import { Sparkles, RefreshCw, AlertCircle, TrendingUp, CheckCircle, FileText, Info } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { demoUser } from "@/lib/seed";

export const revalidate = 0; // Force dynamic rendering

export default async function DashboardPage() {
  const user = await getUser();
  
  // If user has no profile yet, show a gentle banner instead of redirecting
  const isProfileIncomplete = !user || !user.annual_income || !user.caste_category;

  const allSchemes = await getSchemes();
  const userApps = await getApplications(user?.id);
  const familyMembers = await getFamilyMembers(user?.id);
  
  // Run the matching algorithm
  const eligibleSchemes = isProfileIncomplete ? [] : getEligibleSchemes(user!, allSchemes);
  
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
    <div className="space-y-6 max-w-5xl mx-auto p-6 md:p-8 bg-slate-50 min-h-screen">
      
      {/* Profile Incomplete Banner */}
      {isProfileIncomplete && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Your profile is incomplete</p>
            <p className="text-xs text-amber-600">Fill in your details to start matching with welfare schemes.</p>
          </div>
          <Link
            href="/"
            className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Complete Profile →
          </Link>
        </div>
      )}

      {/* Upper Status Bar */}
      {!isProfileIncomplete && (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Active Profile</span>
            <Badge variant="secondary" className="bg-blue-50 text-blue-600 font-bold text-[10px] uppercase border-blue-100">
              {user!.caste_category} Category
            </Badge>
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 font-bold text-[10px] uppercase border-indigo-100">
              Income: ₹{user!.annual_income!.toLocaleString("en-IN")}
            </Badge>
            {isDemo ? (
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 font-bold text-[10px] uppercase">
                Demo Mode
              </Badge>
            ) : (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 font-bold text-[10px] uppercase">
                Custom User Mode
              </Badge>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user!.full_name}
          </h2>
          <p className="text-slate-500 text-xs max-w-xl truncate">
            Parsed Intake: &ldquo;{user!.voice_raw_text || "Manual profile inputs"}&rdquo;
          </p>
        </div>
        
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-250 px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
          style={{ minHeight: "44px" }}
        >
          <RefreshCw className="h-3.5 w-3.5" /> Retake Voice Onboarding
        </Link>
      </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Eligibility Score */}
        <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800 space-y-4 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-32 w-32" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Welfare Eligibility Score</span>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              ₹{totalBenefits.toLocaleString("en-IN")}
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              Based on {eligibleSchemes.length} matching welfare programs discovery.
            </p>
          </div>
        </div>

        {/* Card 2: Claims Made */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:scale-110 transition-transform text-indigo-500">
            <CheckCircle className="h-32 w-32" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Benefits Claimed</span>
            <CheckCircle className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              ₹{claimedBenefits.toLocaleString("en-IN")}
            </h3>
            <p className="text-xs text-slate-500 leading-normal">
              Accumulated benefits successfully approved.
            </p>
          </div>
        </div>

        {/* Card 3: Active Filings */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:scale-110 transition-transform text-blue-500">
            <FileText className="h-32 w-32" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Applications Filed</span>
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              {userApps.length} <span className="text-xs text-slate-400 font-semibold">filings</span>
            </h3>
            <p className="text-xs text-slate-500 leading-normal">
              Active tracks on departmental queues.
            </p>
          </div>
        </div>
      </div>

      {/* Household Profile Section */}
      <FamilySection initialMembers={familyMembers} isDemoMode={isDemo} />

      {/* Eligible Schemes Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-850 flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-blue-600 animate-pulse" />
            Unclaimed Welfare Cash Values Waiting For You
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {isDemo ? 0 : eligibleSchemes.length} programs available
          </span>
        </div>

        {isDemo || eligibleSchemes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 shadow-sm text-center">
            <Info className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 text-lg mb-1">No Unclaimed Welfare Available</h4>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Your household has already applied for or claimed all eligible matching schemes!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eligibleSchemes.map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                hasApplied={appliedSchemeIdsSet.has(scheme.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
