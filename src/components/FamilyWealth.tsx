"use client";

import React, { useState, useTransition } from "react";
import { FamilyMember, Scheme } from "@/lib/db";
import { applyToScheme } from "@/app/actions";
import { Users, IndianRupee, Landmark, TrendingUp, Sparkles, ArrowRight, Info, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FamilyWealthProps {
  familyMembers: FamilyMember[];
  eligibleSchemes: Scheme[];
  appliedSchemeIds: string[]; // plain array — Set is not serializable across RSC boundary
  isDemoMode: boolean;
}

function ClaimCashButton({ scheme, alreadyApplied }: { scheme: Scheme; alreadyApplied: boolean }) {
  const [isApplying, startApply] = useTransition();
  const [applied, setApplied] = useState(alreadyApplied);

  const handleClaim = () => {
    startApply(async () => {
      const result = await applyToScheme(scheme.id);
      if (result.success) {
        setApplied(true);
      } else {
        alert("Failed to submit application: " + result.error);
      }
    });
  };

  return (
    <div className="p-5 pt-0 mt-auto border-t border-slate-100/50 flex items-center justify-between">
      <span className="text-[10px] font-bold text-slate-400 uppercase">
        Deadline: {scheme.deadline || "Open"}
      </span>
      <button
        onClick={applied ? undefined : handleClaim}
        disabled={applied || isApplying}
        className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer border ${
          applied
            ? "text-emerald-600 bg-emerald-50 border-emerald-100"
            : "text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-100"
        }`}
        style={{ minHeight: "36px" }}
      >
        {isApplying ? (
          <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Applying...</>
        ) : applied ? (
          <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Applied</>
        ) : (
          <>Claim Cash <ArrowRight className="h-3.5 w-3.5" /></>
        )}
      </button>
    </div>
  );
}

export function FamilyWealth({ familyMembers, eligibleSchemes, appliedSchemeIds: appliedIds, isDemoMode }: FamilyWealthProps) {
  // Convert to Set locally for O(1) lookups — string[] was used for RSC serialization safety
  const appliedSchemeIds = new Set(appliedIds);

  // Calculate total claimed benefits
  let totalClaimed = 0;
  familyMembers.forEach(member => {
    (member.claimed_benefits || []).forEach(benefit => {
      if (benefit.status.toLowerCase() === "approved") {
        totalClaimed += benefit.amount;
      }
    });
  });

  // Calculate unclaimed eligible schemes
  const unclaimedSchemes = eligibleSchemes.filter(scheme => !appliedSchemeIds.has(scheme.id));
  const totalPotentialUnclaimed = unclaimedSchemes.reduce((sum, scheme) => {
    return sum + (scheme.max_benefit_amount || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* 1. Header Hero Panel */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-6 md:p-8 text-white border border-indigo-950 shadow-md relative overflow-hidden group">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10 group-hover:scale-105 transition-transform duration-500">
          <Landmark className="h-64 w-64 text-indigo-400" />
        </div>
        
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 font-semibold text-[10px] uppercase tracking-wider">
            <TrendingUp className="h-3.5 w-3.5 text-indigo-300" />
            Household Net Welfare Value
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Total Household Welfare Payout: <span className="text-emerald-400">₹{totalClaimed.toLocaleString("en-IN")}</span>
          </h2>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-medium">
            Your family has successfully secured welfare distributions from 2 active state programs. Our matching engine discovers an additional <span className="text-amber-300 font-extrabold">₹{totalPotentialUnclaimed.toLocaleString("en-IN")}</span> in eligible welfare value.
          </p>
        </div>
      </div>

      {/* 2. Side-by-Side: Family Members vs Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Family Board Card (Takes 2 columns on medium up) */}
        <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden md:col-span-2">
          <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/20">
            <CardTitle className="text-md font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              Family Member Welfare Ledger
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Assigned dependents and recorded benefit payouts currently associated with this household.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {familyMembers.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700">No Family Ledger Records</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                  Add household dependents in the Dashboard profile list to configure family welfare disbursements.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {familyMembers.map((member) => {
                  const memberClaimedSum = (member.claimed_benefits || [])
                    .filter(b => b.status.toLowerCase() === "approved")
                    .reduce((sum, b) => sum + b.amount, 0);

                  return (
                    <div
                      key={member.id}
                      className="border border-slate-150 rounded-xl p-4 bg-slate-50/20 hover:bg-slate-50/40 transition-colors space-y-3"
                    >
                      {/* Member Info */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-2.5">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                            {member.name}
                            <Badge variant="secondary" className="bg-slate-100 hover:bg-slate-150 text-slate-600 border-0 font-bold text-[9px] uppercase px-2 py-0.5 rounded">
                              {member.relation}
                            </Badge>
                          </h4>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Age: {member.age} | Occupation: {member.occupation} | Income: ₹{member.annual_income.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Withdrawn</span>
                          <span className="font-extrabold text-emerald-600 text-sm">
                            ₹{memberClaimedSum.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* Member Payout Details */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Linked Disbursements</span>
                        {(!member.claimed_benefits || member.claimed_benefits.length === 0) ? (
                          <p className="text-[11px] text-slate-400 italic">No claimed programs registered for this dependent.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {member.claimed_benefits.map((benefit, bidx) => (
                              <div
                                key={bidx}
                                className="flex justify-between items-center bg-white border border-slate-200/60 rounded-lg p-2 text-xs font-semibold"
                              >
                                <span className="text-slate-700 truncate max-w-xs">{benefit.scheme_title}</span>
                                <span className="text-emerald-600 font-extrabold bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded text-[10px]">
                                  + ₹{benefit.amount.toLocaleString("en-IN")}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wealth Payout Summary Panel */}
        <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col justify-between">
          <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/20">
            <CardTitle className="text-sm font-bold text-slate-900">
              Household Savings Breakdown
            </CardTitle>
            <CardDescription className="text-[10px] text-slate-500">
              Welfare asset structure.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6 flex-1">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Secured Assets</span>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                ₹{totalClaimed.toLocaleString("en-IN")}
              </h3>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Transferred to Bank Account
              </p>
            </div>

            <div className="space-y-1 border-t border-slate-100 pt-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Potential Unclaimed Value</span>
              <h3 className="text-3xl font-extrabold text-amber-600 tracking-tight">
                ₹{totalPotentialUnclaimed.toLocaleString("en-IN")}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Awaiting documentation matching.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Unclaimed Eligible Benefits (MONEY FOCUS TO ATTRACT USER) */}
      <div className="space-y-4 pt-4">
        <h3 className="font-extrabold text-slate-800 text-md flex items-center gap-1.5">
          <Sparkles className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
          Unclaimed Welfare Cash Values Waiting For You
        </h3>

        {unclaimedSchemes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 shadow-sm text-center">
            <Info className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 text-lg mb-1">No Unclaimed Welfare Available</h4>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              Your household has already applied for or claimed all eligible matching schemes!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unclaimedSchemes.map((scheme) => (
              <Card
                key={scheme.id}
                className="bg-white border-slate-200 hover:shadow-md transition-shadow rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-slate-100 p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded uppercase border border-emerald-100">
                      Unclaimed Value
                    </span>
                    <IndianRupee className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="mt-2 text-center">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Welfare Benefit Amount</span>
                    <span className="text-3xl font-extrabold text-emerald-600 tracking-tight block">
                      ₹{(scheme.max_benefit_amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <CardContent className="p-5 flex-1 space-y-3">
                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-1">
                    {scheme.title}
                  </h4>
                  <p className="text-slate-500 text-xs leading-normal line-clamp-3">
                    {scheme.description}
                  </p>
                </CardContent>

                <ClaimCashButton scheme={scheme} alreadyApplied={appliedSchemeIds.has(scheme.id)} />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
