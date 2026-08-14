"use client";

import { useState, useRef, useEffect } from "react";
import type { User, Scheme, UserDocument } from "@/lib/db";
import { getAssistantResponse, type AssistantResponse } from "@/lib/ai";
import { Send, Bot, User as UserIcon } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  data?: unknown;
}

const SUGGESTIONS = [
  "What benefits do I have?",
  "What documents am I missing?",
  "Which deadline is closest?",
  "Why am I eligible?",
];

export function AssistantChat({
  user,
  schemes,
  documents
}: {
  user: User;
  schemes: Scheme[];
  documents: UserDocument[];
}) {
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: `Hi ${user.full_name?.split(" ")[0] ?? "there"}! 👋 I'm your SATURNX assistant. I can help you understand your benefits, check missing documents, and track deadlines. What would you like to know?`,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text?: string) {
    const query = text ?? input.trim();
    if (!query) return;
    setInput("");
    setLoading(true);

    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: query }]);

    // Small delay for UX feel
    await new Promise(r => setTimeout(r, 400)); 

    const response: AssistantResponse = getAssistantResponse(query, {
      user,
      schemes,
      documents
    });

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response.message,
      data: response.data,
    }]);
    setLoading(false);
  }

  function formatMessage(content: string) {
    return content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");
  }

  return (
    <>
      {/* Header inside chat box */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-3 shrink-0">
        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
          <Bot className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <div className="font-bold text-sm text-slate-800">Smart Agent</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Rule-based Engine</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-indigo-600" : "bg-slate-200"}`}>
              {msg.role === "user" ? <UserIcon className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-slate-600" />}
            </div>
            <div className={`max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-sm shadow-sm"
                    : "bg-slate-100 text-slate-800 rounded-tl-sm border border-slate-200"
                }`}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
              {msg.role === "assistant" && Array.isArray(msg.data) && msg.data.length > 0 && typeof msg.data[0] === 'object' && 'title' in msg.data[0] && (
                <div className="mt-3 space-y-2 w-full max-w-sm">
                  {msg.data.slice(0, 2).map((item: any, i: number) => (
                    <Link key={i} href={`/dashboard/schemes/${item.id}`} className="block p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all text-left">
                      <div className="font-bold text-sm text-slate-900 truncate">{item.title}</div>
                      {item.deadline && (
                         <div className="text-xs text-orange-600 mt-1">Deadline: {new Date(item.deadline).toLocaleDateString()}</div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-slate-600" />
            </div>
            <div className="px-4 py-3 bg-slate-100 rounded-2xl rounded-tl-sm border border-slate-200 flex items-center">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 bg-white shrink-0">
        {messages.length === 1 && (
          <div className="pb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => handleSend(s)}
                className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full px-3 py-1.5 transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2 relative">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask about your benefits, documents, or deadlines…"
            className="flex-1 h-12 px-5 border border-slate-300 rounded-full bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition-all pr-14"
          />
          <button onClick={() => handleSend()} disabled={!input.trim() || loading}
            className="absolute right-1 top-1 h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm">
            <Send className="h-4 w-4 -ml-0.5" />
          </button>
        </div>
      </div>
    </>
  );
}
