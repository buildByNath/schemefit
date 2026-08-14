import { getSchemes, getUserDocuments, getActiveUserId } from "@/lib/db";
import type { Scheme, UserDocument } from "@/lib/db";
import { CheckCircle, Lock, AlertTriangle, ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";

interface CascadeStep {
  id: number;
  title: string;
  type: "prerequisite" | "document" | "application";
  status: "complete" | "missing" | "locked";
  description?: string;
}

export default async function CascadePage({ params }: { params: { schemeId: string } }) {
  const schemeId = params.schemeId;
  const userId = await getActiveUserId();
  const [allSchemes, docs] = await Promise.all([
    getSchemes(),
    getUserDocuments(userId)
  ]);
  
  const scheme = allSchemes.find((x: Scheme) => x.id === schemeId) || null;
  
  if (!scheme) return <div className="p-8 text-center">Scheme not found.</div>;

  const steps = buildCascade(scheme, docs);
  const allComplete = steps.every(s => s.status === "complete");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href={`/dashboard/schemes/${scheme.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Scheme
      </Link>

      <h1 className="text-2xl font-bold mb-1">Application Roadmap</h1>
      <p className="text-sm text-muted-foreground mb-8">{scheme.title}</p>

      {/* Cascade Steps */}
      <div className="relative">
        {steps.map((step, i) => (
          <div key={step.id} className="flex gap-4 mb-2">
            {/* Left: step number + connector */}
            <div className="flex flex-col items-center">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 z-10 ${
                step.status === "complete" ? "bg-green-500 text-white" :
                step.status === "missing" ? "bg-orange-100 text-orange-700 border-2 border-orange-400" :
                "bg-slate-100 text-slate-400"
              }`}>
                {step.status === "complete" ? <CheckCircle className="h-5 w-5" /> :
                 step.status === "locked" ? <Lock className="h-4 w-4" /> :
                 step.id}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-0.5 flex-1 my-1 min-h-[2rem] ${
                  step.status === "complete" ? "bg-green-300" : "bg-slate-200"
                }`} />
              )}
            </div>

            {/* Right: content */}
            <div className={`flex-1 pb-6 ${step.status === "locked" ? "opacity-50" : ""}`}>
              <div className={`p-4 rounded-xl border ${
                step.status === "complete" ? "bg-green-50 border-green-200" :
                step.status === "missing" ? "bg-orange-50 border-orange-200" :
                "bg-white border-slate-200"
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium text-sm text-slate-900">{step.title}</div>
                    {step.description && <div className="text-xs text-slate-500 mt-0.5">{step.description}</div>}
                  </div>
                  <StatusBadge status={step.status} />
                </div>

                {step.status === "missing" && step.type !== "application" && (
                  <div className="mt-3 flex gap-2">
                    <Link href="/dashboard/documents" className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1.5 rounded-full font-medium transition-colors">
                      Upload Document
                    </Link>
                  </div>
                )}

                {step.type === "application" && step.status === "locked" && (
                  <div className="mt-2 text-xs text-slate-500">Complete all prerequisites to unlock the application.</div>
                )}

                {step.type === "application" && step.status !== "locked" && (
                  <div className="mt-3">
                    <a href={scheme.application_url ?? "#"} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs bg-indigo-600 text-white px-4 py-2 rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-sm">
                      Apply Now <ArrowLeft className="h-3.5 w-3.5 rotate-135" />
                    </a>
                  </div>
                )}
              </div>

              {i < steps.length - 1 && step.status === "complete" && (
                <div className="flex justify-start pl-4 -mt-2 -mb-2">
                  <ChevronDown className="h-4 w-4 text-green-400" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {allComplete && (
        <div className="mt-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl text-center shadow-sm">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="font-bold text-green-900 text-lg">You&apos;re ready to apply!</div>
          <p className="text-sm text-green-700 mt-1 mb-4">All prerequisites and documents are complete.</p>
          <a href={scheme.application_url ?? "#"} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm">
            Proceed to Official Portal <ArrowLeft className="h-4 w-4 rotate-135" />
          </a>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: CascadeStep["status"] }) {
  if (status === "complete") return (
    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-green-700 font-bold shrink-0 bg-green-100 px-2 py-1 rounded">
      <CheckCircle className="h-3 w-3" /> Complete
    </span>
  );
  if (status === "missing") return (
    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-orange-700 font-bold shrink-0 bg-orange-100 px-2 py-1 rounded">
      <AlertTriangle className="h-3 w-3" /> Missing
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 font-bold shrink-0 bg-slate-100 px-2 py-1 rounded">
      <Lock className="h-3 w-3" /> Locked
    </span>
  );
}

function buildCascade(scheme: Scheme, documents: UserDocument[]): CascadeStep[] {
  const uploadedTypes = documents.map(d => d.name.toLowerCase());
  const steps: CascadeStep[] = [];
  let allPreviousComplete = true;
  let stepId = 1;

  for (const prereq of scheme.prerequisites ?? []) {
    const has = uploadedTypes.some(u => u.includes(prereq.toLowerCase()) || prereq.toLowerCase().includes("aadhaar") && u.includes("aadhaar"));
    steps.push({
      id: stepId++,
      title: prereq,
      type: "prerequisite",
      status: allPreviousComplete ? (has ? "complete" : "missing") : "locked",
      description: "Required prerequisite document",
    });
    if (!has) allPreviousComplete = false;
  }

  for (const doc of scheme.required_documents ?? []) {
    if ((scheme.prerequisites ?? []).includes(doc)) continue; // skip duplicates
    const has = uploadedTypes.some(u => u.includes(doc.toLowerCase()) || doc.toLowerCase().includes("income") && u.includes("income"));
    steps.push({
      id: stepId++,
      title: doc,
      type: "document",
      status: allPreviousComplete ? (has ? "complete" : "missing") : "locked",
      description: "Required for application",
    });
    if (!has) allPreviousComplete = false;
  }

  steps.push({
    id: stepId,
    title: "Submit Application",
    type: "application",
    status: allPreviousComplete ? "complete" : "locked",
    description: "Official application submission",
  });

  return steps;
}
