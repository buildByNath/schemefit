import React from "react";
import { getUser, getUserDocuments } from "@/lib/db";
import { DocumentVault } from "@/components/DocumentVault";
import { Files, AlertCircle } from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Force dynamic rendering

export default async function DocumentsPage() {
  const user = await getUser();
  const isProfileIncomplete = !user || !user.annual_income || !user.caste_category;
  
  const documents = isProfileIncomplete ? [] : await getUserDocuments(user!.id);

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

      {isProfileIncomplete ? (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Complete your profile first</p>
            <p className="text-xs text-amber-600 mt-0.5">Set up your profile before uploading documents.</p>
          </div>
          <Link href="/" className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-2 rounded-lg transition-colors">
            Setup Profile →
          </Link>
        </div>
      ) : (
        <DocumentVault initialDocuments={documents} />
      )}
    </div>
  );
}
