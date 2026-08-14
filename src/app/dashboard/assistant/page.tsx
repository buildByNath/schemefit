import { getUser, getSchemes, getUserDocuments, getActiveUserId } from "@/lib/db";
import { AssistantChat } from "./AssistantChat";
import { redirect } from "next/navigation";

export default async function AssistantPage() {
  const userId = await getActiveUserId();
  const [user, schemes, documents] = await Promise.all([
    getUser(userId),
    getSchemes(),
    getUserDocuments(userId)
  ]);

  if (!user) {
    redirect("/");
  }

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-3.5rem)] flex flex-col max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">AI Assistant</h1>
        <p className="text-sm text-slate-500">Ask questions about your eligibility, deadlines, and missing documents.</p>
      </div>
      
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col relative">
        <AssistantChat user={user} schemes={schemes} documents={documents} />
      </div>
    </div>
  );
}
