"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { Mic, MicOff, RefreshCw, Sparkles, Check, ChevronRight, Keyboard, Database } from "lucide-react";
import { saveUserProfile } from "@/app/actions";
import { useRouter } from "next/navigation";
import { ParsedProfile } from "@/lib/parser";
import confetti from "canvas-confetti";

export function VoiceOnboarding() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognitionError, setRecognitionError] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, startTransition] = useTransition();
  const [apiSource, setApiSource] = useState<"gemini" | "groq" | "local" | null>(null);

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
        recognition.continuous = true;
        recognition.interimResults = false; // Keep false to avoid duplicate appends on interim changes
        recognition.lang = typeof navigator !== "undefined" ? navigator.language : "en-US";

        recognition.onstart = () => {
          setIsListening(true);
          setRecognitionError("");
          setApiSource(null);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition warning/error:", event.error);
          if (event.error === "not-allowed") {
            setRecognitionError("Microphone access blocked. Please enable it in browser settings.");
            setIsListening(false);
          } else if (event.error === "no-speech") {
            // Do nothing on no-speech so it doesn't interrupt the user who might just be pausing
            console.log("Ignored no-speech timeout");
          } else {
            setRecognitionError(`Speech error: ${event.error}. Please try typing or manual edit.`);
            setIsListening(false);
          }
        };

        recognition.onend = () => {
          // If we want it to truly be continuous until the user clicks stop, we could restart it here
          setIsListening(false);
        };

        let parseTimeout: NodeJS.Timeout;

        recognition.onresult = (event: any) => {
          let newWords = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            newWords += event.results[i][0].transcript + " ";
          }
          
          if (newWords.trim()) {
            setTranscript((prev) => {
              const updatedText = prev ? prev + " " + newWords.trim() : newWords.trim();
              
              // Debounce parsing so it waits for the user to finish speaking
              clearTimeout(parseTimeout);
              parseTimeout = setTimeout(async () => {
                await parseProfileText(updatedText);
              }, 1500);

              return updatedText;
            });
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
        if (data.full_name) {
          setFullName(data.full_name);
        }
        setProfile((prev) => ({
          ...prev,
          annual_income: data.annual_income ?? prev.annual_income,
          caste_category: data.caste_category ?? prev.caste_category,
          education: data.education ?? prev.education,
          occupation: data.occupation ?? prev.occupation,
          date_of_birth: data.date_of_birth ?? prev.date_of_birth,
          gender: data.gender ?? prev.gender,
          marital_status: data.marital_status ?? prev.marital_status,
          religion: data.religion ?? prev.religion,
          is_differently_abled: data.is_differently_abled ?? prev.is_differently_abled,
          bpl_status: data.bpl_status ?? prev.bpl_status,
          home_state: data.home_state ?? prev.home_state,
          phone: data.phone ?? prev.phone,
          email: data.email ?? prev.email,
          district: data.district ?? prev.district,
          address: data.address ?? prev.address,
          exchange_reg: data.exchange_reg ?? prev.exchange_reg,
          aadhar: data.aadhar ?? prev.aadhar,
          bank_account: data.bank_account ?? prev.bank_account,
          ifsc_code: data.ifsc_code ?? prev.ifsc_code,
          bank_name: data.bank_name ?? prev.bank_name,
        }));
        setApiSource(data.source || "local");
      }
    } catch (e) {
      console.error("API parsing failed, falling back to local client parsing:", e);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSampleClick = (sampleText: string) => {
    setTranscript(sampleText);
    parseProfileText(sampleText);
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
        date_of_birth: profile.date_of_birth,
        gender: profile.gender,
        marital_status: profile.marital_status,
        religion: profile.religion,
        is_differently_abled: profile.is_differently_abled,
        bpl_status: profile.bpl_status,
        state: profile.home_state,
      });

      if (result.success) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => { window.location.href = "/dashboard"; }, 800);
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
          Quick Setup
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
          Tell us about yourself
        </h1>
        <p className="text-slate-500 text-sm md:text-base leading-normal">
          You can either type your details on the right, or just tap the microphone and tell us out loud. We'll fill out the form for you.
        </p>
      </div>

      {/* Split Dashboard Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Panel: Voice Assistant */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-between min-h-[380px] hover:shadow-md transition-shadow">
          <div className="text-center w-full space-y-1.5 border-b border-slate-100 pb-4 mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center justify-center gap-1.5">
              <Mic className="h-4 w-4 text-blue-600" />
              Speak to us
            </h3>
            <div className="flex flex-col items-center gap-1">
              <span className="text-slate-400 text-xs font-medium">Try clicking or saying:</span>
              <button
                type="button"
                onClick={() => handleSampleClick("I am Rahul, an OBC student with 2.5 lakh income")}
                className="text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-95"
              >
                &ldquo;I am Rahul, an OBC student with 2.5 lakh income&rdquo;
              </button>
            </div>
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
                  <RefreshCw className="h-3 w-3 animate-spin" /> Processing...
                </div>
              )}
              {apiSource && (
                <div className="absolute right-3 bottom-3 flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150">
                  <Check className="h-3 w-3" /> Filled by AI
                </div>
              )}
            </div>

            {transcript.trim() && !isParsing && (
              <button
                type="submit"
                className="w-full bg-slate-100 hover:bg-slate-250 border border-slate-200 text-slate-700 font-bold text-xs py-2 rounded-lg transition-colors cursor-pointer"
                style={{ minHeight: "36px" }}
              >
                Try understanding this again
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
            Type your details
          </h3>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 pb-2">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="As per Aadhaar/Bank"
                className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={profile.date_of_birth || ""}
                  onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                  className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                  <input
                    type="checkbox"
                    checked={profile.is_differently_abled || false}
                    onChange={(e) => setProfile({ ...profile, is_differently_abled: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-slate-700">Differently Abled</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                  <input
                    type="checkbox"
                    checked={profile.bpl_status || false}
                    onChange={(e) => setProfile({ ...profile, bpl_status: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-slate-700">BPL Card Holder</span>
                </label>
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Home State
              </label>
              <input
                type="text"
                value={profile.home_state || ""}
                onChange={(e) => setProfile({ ...profile, home_state: e.target.value })}
                className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Gender
                </label>
                <select
                  value={profile.gender || ""}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Marital Status
                </label>
                <select
                  value={profile.marital_status || ""}
                  onChange={(e) => setProfile({ ...profile, marital_status: e.target.value })}
                  className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Religion
                </label>
                <select
                  value={profile.religion || ""}
                  onChange={(e) => setProfile({ ...profile, religion: e.target.value })}
                  className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Religion</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Christian">Christian</option>
                  <option value="Sikh">Sikh</option>
                  <option value="Buddhist">Buddhist</option>
                  <option value="Jain">Jain</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Annual Household Income (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={profile.annual_income || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, annual_income: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Education
                </label>
                <select
                  value={profile.education || "Undergraduate"}
                  onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                  className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  style={{ minHeight: "36px" }}
                >
                  <option value="School">School</option>
                  <option value="Undergraduate">Undergrad</option>
                  <option value="Postgraduate">Postgrad</option>
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
                  <option value="Student">Student</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Worker">Worker</option>
                  <option value="NGO/Private sector">NGO / Private Sector Sponsor</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-800 text-xs mb-3">Contact Details</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                  <input
                    type="tel"
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={profile.email || ""}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">District</label>
                  <input
                    type="text"
                    value={profile.district || ""}
                    onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                    className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address / Town</label>
                  <input
                    type="text"
                    value={profile.address || ""}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-800 text-xs mb-3">Identity & Bank Details</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aadhaar Number</label>
                  <input
                    type="text"
                    value={profile.aadhar || ""}
                    onChange={(e) => setProfile({ ...profile, aadhar: e.target.value })}
                    className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employment Exchange No.</label>
                  <input
                    type="text"
                    value={profile.exchange_reg || ""}
                    onChange={(e) => setProfile({ ...profile, exchange_reg: e.target.value })}
                    placeholder="e.g. EX-HP-40291"
                    className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bank Account</label>
                  <input
                    type="text"
                    value={profile.bank_account || ""}
                    onChange={(e) => setProfile({ ...profile, bank_account: e.target.value })}
                    className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">IFSC Code</label>
                  <input
                    type="text"
                    value={profile.ifsc_code || ""}
                    onChange={(e) => setProfile({ ...profile, ifsc_code: e.target.value })}
                    className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bank Name</label>
                  <input
                    type="text"
                    value={profile.bank_name || ""}
                    onChange={(e) => setProfile({ ...profile, bank_name: e.target.value })}
                    className="w-full px-3 py-2 text-slate-800 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving || isParsing}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer text-xs"
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
