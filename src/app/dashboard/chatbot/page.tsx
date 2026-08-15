"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, ChevronDown, RefreshCw, MessageSquare } from "lucide-react";
import { getAllSchemesAction } from "@/app/actions";
import { Scheme } from "@/lib/db";

interface Message {
  role: "user" | "assistant";
  content: string;
  source?: "gemini" | "local" | "groq";
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "Who is eligible for this scheme?",
  "What documents do I need to apply?",
  "How much benefit will I receive?",
  "What is the application deadline?",
  "How do I apply for this scheme?",
  "Can my family members also apply?",
];

export default function ChatbotPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am SchemeFit AI, your welfare scheme assistant. Please select a scheme from the dropdown above to get started, and I will answer all your questions about eligibility, benefits, required documents, and the application process!",
      source: "groq",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [schemesLoading, setSchemesLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function loadSchemes() {
      const res = await getAllSchemesAction();
      if (res.success && res.schemes) {
        setSchemes(res.schemes);
      }
      setSchemesLoading(false);
    }
    loadSchemes();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSchemeChange = (schemeId: string) => {
    const scheme = schemes.find(s => s.id === schemeId) || null;
    setSelectedScheme(scheme);
    if (scheme) {
      const welcomeMessage: Message = {
        role: "assistant",
        content: `Great choice! I am now focused on the **${scheme.title}** scheme by ${scheme.ministry || "Government of India"}.\n\nThis scheme offers up to ₹${(scheme.max_benefit_amount || 0).toLocaleString("en-IN")} in benefits. What would you like to know about it?`,
        source: "groq",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const sendMessage = async (text?: string) => {
    const questionText = text || input.trim();
    if (!questionText || isLoading) return;
    setInput("");

    const userMessage: Message = {
      role: "user",
      content: questionText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText,
          scheme: selectedScheme,
          history,
        }),
      });

      const data = await res.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer || "Sorry, I could not process your question. Please try again.",
        source: data.source || "local",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Network error. Please check your connection and try again.",
        source: "local",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-bold text-[10px] uppercase tracking-wider">
          <Bot className="h-3 w-3" />
          SchemeFit AI Assistant
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Scheme Q&amp;A Chatbot</h1>
        <p className="text-slate-500 text-xs">
          Select a scheme below and ask any question — eligibility, documents, benefits, deadlines, and more.
        </p>
      </div>

      {/* Scheme Selector */}
      <div className="mb-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-indigo-500" />
          Select a Scheme to Ask About
        </label>
        <div className="relative">
          <select
            value={selectedScheme?.id || ""}
            onChange={(e) => handleSchemeChange(e.target.value)}
            disabled={schemesLoading}
            className="w-full px-4 py-2.5 pr-10 text-sm font-semibold text-slate-800 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none disabled:opacity-50 cursor-pointer"
            style={{ minHeight: "44px" }}
            id="scheme-selector"
          >
            <option value="">
              {schemesLoading ? "Loading schemes..." : "-- Select a welfare scheme to get started --"}
            </option>
            {schemes.map(s => (
              <option key={s.id} value={s.id}>
                {s.title} {s.ministry ? `· ${s.ministry}` : ""}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        {selectedScheme && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedScheme.category && (
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {selectedScheme.category}
              </span>
            )}
            {selectedScheme.state && (
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {selectedScheme.state}
              </span>
            )}
            {selectedScheme.max_benefit_amount && (
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                Up to ₹{selectedScheme.max_benefit_amount.toLocaleString("en-IN")}
              </span>
            )}
            {selectedScheme.deadline && (
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                Deadline: {new Date(selectedScheme.deadline).toLocaleDateString("en-IN")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      {selectedScheme && (
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              disabled={isLoading}
              className="text-[10px] font-semibold px-3 py-1.5 rounded-full bg-white border border-indigo-100 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer disabled:opacity-50"
              style={{ minHeight: "28px" }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1 min-h-0">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 animate-in fade-in duration-200 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${msg.role === "user" ? "bg-indigo-600" : "bg-gradient-to-br from-indigo-500 to-purple-600"}`}>
              {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[78%] space-y-1 ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                }`}
                style={{ whiteSpace: "pre-wrap" }}
              >
                {msg.content}
              </div>
              <div className={`flex items-center gap-1.5 text-[9px] text-slate-400 font-medium ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <span>{formatTime(msg.timestamp)}</span>
                {msg.role === "assistant" && (msg.source === "groq" || msg.source === "gemini") && (
                  <span className="flex items-center gap-0.5 text-indigo-400">
                    <Sparkles className="h-2.5 w-2.5" />
                    Groq AI
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 animate-in fade-in duration-200">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 text-indigo-500 animate-spin" />
              <span className="text-xs text-slate-500 font-medium">SchemeFit AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-3 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-end gap-2 p-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedScheme ? `Ask anything about "${selectedScheme.title}"...` : "Select a scheme above, then ask your question..."}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none py-1 leading-relaxed max-h-32 overflow-y-auto"
            style={{ minHeight: "36px" }}
            id="chat-input"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed shadow-sm"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="px-4 pb-2 flex items-center gap-2">
          <MessageSquare className="h-3 w-3 text-slate-400" />
          <span className="text-[9px] text-slate-400">
            Press Enter to send · Shift+Enter for new line · Powered by Groq AI
          </span>
        </div>
      </div>
    </div>
  );
}
