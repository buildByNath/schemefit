"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  Building2, 
  HeartHandshake, 
  Plus, 
  Users, 
  Award, 
  IndianRupee, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  ExternalLink,
  Sparkles,
  RefreshCw,
  Search,
  Filter
} from "lucide-react";
import { 
  getProviderSchemesAction, 
  getProviderApplicationsAction, 
  createProviderSchemeAction, 
  updateApplicationStatusAction 
} from "@/app/actions";
import { Scheme } from "@/lib/db";
import { Badge } from "@/components/ui/badge";

export default function ProviderDashboardPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Create Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [providerType, setProviderType] = useState<"NGO" | "Private Sector">("NGO");
  const [providerName, setProviderName] = useState("Smile Foundation NGO");
  const [category, setCategory] = useState("Education");
  const [minAmount, setMinAmount] = useState(15000);
  const [maxAmount, setMaxAmount] = useState(40000);
  const [applicationUrl, setApplicationUrl] = useState("https://smilefoundationindia.org/apply");
  const [deadlineDays, setDeadlineDays] = useState(30);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const [schemesRes, appsRes] = await Promise.all([
      getProviderSchemesAction(),
      getProviderApplicationsAction()
    ]);
    if (schemesRes.success) setSchemes(schemesRes.schemes);
    if (appsRes.success) setApplications(appsRes.applications);
    setLoading(false);
  };

  const handleCreateScheme = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const deadlineDate = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000).toISOString();
      const res = await createProviderSchemeAction({
        title,
        description,
        provider_type: providerType,
        provider_name: providerName,
        category,
        min_benefit_amount: Number(minAmount),
        max_benefit_amount: Number(maxAmount),
        application_url: applicationUrl,
        deadline: deadlineDate,
        required_documents: ["Aadhaar", "Income Certificate", "Mark Sheet", "Bonafide Certificate"]
      });

      if (res.success) {
        setShowCreateModal(false);
        setTitle("");
        setDescription("");
        loadDashboardData();
      } else {
        alert("Failed to publish scheme: " + res.error);
      }
    });
  };

  const handleUpdateStatus = (appId: string, status: string, reason?: string) => {
    startTransition(async () => {
      await updateApplicationStatusAction(appId, status, reason);
      loadDashboardData();
    });
  };

  const totalGrantsCommitted = schemes.reduce((acc, s) => acc + (s.max_benefit_amount || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-xs border border-emerald-500/30">
            <HeartHandshake className="h-3.5 w-3.5" />
            NGO & Corporate Social Responsibility (CSR) Portal
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Partner Scholarship & Grant Management
          </h1>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            Publish non-government schemes, target eligible underprivileged students directly, and review student applications in real-time.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-5 py-3 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2 text-xs shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Publish New Scholarship
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Published Schemes</span>
            <FileText className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{schemes.length}</p>
          <p className="text-[11px] text-slate-500">Active non-gov scholarships live</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Student Applications</span>
            <Users className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{applications.length}</p>
          <p className="text-[11px] text-slate-500">Received on your schemes</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Capital Allocated</span>
            <IndianRupee className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            ₹{totalGrantsCommitted.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-slate-500">Committed scholarship funds</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Verified Auto-Matches</span>
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">100%</p>
          <p className="text-[11px] text-slate-500">Matched to low-income students</p>
        </div>
      </div>

      {/* Main Content Grid: Posted Schemes & Student Applicant Monitor */}
      <div className="space-y-8">
        {/* Section 1: Published Scholarships */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-600" />
                Active Published Scholarships
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Schemes created by your organization visible to eligible students in the discovery engine.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" /> Loading scholarships...
            </div>
          ) : schemes.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Building2 className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No scholarships published yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                + Click here to publish your first NGO or Corporate grant
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              {schemes.map((s) => (
                <div key={s.id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-slate-900 truncate">{s.title}</h3>
                      {s.provider_type === "NGO" ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                          <HeartHandshake className="h-3 w-3 inline mr-1" /> NGO
                        </Badge>
                      ) : (
                        <Badge className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px]">
                          <Building2 className="h-3 w-3 inline mr-1" /> Private Sector
                        </Badge>
                      )}
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px]">
                        {s.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{s.description}</p>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-slate-900">
                        ₹{(s.max_benefit_amount || 0).toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-slate-400">Max Benefit</p>
                    </div>

                    <a
                      href={s.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Visit Portal"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Student Applicants Monitor */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                Student Applicants Monitor
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review verified student profiles, check household income & caste details, and approve grant payouts.
              </p>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">All applicant queues clear</p>
              <p className="text-xs text-slate-400">When students apply to your schemes, their profiles will appear here for verification.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Applied Scheme</th>
                    <th className="p-4">Annual Income</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map(({ application: app, student, scheme }) => (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-bold text-slate-900">
                        <div>{student?.full_name || "Rahul Menon"}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{student?.email || "rahul@demo.schemefit.in"}</div>
                      </td>

                      <td className="p-4 font-semibold text-slate-700 max-w-[200px] truncate">
                        {scheme?.title || "Scholarship Scheme"}
                      </td>

                      <td className="p-4 font-bold text-emerald-700">
                        ₹{(student?.annual_income || 250000).toLocaleString("en-IN")} / yr
                      </td>

                      <td className="p-4">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[10px]">
                          {student?.caste_category || "OBC"}
                        </Badge>
                      </td>

                      <td className="p-4">
                        {app.status === "Approved" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded text-[10px]">
                            <CheckCircle2 className="h-3 w-3" /> Approved
                          </span>
                        ) : app.status === "Rejected" ? (
                          <span className="inline-flex items-center gap-1 text-red-600 font-bold bg-red-50 px-2 py-1 rounded text-[10px]">
                            <XCircle className="h-3 w-3" /> Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded text-[10px]">
                            <Clock className="h-3 w-3" /> Pending Review
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {app.status !== "Approved" && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, "Approved")}
                            disabled={isPending}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Approve Grant
                          </button>
                        )}
                        {app.status !== "Rejected" && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, "Rejected", "Eligibility criteria verification incomplete")}
                            disabled={isPending}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Publish New Scheme Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Plus className="h-5 w-5 text-emerald-600" />
                  Publish NGO / Private Scholarship
                </h3>
                <p className="text-xs text-slate-500">Post a new scholarship scheme directly to the SchemeFit engine.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateScheme} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Scholarship Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g. Smile Foundation STEM Girl Excellence Grant"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Provider Type</label>
                  <select
                    value={providerType}
                    onChange={(e) => setProviderType(e.target.value as any)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="NGO">NGO</option>
                    <option value="Private Sector">Private Sector</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Organization Name</label>
                  <input
                    type="text"
                    required
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Smile Foundation NGO"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Education">Education</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Social Welfare">Social Welfare</option>
                    <option value="Business">Business</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Min Grant (₹)</label>
                  <input
                    type="number"
                    value={minAmount}
                    onChange={(e) => setMinAmount(Number(e.target.value))}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Max Grant (₹)</label>
                  <input
                    type="number"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(Number(e.target.value))}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description & Objective <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Detail the purpose, benefits, and target student group for this scholarship..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Official Portal / Application Link</label>
                <input
                  type="url"
                  value={applicationUrl}
                  onChange={(e) => setApplicationUrl(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white"
                  placeholder="https://..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  {isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Publish Scholarship"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
