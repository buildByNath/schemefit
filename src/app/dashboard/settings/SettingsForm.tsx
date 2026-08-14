"use client";

import { useState } from "react";
import { Shield, Save, User as UserIcon } from "lucide-react";
import { saveUserProfile } from "@/app/actions";

export function SettingsForm({ initialUser }: { initialUser: any }) {
  const [fullName, setFullName] = useState(initialUser.full_name || "");
  const [annualIncome, setAnnualIncome] = useState(initialUser.annual_income || 250000);
  const [casteCategory, setCasteCategory] = useState(initialUser.caste_category || "General");
  const [education, setEducation] = useState(initialUser.education || "Undergraduate");
  const [occupation, setOccupation] = useState(initialUser.occupation || "Student");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const res = await saveUserProfile({
      full_name: fullName,
      voice_raw_text: initialUser.voice_raw_text || "Manual Edit",
      annual_income: annualIncome,
      caste_category: casteCategory,
      education,
      occupation,
    });
    setIsSaving(false);
    if (res.success) {
      alert("Profile updated successfully!");
    } else {
      alert("Failed to update profile.");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
            <UserIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Profile Settings</h2>
            <p className="text-sm text-slate-500">Update your demographic data for accurate scheme matching.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Annual Income (₹)</label>
              <input
                type="number"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Caste Category</label>
              <select
                value={casteCategory}
                onChange={(e) => setCasteCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white"
              >
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Education</label>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white"
              >
                <option value="School">School</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Occupation</label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white"
              >
                <option value="Student">Student</option>
                <option value="Farmer">Farmer</option>
                <option value="Worker">Worker</option>
                <option value="None">None</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-5 w-5 text-slate-400" />
          <h3 className="font-bold text-slate-700">Account Security</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          For demo purposes, password resets and email updates are disabled.
        </p>
      </div>
    </div>
  );
}
