"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { Mic, MicOff, RefreshCw, Sparkles, Check, ChevronRight, Keyboard, Database } from "lucide-react";
import { saveUserProfile } from "@/app/actions";
import { useRouter } from "next/navigation";
import { ParsedProfile } from "@/lib/parser";

export function VoiceOnboarding() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognitionError, setRecognitionError] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, startTransition] = useTransition();
  const [apiSource, setApiSource] = useState<"gemini" | "local" | null>(null);

  // Form State (Manual by default, pre-filled with standard values)
  const [fullName, setFullName] = useState("Rahul Menon");
  const [profile, setProfile] = useState<ParsedProfile>({
    annual_income: 250000,
    caste_category: "OBC",
    education: "Undergraduate",
    occupation: "Student",
  });

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Stop after a single sentence
        recognition.interimResults = false;
        recognition.lang = "en-IN";

        recognition.onstart = () => {
          setIsListening(true);
          setRecognitionError("");
          setApiSource(null);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === "not-allowed") {
            setRecognitionError("Microphone access blocked. Please enable it in browser settings.");
          } else {
            setRecognitionError(`Speech error: ${event.error}. Please try typing or manual edit.`);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onresult = async (event: any) => {
          const spokenText = event.results[0][0].transcript;
          if (spokenText) {
            setTranscript(spokenText);
            await parseProfileText(spokenText);
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setRecognitionError("Speech recognition is not supported in this browser. Please use the manual form.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript("");
      setRecognitionError("");
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  const parseProfileText = async (text: string) => {
    setIsParsing(true);
    try {
      const res = await fetch("/api/parse-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          annual_income: data.annual_income ?? 250000,
          caste_category: data.caste_category ?? "General",
          education: data.education ?? "Undergraduate",
          occupation: data.occupation ?? "Student",
        });
        setApiSource(data.source || "local");
      }
    } catch (e) {
      console.error("API parsing failed, falling back to local client parsing:", e);
    } finally {
      setIsParsing(false);
    }
  };

  const handleManualTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transcript.trim()) {
      await parseProfileText(transcript);
    }
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveUserProfile({
        full_name: fullName,
        voice_raw_text: transcript || "Manually typed",
        annual_income: profile.annual_income,
        caste_category: profile.caste_category,
        education: profile.education,
        occupation: profile.occupation,
      });

      if (result.success) {
        router.push("/dashboard");
      } else {
        alert(result.error || "Failed to save profile. Please try again.");
      }
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-4 space-y-8">
      {/* Header Introduction */}
      <div className="text-center space-y-2.5 max-w-xl mx-auto mb-4 animate-in fade-in duration-300">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-semibold text-[10px] uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          Conversational Smart Intake
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
          Setup Your Welfare Profile
        </h1>
        <p className="text-slate-500 text-sm md:text-base leading-normal">
          Fill in the details manually on the right, or press the mic and speak to let our AI parsing engine pre-fill the form instantly.
        </p>
      </div>

      {/* Split Dashboard Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Panel: Voice Assistant */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-between min-h-[380px] hover:shadow-md transition-shadow">
          <div className="text-center w-full space-y-1.5 border-b border-slate-100 pb-4 mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center justify-center gap-1.5">
              <Mic className="h-4 w-4 text-blue-600" />
              Voice Assistant
            </h3>
            <p className="text-slate-400 text-xs">
              Say: &ldquo;I am Rahul, an OBC student with 2.5 lakh income&rdquo;
            </p>
          </div>

          {/* Pulsing Mic Button */}
          <div className="flex flex-col items-center justify-center my-6">
            <button
              onClick={toggleListening}
              className={`relative flex items-center justify-center w-20 h-20 rounded-full border shadow transition-all duration-300 cursor-pointer ${
                isListening
                  ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100/80 scale-105"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-100"
              }`}
              style={{ minHeight: "48px" }}
              aria-label="Start Voice Intake"
            >
              {isListening ? (
                <>
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20 animate-ping"></span>
                  <Mic className="h-8 w-8 animate-pulse" />
                </>
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </button>
            <span className="mt-2 text-xs font-semibold text-slate-500">
              {isListening ? "Listening... Speak now" : "Click to Speak"}
            </span>
          </div>

          {/* Transcript Log & Manual Speech Override */}
          <form onSubmit={handleManualTextSubmit} className="w-full space-y-3">
            <div className="relative">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Spoken transcription will appear here... (You can also type a description here and click Parse)"
                className="w-full min-h-[80px] p-3 text-slate-800 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
              />
              {isParsing && (
                <div className="absolute right-3 bottom-3 flex items-center gap-1.5 text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-150 animate-pulse">
                  <RefreshCw className="h-3 w-3 animate-spin" /> AI Parsing...
                </div>
              )}
              {apiSource && (
                <div className="absolute right-3 bottom-3 flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150">
                  <Check className="h-3 w-3" /> Auto-Filled via {apiSource === "gemini" ? "Gemini AI" : "Local AI"}
                </div>
              )}
            </div>

            {transcript.trim() && !isParsing && (
              <button
                type="submit"
                className="w-full bg-slate-100 hover:bg-slate-250 border border-slate-200 text-slate-700 font-bold text-xs py-2 rounded-lg transition-colors cursor-pointer"
                style={{ minHeight: "36px" }}
              >
                Re-Parse Text Description
              </button>
            )}

            {recognitionError && (
              <p className="text-center text-red-600 font-semibold text-xs mt-1">{recognitionError}</p>
            )}
          </form>
        </div>

        {/* Right Panel: Manual Input Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-4 flex items-center gap-1.5">
            <Keyboard className="h-4 w-4 text-indigo-500" />
            Profile Details (Manual Inputs)
          </h3>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                style={{ minHeight: "36px" }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Annual Household Income (₹)
                </label>
                <input
                  type="number"
                  value={profile.annual_income || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, annual_income: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  style={{ minHeight: "36px" }}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Caste Category
                </label>
                <select
                  value={profile.caste_category || "General"}
                  onChange={(e) => setProfile({ ...profile, caste_category: e.target.value })}
                  className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  style={{ minHeight: "36px" }}
                >
                  <option value="General">General / Open</option>
                  <option value="OBC">OBC (Other Backward Classes)</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Education Level
                </label>
                <select
                  value={profile.education || "Undergraduate"}
                  onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                  className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  style={{ minHeight: "36px" }}
                >
                  <option value="School">School Education</option>
                  <option value="Undergraduate">Undergraduate Degree</option>
                  <option value="Postgraduate">Postgraduate / Masters</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Occupation
                </label>
                <select
                  value={profile.occupation || "Student"}
                  onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                  className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  style={{ minHeight: "36px" }}
                >
                  <option value="Student">Student (Full Time)</option>
                  <option value="Farmer">Farmer / Agriculture Worker</option>
                  <option value="Worker">Other Worker</option>
                  <option value="None">Unemployed / None</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving || isParsing}
              className="flex items-center gap-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer text-xs"
              style={{ minHeight: "44px" }}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Saving Profile...
                </>
              ) : (
                <>
                  Confirm & Match Schemes <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
