"use client";

import React, { useState, useTransition } from "react";
import { FamilyMember } from "@/lib/db";
import { addFamilyMemberAction } from "@/app/actions";
import { Users, UserPlus, Heart, Briefcase, IndianRupee, Trash2, CalendarRange, X, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FamilySectionProps {
  initialMembers: FamilyMember[];
  isDemoMode: boolean;
}

export function FamilySection({ initialMembers, isDemoMode }: FamilySectionProps) {
  const [members, setMembers] = useState<FamilyMember[]>(initialMembers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("Spouse");
  const [age, setAge] = useState("");
  const [occupation, setOccupation] = useState("");
  const [income, setIncome] = useState("");
  const [formError, setFormError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age || !occupation.trim() || !income) {
      setFormError("All fields are required.");
      return;
    }
    setFormError("");

    const ageNum = parseInt(age);
    const incomeNum = parseInt(income);

    if (isNaN(ageNum) || ageNum <= 0) {
      setFormError("Please enter a valid age.");
      return;
    }
    if (isNaN(incomeNum) || incomeNum < 0) {
      setFormError("Please enter a valid annual income.");
      return;
    }

    startTransition(async () => {
      const result = await addFamilyMemberAction({
        name: name.trim(),
        relation,
        age: ageNum,
        occupation: occupation.trim(),
        annual_income: incomeNum,
      });

      if (result.success) {
        // Optimistically update UI local list since we don't have server-pushed ids, we'll recreate a temporary one
        const tempId = `temp-family-${Date.now()}`;
        setMembers([
          ...members,
          {
            id: tempId,
            user_id: "00000000-0000-0000-0000-000000000002",
            name: name.trim(),
            relation,
            age: ageNum,
            occupation: occupation.trim(),
            annual_income: incomeNum,
          },
        ]);
        // Reset form
        setName("");
        setAge("");
        setOccupation("");
        setIncome("");
        setShowAddForm(false);
      } else {
        setFormError(result.error || "Failed to add member.");
      }
    });
  };

  return (
    <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="p-6 border-b border-slate-100 flex flex-row items-center justify-between gap-4 bg-slate-50/20">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            Household Profile & Family Members
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            {isDemoMode
              ? "Standard pre-populated household data for demonstration."
              : "Define custom family members to enable aggregated household benefit calculations."}
          </CardDescription>
        </div>

        {!isDemoMode && !showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm rounded-lg"
          >
            <UserPlus className="h-4 w-4" /> Add Member
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Empty State */}
        {members.length === 0 && !showAddForm && (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No household members added</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-4">
              Add spouse, children, or dependents to configure custom family benefits eligibility.
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              variant="outline"
              size="sm"
              className="text-indigo-650 hover:text-indigo-700 border-indigo-200 hover:bg-indigo-50/50 cursor-pointer font-semibold"
            >
              Add Household Dependent
            </Button>
          </div>
        )}

        {/* Members Grid */}
        {members.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-start gap-4 p-4 border border-slate-150 rounded-xl bg-slate-50/30 hover:bg-slate-50/60 transition-colors shadow-sm"
              >
                {/* Initial Icon */}
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0 font-bold text-sm">
                  {member.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">
                      {member.name}
                    </h4>
                    <span className="bg-indigo-50/80 text-indigo-700 font-semibold px-2 py-0.5 rounded border border-indigo-100/50 text-[10px]">
                      {member.relation}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-slate-500 font-medium">
                    <div className="flex items-center gap-1">
                      <CalendarRange className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{member.age} years old</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{member.occupation}</span>
                    </div>
                    <div className="flex items-center gap-1 col-span-2">
                      <IndianRupee className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Annual Income: <strong className="text-slate-800 font-bold">₹{member.annual_income.toLocaleString("en-IN")}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Form Inline */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="border border-slate-200 bg-slate-50/50 rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 mb-2">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <UserPlus className="h-4 w-4 text-indigo-600" />
                Add Dependent Profile
              </h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-1 hover:bg-slate-200 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anjali Menon"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  style={{ minHeight: "36px" }}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Relationship
                </label>
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  style={{ minHeight: "36px" }}
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other Dependent">Other Dependent</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Age (years)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 24"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  style={{ minHeight: "36px" }}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Occupation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Student, Sowing Laborer"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  style={{ minHeight: "36px" }}
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Annual Income (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 0 or 45000"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  style={{ minHeight: "36px" }}
                />
              </div>
            </div>

            {formError && (
              <p className="text-red-600 font-semibold text-xs leading-normal">
                {formError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/50">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="h-9 font-semibold text-xs cursor-pointer border-slate-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                size="sm"
                className="h-9 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1 cursor-pointer rounded-lg shadow-sm"
              >
                {isPending ? "Saving..." : "Add Member"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
