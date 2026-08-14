"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, ArrowRight, Building2, GraduationCap, HeartHandshake } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [role, setRole] = useState<"student" | "ngo" | "private_sector">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signUpError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          organization_name: role !== "student" ? organizationName : null,
          registration_no: role !== "student" ? registrationNo : null,
          website_url: role !== "student" ? websiteUrl : null,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      if (role === "ngo" || role === "private_sector") {
        router.push("/dashboard/provider");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } else {
      setSuccessMsg("Account created! Check your email for confirmation, or log in to proceed.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-2">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Join SchemeFit</h1>
          <p className="text-sm text-slate-500">
            Select your account type to access personalized welfare or publish scholarships.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all cursor-pointer ${
              role === "student"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Student / Citizen</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("ngo")}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all cursor-pointer ${
              role === "ngo"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <HeartHandshake className="h-4 w-4" />
            <span>NGO Partner</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("private_sector")}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all cursor-pointer ${
              role === "private_sector"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Private Sector</span>
          </button>
        </div>

        <form onSubmit={handleSignup} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
              {successMsg}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              {role === "student" ? "Full Legal Name" : "Contact Person Name"} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder={role === "student" ? "Rahul Menon" : "Dr. Anita Sharma"}
            />
          </div>

          {/* Organization Specific Fields */}
          {role !== "student" && (
            <>
              <div className="space-y-1 animate-in fade-in duration-200">
                <label className="text-xs font-bold text-slate-700">
                  {role === "ngo" ? "NGO / Foundation Name" : "Company / Corporate Name"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder={role === "ngo" ? "Smile Foundation NGO" : "Tata Group CSR Division"}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Reg. / Tax ID No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={registrationNo}
                    onChange={(e) => setRegistrationNo(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                    placeholder="e.g. 12A/80G/CSR-99"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Website URL</label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              {role === "student" ? "Email Address" : "Official Organization Email"} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder={role === "student" ? "rahul@example.com" : "contact@organization.org"}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="•••••••• (min 6 characters)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl text-white text-xs font-bold transition-all shadow-md cursor-pointer ${
              role === "ngo"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : role === "private_sector"
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Creating Account..." : `Sign Up as ${role === "ngo" ? "NGO Partner" : role === "private_sector" ? "Private Sector Sponsor" : "Student"}`}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="text-indigo-600 hover:underline font-bold">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
