"use client";

import React, { useState, useTransition } from "react";
import { Scheme, User } from "@/lib/db";
import { updateUserDocumentsAction, applyToScheme } from "@/app/actions";
import { FileCheck, Sparkles, AlertCircle, CheckCircle2, ChevronRight, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BenefitsListProps {
  eligibleSchemes: Scheme[];
  user: User;
  appliedSchemeIds: string[]; // plain array — Sets aren't serializable across RSC boundary
}

const COMMON_DOCUMENTS = [
  "Aadhaar",
  "Bank Passbook",
  "Income Certificate",
  "Institution ID",
  "Mark Sheet",
  "Passport Photo",
  "Quotation"
];

// Separate child component so each card has its own independent transition state
function SchemeEligibilityCard({
  scheme,
  percent,
  missing,
  hasApplied,
}: {
  scheme: Scheme;
  percent: number;
  missing: string[];
  hasApplied: boolean;
}) {
  const [isApplying, startApply] = useTransition();
  const [applied, setApplied] = useState(hasApplied);

  const handleApply = () => {
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
    <Card
      className={`bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden border flex flex-col justify-between hover:shadow-md transition-shadow ${
        percent === 100
          ? "border-emerald-200 bg-emerald-50/5"
          : percent >= 95
          ? "border-amber-200 bg-amber-50/5"
          : ""
      }`}
    >
      <CardHeader className="p-5 pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {scheme.category} | {scheme.ministry}
            </span>
            <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
              {scheme.title}
            </h4>
          </div>
          {scheme.max_benefit_amount && (
            <span className="font-extrabold text-emerald-600 text-sm shrink-0 whitespace-nowrap bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
              ₹{scheme.max_benefit_amount.toLocaleString("en-IN")} max
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-4 flex-1">
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
          {scheme.description}
        </p>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
            <span className="text-slate-400">Document Readiness</span>
            <span className={percent === 100 ? "text-emerald-600" : percent >= 95 ? "text-amber-600" : "text-blue-600"}>
              {percent}% Ready
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percent === 100 ? "bg-emerald-500" : percent >= 95 ? "bg-amber-500" : "bg-blue-500"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* 95% — Exactly 1 missing doc */}
        {percent >= 95 && percent < 100 && missing.length === 1 && (
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-[11px] text-amber-800 font-semibold leading-normal flex gap-1.5 items-start">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              <strong>Give this certificate for fully eligible:</strong> {missing[0]}
            </span>
          </div>
        )}

        {/* Multiple docs missing */}
        {percent < 95 && missing.length > 0 && (
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-[11px] text-slate-700 font-medium leading-normal space-y-1">
            <span className="font-bold text-slate-800">Missing Documents ({missing.length}):</span>
            <ul className="list-disc list-inside text-slate-500 font-medium">
              {missing.map(doc => <li key={doc}>{doc}</li>)}
            </ul>
          </div>
        )}

        {/* 100% complete */}
        {percent === 100 && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-[11px] text-emerald-800 font-semibold leading-normal flex gap-1.5 items-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>All documents verified! You are fully eligible to apply.</span>
          </div>
        )}
      </CardContent>

      {/* Footer Action */}
      <div className="p-5 pt-0 border-t border-slate-100/50 mt-2 flex justify-end">
        <Button
          size="sm"
          onClick={!applied && percent === 100 ? handleApply : undefined}
          disabled={applied || isApplying || percent < 100}
          variant={percent === 100 && !applied ? "default" : "outline"}
          className={`font-semibold cursor-pointer rounded-lg text-xs ${
            percent === 100 && !applied
              ? "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
              : "text-slate-500 border-slate-200 hover:bg-slate-50"
          }`}
          style={{ minHeight: "36px" }}
        >
          {isApplying ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Submitting...</>
          ) : applied ? (
            <><CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-500" /> Applied</>
          ) : percent === 100 ? (
            <>Apply Instantly <ChevronRight className="h-4 w-4 ml-1" /></>
          ) : (
            "Complete Documents First"
          )}
        </Button>
      </div>
    </Card>
  );
}

export function BenefitsList({ eligibleSchemes, user, appliedSchemeIds: appliedIds }: BenefitsListProps) {
  // Convert to Set locally for O(1) lookups
  const appliedSchemeIds = new Set(appliedIds);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>(user.uploaded_documents || []);
  const [isSavingDocs, startSavingDocs] = useTransition();

  const handleDocToggle = (doc: string) => {
    const updated = uploadedDocs.includes(doc)
      ? uploadedDocs.filter(d => d !== doc)
      : [...uploadedDocs, doc];
    setUploadedDocs(updated);
    startSavingDocs(async () => {
      await updateUserDocumentsAction(updated);
    });
  };

  const getDocumentMatchingStats = (scheme: Scheme) => {
    const required = scheme.required_documents || [];
    if (required.length === 0) return { percent: 100, missing: [] as string[] };
    const matching = required.filter(doc => uploadedDocs.includes(doc));
    const missing = required.filter(doc => !uploadedDocs.includes(doc));
    let percent = Math.round((matching.length / required.length) * 100);
    if (missing.length === 1) percent = 95;
    return { percent, missing };
  };

  return (
    <div className="space-y-6">
      {/* Document Checklist Vault */}
      <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/20">
          <CardTitle className="text-md font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-indigo-500" />
            My Digital Document Checklist Vault
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Check the certificates you currently have. We dynamically match them against scheme requirements to compute real-time eligibility scores.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {COMMON_DOCUMENTS.map((doc) => {
              const isChecked = uploadedDocs.includes(doc);
              return (
                <label
                  key={doc}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs font-semibold select-none cursor-pointer transition-all ${
                    isChecked
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleDocToggle(doc)}
                    disabled={isSavingDocs}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="truncate">{doc}</span>
                </label>
              );
            })}
          </div>
          {isSavingDocs && (
            <p className="text-[10px] text-indigo-500 font-bold mt-3 animate-pulse flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" /> Saving document checklist to profile...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Eligibility Cards */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-slate-800 text-md flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
          Real-time Document Eligibility Match
        </h3>

        {eligibleSchemes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 shadow-sm text-center">
            <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 text-lg mb-1">No Matching Benefits Found</h4>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              Please complete your voice onboarding or edit profile details to show eligible benefits.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {eligibleSchemes.map((scheme) => {
              const { percent, missing } = getDocumentMatchingStats(scheme);
              return (
                <SchemeEligibilityCard
                  key={scheme.id}
                  scheme={scheme}
                  percent={percent}
                  missing={missing}
                  hasApplied={appliedSchemeIds.has(scheme.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
