"use client";

import React, { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Calendar, CheckCircle2, ChevronRight, Loader2, IndianRupee, X, ExternalLink, Building2, Landmark, HeartHandshake, Mail, Sparkles } from "lucide-react";
import { Scheme, User } from "@/lib/db";
import { applyToScheme } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

interface SchemeCardProps {
  scheme: Scheme;
  hasApplied: boolean;
  user?: User;
  dict?: any;
}

const DEMO_SCHEME_ID = "db859c25-f712-4022-9214-e25f6e80b2a6";

export function SchemeCard({ scheme, hasApplied, user, dict }: SchemeCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const handleAutoFill = () => {
    setIsAutoFilling(true);
    setTimeout(() => {
      router.push(`/dashboard/apply/${scheme.id}`);
    }, 2000); // 2 second mock processing state
  };

  const t = dict || {
    financial_benefit: "Financial Benefit",
    direct_funding: "Direct funding if you are approved — no repayment required.",
    ai_eligibility_check: "AI Eligibility Check",
    save_reminder: "Save Reminder",
    applied: "Applied",
    applying: "Applying…",
    submitting_application: "Submitting application…",
    apply_to_portal: "Apply to portal",
    apply_now: "Apply now"
  };

  const isEmailDemo = scheme.id === DEMO_SCHEME_ID;

  const handleSendReminder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.email) {
      alert("No email found for the logged-in user.");
      return;
    }
    setIsSendingEmail(true);
    setEmailResult(null);
    try {
      const res = await fetch("/api/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemeId: scheme.id,
          userEmail: user.email,
          userName: user.full_name || "User",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailResult({ success: true, message: `Email sent to ${user.email}` });
        alert(`Success: Email sent successfully to ${user.email}!`);
      } else {
        setEmailResult({ success: false, message: data.error || "Failed to send email" });
        alert(`Error: Failed to send email - ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      setEmailResult({ success: false, message: err.message });
      alert(`Error: Network issue occurred while sending email - ${err.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDownloadICS = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal
    if (!scheme.deadline) return;
    
    const deadlineDate = new Date(scheme.deadline);
    const deadlineStr = deadlineDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    
    const startDate = new Date(deadlineDate.getTime() - 24 * 60 * 60 * 1000);
    const startStr = startDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//SchemeFit//Scheme Calendar//EN",
      "BEGIN:VEVENT",
      `UID:deadline-${scheme.id}@schemefit.in`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"}`,
      `DTSTART:${startStr}`,
      `DTEND:${deadlineStr}`,
      `SUMMARY:Apply for ${scheme.title}`,
      `DESCRIPTION:Reminder to submit your application for the ${scheme.title} scholarship/scheme before the deadline! Link: ${scheme.application_url || "https://schemefit.in"}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${scheme.title.toLowerCase().replace(/\s+/g, "-")}-deadline.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal

    const missingDocs = scheme.required_documents?.filter(doc => !hasDocument(doc, user?.uploaded_documents)) || [];
    if (missingDocs.length > 0) {
      const proceed = window.confirm(`You are missing some required documents:\n- ${missingDocs.join("\n- ")}\n\nDo you want to proceed anyway?`);
      if (!proceed) return;
    }

    // Open a blank tab synchronously to prevent modern browsers from blocking the popup
    const portalWindow = window.open("about:blank", "_blank");

    startTransition(async () => {
      try {
        const res = await fetch("/api/apply-real", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schemeId: scheme.id })
        });
        const data = await res.json();
        
        if (data.success && data.redirectUrl) {
          // Redirect the open tab to the real portal
          if (portalWindow) {
            portalWindow.location.href = data.redirectUrl;
          }
        } else {
          if (portalWindow) {
            portalWindow.close();
          }
          alert("Failed to start application: " + (data.error || "Unknown error"));
        }
      } catch (err) {
        console.error(err);
        if (portalWindow) {
          portalWindow.close();
        }
        alert("Network error occurred while launching application portal.");
      }
    });
  };

  const formattedDeadline = scheme.deadline
    ? new Date(scheme.deadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No deadline";

  // Document matching logic helper
  const hasDocument = (requiredDoc: string, uploadedDocs: string[] | null | undefined = []) => {
    const docs = uploadedDocs || [];
    const normRequired = requiredDoc.toLowerCase().replace(/[^a-z0-9]/g, "");
    return docs.some(uploaded => {
      const normUploaded = uploaded.toLowerCase().replace(/[^a-z0-9]/g, "");
      return normUploaded.includes(normRequired) || normRequired.includes(normUploaded);
    });
  };

  // Eligibility matching checks
  const isIncomeEligible = !scheme.eligibility_json?.max_income || !user?.annual_income || user.annual_income <= scheme.eligibility_json.max_income;
  const isCasteEligible = !scheme.eligibility_json?.category || !user?.caste_category || scheme.eligibility_json.category.map((c: string) => c.toLowerCase()).includes(user.caste_category.toLowerCase());
  const isEducationEligible = !scheme.eligibility_json?.education || !user?.education || scheme.eligibility_json.education.map((e: string) => e.toLowerCase()).includes(user.education.toLowerCase());

  return (
    <>
      {/* Interactive Card */}
      <Card 
        onClick={() => setShowModal(true)}
        className="flex flex-col h-full bg-white border border-slate-200 rounded-xl card-hover cursor-pointer group"
      >
        <CardHeader className="p-6 pb-4">
          <div className="flex justify-between items-start gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium text-[11px]">
                {scheme.category || "General"}
              </Badge>
              {scheme.provider_type === "NGO" && (
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[10px] gap-1">
                  <HeartHandshake className="h-3 w-3" aria-hidden="true" /> NGO
                </Badge>
              )}
              {scheme.provider_type === "Private Sector" && (
                <Badge className="bg-violet-50 text-violet-700 border border-violet-200 font-semibold text-[10px] gap-1">
                  <Building2 className="h-3 w-3" aria-hidden="true" /> Private
                </Badge>
              )}
              {(!scheme.provider_type || scheme.provider_type === "Government") && (
                <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[10px] gap-1">
                  <Landmark className="h-3 w-3" aria-hidden="true" /> Government
                </Badge>
              )}
            </div>
            {scheme.max_benefit_amount && (
              <div className="flex items-center text-emerald-600 font-bold text-lg">
                <IndianRupee className="h-4.5 w-4.5 mr-0.5" />
                {scheme.max_benefit_amount.toLocaleString("en-IN")}
              </div>
            )}
          </div>
          <CardTitle className="text-[15px] font-bold text-slate-900 leading-tight group-hover:text-[#0369A1] transition-colors">
            {scheme.title}
          </CardTitle>
          <CardDescription className="text-slate-400 text-[11px] mt-1">
            {scheme.provider_name || scheme.ministry}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 pt-0 pb-6 flex-1">
          <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
            {scheme.description}
          </p>
          
          {scheme.deadline && (
            <div className="flex items-center gap-2 mt-4 text-[11px] font-semibold text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Deadline: <span className="text-slate-800">{formattedDeadline}</span>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-6 pt-4 border-t border-slate-100 flex flex-wrap gap-3 mt-auto">
          {isEmailDemo ? (
            /* Demo scheme: single Send Reminder button */
            <Button
              size="sm"
              onClick={handleSendReminder}
              disabled={isSendingEmail || emailResult?.success}
              className={`flex-1 font-semibold cursor-pointer text-sm tap-target ${
                emailResult?.success
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : "bg-[#0F172A] hover:bg-[#1e293b] text-white btn-primary"
              }`}
            >
              {isSendingEmail ? (
                <span role="status" className="flex items-center gap-1.5">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Sending…
                </span>
              ) : emailResult?.success ? (
                <><CheckCircle2 className="h-4 w-4 mr-1.5" /> Sent!</>
              ) : (
                <><Mail className="h-4 w-4 mr-1.5" /> Send Reminder</>
              )}
            </Button>
          ) : (
            /* Normal scheme: Save Reminder + Apply buttons */
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadICS}
                disabled={!scheme.deadline}
                className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer text-[13px] tap-target"
              >
                <Calendar className="h-4 w-4 mr-1.5" /> {t.save_reminder}
              </Button>
              
              {hasApplied ? (
                <Button
                  disabled
                  variant="secondary"
                  aria-label={`Already applied to ${scheme.title}`}
                  className="flex-1 bg-emerald-50 text-emerald-600 font-medium border border-emerald-100 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" /> {t.applied}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleApply}
                  disabled={isPending}
                  className="flex-1 bg-[#0F172A] hover:bg-[#1e293b] text-white font-semibold cursor-pointer text-sm btn-primary tap-target"
                >
                  {isPending ? (
                    <span role="status" className="flex items-center gap-1.5">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      <span className="sr-only">{t.submitting_application}</span>
                      <span aria-hidden="true">{t.applying}</span>
                    </span>
                  ) : (
                    <>
                      {!scheme.provider_type || scheme.provider_type === "Government" ? t.apply_to_portal : t.apply_now} <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>

      {/* Brief View Modal */}
      {showModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 border border-slate-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="bg-slate-150 text-slate-700 text-[10px] font-bold">
                    {scheme.category || "General"}
                  </Badge>
                  {scheme.provider_type && (
                    <Badge className={`border font-semibold text-[10px] ${
                      scheme.provider_type === "Government" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      scheme.provider_type === "NGO" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      "bg-violet-50 text-violet-700 border-violet-200"
                    }`}>
                      {scheme.provider_type}
                    </Badge>
                  )}
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                  {scheme.title}
                </h2>
                <p className="text-xs text-slate-500">
                  Funded by {scheme.provider_name || scheme.ministry}
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Highlighted Benefit Box */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50/60 border border-emerald-100 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                    Financial Benefit
                  </span>
                  <p className="text-xs text-emerald-700 font-medium max-w-md leading-normal">
                    Direct funding if you are approved — no repayment required.
                  </p>
                </div>
                {scheme.max_benefit_amount && (
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-850 block">Up to</span>
                    <span className="text-2xl font-black text-emerald-600 flex items-center justify-end">
                      <IndianRupee className="h-5 w-5 mr-0.5" />
                      {scheme.max_benefit_amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>

              {/* Brief Idea */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Brief Overview</h4>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {scheme.description}
                </p>
              </div>

              {/* AI Audit Checklist Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-800">
                    AI Eligibility Check
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Eligibility Audit */}
                  <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Eligibility Match</h4>
                    <ul className="space-y-2.5">
                      <li className="flex items-start gap-2 text-xs">
                        {isIncomeEligible ? (
                          <span className="text-emerald-600 font-bold"><CheckCircle2 className="h-4 w-4" /></span>
                        ) : (
                          <span className="text-red-500 font-bold"><X className="h-4 w-4" /></span>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-750">Annual Household Income</p>
                          <p className="text-slate-500 text-[10px]">
                            {scheme.eligibility_json?.max_income
                              ? `Income limit: ₹${scheme.eligibility_json.max_income.toLocaleString("en-IN")} (Your Profile: ₹${user?.annual_income?.toLocaleString("en-IN") || "N/A"})`
                              : "No restrictive income limits apply"}
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 text-xs">
                        {isCasteEligible ? (
                          <span className="text-emerald-600 font-bold"><CheckCircle2 className="h-4 w-4" /></span>
                        ) : (
                          <span className="text-red-500 font-bold"><X className="h-4 w-4" /></span>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-750">Caste Category Match</p>
                          <p className="text-slate-500 text-[10px]">
                            {scheme.eligibility_json?.category
                              ? `Eligible: ${scheme.eligibility_json.category.join(", ")} (Your Profile: ${user?.caste_category || "N/A"})`
                              : "Open to all caste categories"}
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 text-xs">
                        {isEducationEligible ? (
                          <span className="text-emerald-600 font-bold"><CheckCircle2 className="h-4 w-4" /></span>
                        ) : (
                          <span className="text-red-500 font-bold"><X className="h-4 w-4" /></span>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-750">Education Criteria</p>
                          <p className="text-slate-500 text-[10px]">
                            {scheme.eligibility_json?.education
                              ? `Required: ${scheme.eligibility_json.education.join(", ")} (Your Profile: ${user?.education || "N/A"})`
                              : "No education limits apply"}
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Right Column: Required Documents Check */}
                  <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Required Documents Audit</h4>
                    {scheme.required_documents && scheme.required_documents.length > 0 ? (
                      <ul className="space-y-2.5">
                        {scheme.required_documents.map((doc, idx) => {
                          const docAvailable = hasDocument(doc, user?.uploaded_documents);
                          return (
                            <li key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg border bg-white border-slate-200">
                              <span className="font-medium text-slate-700 truncate max-w-[180px]">{doc}</span>
                              {docAvailable ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <CheckCircle2 className="h-3 w-3" /> Vault Checked
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200 line-through">
                                  <X className="h-3 w-3" /> Upload Needed
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-slate-400 text-xs italic">No documents specified.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Calendar className="h-4 w-4 text-slate-400" />
                Deadline: <span className="text-slate-800">{formattedDeadline}</span>
              </div>
              <div className="flex items-center gap-3">
                {(!scheme.provider_type || scheme.provider_type === "Government") && scheme.application_url && (
                  <a
                    href={scheme.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-250 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                  >
                    For more information click here <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {isEmailDemo ? (
                  <button
                    onClick={handleSendReminder}
                    disabled={isSendingEmail || emailResult?.success}
                    className={`font-semibold px-6 py-2.5 rounded-lg text-[13px] flex items-center gap-1.5 cursor-pointer tap-target focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 ${
                      emailResult?.success
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-[#0F172A] hover:bg-[#1e293b] text-white btn-primary"
                    }`}
                  >
                    {isSendingEmail ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : emailResult?.success ? (
                      <><CheckCircle2 className="h-4 w-4" /> Sent!</>
                    ) : (
                      <><Mail className="h-4 w-4" /> Send Reminder</>
                    )}
                  </button>
                ) : hasApplied ? (
                  <button
                    disabled
                    className="bg-emerald-50 text-emerald-600 font-bold border border-emerald-100 px-6 py-2.5 rounded-lg text-xs flex items-center gap-1.5"
                    style={{ minHeight: "44px" }}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Applied
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAutoFill}
                      disabled={isAutoFilling || isPending}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg text-[13px] flex items-center gap-2 cursor-pointer shadow-sm shadow-purple-500/20 tap-target transition-all"
                    >
                      {isAutoFilling ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Extracting Data...</>
                      ) : (
                        <><Sparkles className="h-4 w-4" /> AI Auto-Fill Application</>
                      )}
                    </button>
                    <button
                      onClick={handleApply}
                      disabled={isPending || isAutoFilling}
                      aria-label={`Apply to ${scheme.title}`}
                      className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-lg text-[13px] flex items-center gap-1.5 cursor-pointer tap-target"
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Manual Apply"
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
