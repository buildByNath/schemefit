import React from "react";
import { redirect } from "next/navigation";
import { getUser, getUserDocuments } from "@/lib/db";
import { DocumentVault } from "@/components/DocumentVault";
import { Files } from "lucide-react";

export const revalidate = 0; // Force dynamic rendering

export default async function DocumentsPage() {
  const user = await getUser();
  
  // If user details are not initialized (or empty), redirect to onboarding
  if (!user || !user.annual_income || !user.caste_category) {
    redirect("/");
  }

  const documents = await getUserDocuments(user.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6 md:p-8 bg-slate-50 min-h-screen">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-wider">
          <Files className="h-3.5 w-3.5" />
          Secure Document Repository
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          My Encrypted Vault
        </h1>
        <p className="text-slate-500 text-xs max-w-xl">
          Securely manage your personal identification documents and income certificates. Files are automatically encrypted client-side using bank-grade AES-256 keys.
        </p>
      </div>

      <DocumentVault initialDocuments={documents} />
    </div>
  );
}
