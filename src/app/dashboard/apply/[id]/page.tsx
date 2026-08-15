import React from "react";
import { getUser, getSchemeById } from "@/lib/db";
import { Sparkles, CheckCircle2, ChevronLeft, ShieldCheck, FileText, Lock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApplySubmitButton } from "./ApplySubmitButton";

export const revalidate = 0;

export default async function AIAutoFillPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getUser();
  const scheme = await getSchemeById(params.id);

  if (!user || !scheme) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      
      {/* Header Back Link */}
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
      </Link>

      {/* AI Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at top right, #c084fc, transparent 50%)' }} />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-bold border border-purple-500/30">
              <Sparkles className="h-3.5 w-3.5" />
              AI Form Engine Active
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Auto-Filled Application
            </h1>
            <p className="text-purple-200 text-sm max-w-xl leading-relaxed">
              We parsed your Aadhar, Income Certificate, and DB profile to automatically fill the <strong className="text-white">{scheme.title}</strong> government application. Please review the highlighted fields before submitting.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col gap-2 min-w-[200px]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-200">Data mapped:</span>
              <span className="font-bold">14/14 fields</span>
            </div>
            <div className="w-full h-2 bg-purple-950 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 w-full" />
            </div>
            <span className="text-xs font-medium text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> 100% Complete
            </span>
          </div>
        </div>
      </div>

      {/* The "Government Form" UI */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Form Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2Icon />
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Official Application Form</h2>
              <p className="text-[11px] text-slate-500">{scheme.provider_name || scheme.ministry || "Government Department"}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
            <ShieldCheck className="h-4 w-4" /> Secure E-Filing
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-10">
          
          {/* Section 1 */}
          <section className="space-y-5">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-400" /> 1. Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AIField label="Full Legal Name" value={user.full_name || "N/A"} source="Aadhar Card" />
              <AIField label="Gender" value={user.gender || "N/A"} source="Aadhar Card" />
              <AIField label="Date of Birth" value="15-08-1995" source="Aadhar Card" />
              <AIField label="Contact Number" value="+91 98765 43210" source="Profile DB" />
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-5">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Building2Icon /> 2. Socio-Economic Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AIField label="Caste Category" value={user.caste_category || "General"} source="Caste Certificate" />
              <AIField label="Annual Family Income" value={`₹${user.annual_income?.toLocaleString("en-IN") || "0"}`} source="Income Certificate" />
              <AIField label="Employment Status" value={user.occupation || "Unemployed"} source="Profile DB" />
              <AIField label="Highest Education" value={user.education || "12th Pass"} source="Education Records" />
            </div>
          </section>
          
          {/* Section 3 */}
          <section className="space-y-5">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Lock className="h-5 w-5 text-slate-400" /> 3. Declarations
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-600 leading-relaxed">
              I hereby declare that the information provided in this form is true and correct to the best of my knowledge. I understand that if any information is found to be false or incorrect, my application for the <strong>{scheme.title}</strong> will be rejected and I may be subject to legal action.
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0 relative">
                <input type="checkbox" checked readOnly className="h-5 w-5 rounded border-slate-300 text-purple-600 focus:ring-purple-600 cursor-not-allowed opacity-50" />
                <div className="absolute inset-0 border-2 border-purple-400 rounded ring-4 ring-purple-400/20 animate-pulse pointer-events-none" />
              </div>
              <p className="text-sm font-medium text-slate-800">
                <span className="text-purple-600 font-bold"><Sparkles className="h-4 w-4 inline-block align-text-bottom" /> AI Auto-Signed</span> using verified Aadhar e-KYC.
              </p>
            </div>
          </section>

        </div>

        {/* Form Footer / Submit */}
        <div className="bg-slate-50 border-t border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">
            Please verify all highlighted AI-extracted fields before submission.
          </p>
          <ApplySubmitButton schemeId={scheme.id} />
        </div>
      </div>
    </div>
  );
}

function Building2Icon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
  );
}

function AIField({ label, value, source }: { label: string, value: string, source: string }) {
  return (
    <div className="relative group">
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
        <div className="relative bg-purple-50/50 border border-purple-200/60 rounded-lg px-4 py-2.5 flex items-center justify-between">
          <span className="font-semibold text-slate-900">{value}</span>
          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
            <Sparkles className="h-2.5 w-2.5" /> {source}
          </span>
        </div>
      </div>
    </div>
  );
}
