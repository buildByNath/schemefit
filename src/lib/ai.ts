import type { User, Scheme, UserDocument } from "./db";
import { getEligibleSchemes } from "./matching";

export type AssistantIntent =
  | "benefits"
  | "documents"
  | "deadline"
  | "eligible"
  | "applications"
  | "help"
  | "unknown";

export interface AssistantResponse {
  intent: AssistantIntent;
  message: string;
  data?: unknown;
}

const INTENT_KEYWORDS: Record<AssistantIntent, string[]> = {
  benefits: ["benefit", "scheme", "grant", "scholarship", "eligible for", "qualify", "apply"],
  documents: ["document", "certificate", "aadhaar", "missing", "upload", "file"],
  deadline: ["deadline", "expiry", "last date", "when", "due", "time left"],
  eligible: ["eligible", "qualify", "match", "why am i", "am i eligible"],
  applications: ["application", "status", "submitted", "pending", "rejected", "approved"],
  help: ["help", "what can", "guide", "how to", "start"],
  unknown: [],
};

function detectIntent(query: string): AssistantIntent {
  const lower = query.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (intent === "unknown") continue;
    if (keywords.some(k => lower.includes(k))) return intent as AssistantIntent;
  }
  return "unknown";
}

export function getAssistantResponse(
  query: string,
  context: {
    user: User;
    schemes: Scheme[];
    documents: UserDocument[];
  }
): AssistantResponse {
  const intent = detectIntent(query);
  const { user, schemes, documents } = context;
  const userName = user.full_name?.split(" ")[0] || "there";

  const eligibleSchemes = getEligibleSchemes(user, schemes);

  switch (intent) {
    case "benefits": {
      if (eligibleSchemes.length === 0) {
        return {
          intent,
          message: "I couldn't find any matching schemes yet. Make sure your profile is complete so I can match you accurately.",
        };
      }
      const top = eligibleSchemes[0];
      return {
        intent,
        message: `Hi ${userName}! You have ${eligibleSchemes.length} eligible scheme${eligibleSchemes.length > 1 ? "s" : ""}. Your top match is **${top.title}** with up to ₹${top.max_benefit_amount?.toLocaleString("en-IN") || "N/A"} in potential benefit.`,
        data: eligibleSchemes.slice(0, 3),
      };
    }

    case "documents": {
      const uploaded = documents.map(d => d.name);
      if (uploaded.length === 0) {
        return {
          intent,
          message: "You haven't uploaded any documents yet. Head to the **Documents** section to upload your required certificates.",
        };
      }
      const required = eligibleSchemes.flatMap(m => m.required_documents ?? []);
      const unique = [...new Set(required)];
      const missing = unique.filter(r => !uploaded.some(u => u.toLowerCase().includes(r.toLowerCase())));
      if (missing.length === 0) {
        return {
          intent,
          message: `Great news! You've uploaded all the required documents. You're ready to apply!`,
          data: uploaded,
        };
      }
      return {
        intent,
        message: `You're missing **${missing.length}** document(s) required for your eligible schemes: ${missing.join(", ")}. Upload them in the Documents section.`,
        data: missing,
      };
    }

    case "deadline": {
      const withDeadlines = eligibleSchemes
        .filter(m => m.deadline)
        .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
      
      if (withDeadlines.length === 0) {
        return {
          intent,
          message: "No upcoming deadlines for your matched schemes right now.",
        };
      }
      const next = withDeadlines[0];
      const daysLeft = Math.ceil((new Date(next.deadline!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return {
        intent,
        message: `Your closest deadline is for **${next.title}** — ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left (${new Date(next.deadline!).toLocaleDateString("en-IN")}). Save it to your calendar from the scheme page!`,
        data: withDeadlines.slice(0, 3),
      };
    }

    case "eligible": {
      if (eligibleSchemes.length === 0) {
        return {
          intent,
          message: "Based on your current profile, no schemes are a full match yet. Check if your income, state, and category are filled in correctly.",
        };
      }
      const top = eligibleSchemes[0];
      return {
        intent,
        message: `You are eligible for **${eligibleSchemes.length} scheme${eligibleSchemes.length > 1 ? "s" : ""}**! You qualify for ${top.title} based on your Income (₹${user.annual_income}), Category (${user.caste_category}), and Education (${user.education}).`,
        data: eligibleSchemes,
      };
    }

    case "applications": {
      return {
        intent,
        message: "You can track all your applications in the **Applications** section. If any are rejected, the Rejection Analyzer will show you exactly what to fix.",
      };
    }

    case "help": {
      return {
        intent,
        message: `Hi ${userName}! I can help you with:\n• **"What benefits do I have?"** — See your matched schemes\n• **"What documents am I missing?"** — Check document status\n• **"Which deadline is closest?"** — Upcoming deadlines\n• **"Why am I eligible?"** — Eligibility explanation`,
      };
    }

    default: {
      return {
        intent: "unknown",
        message: "I'm not sure I understood that. Try asking about your benefits, missing documents, or upcoming deadlines.",
      };
    }
  }
}
