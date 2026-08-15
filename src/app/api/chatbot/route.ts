import { NextResponse } from "next/server";
import { getUser } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { question, scheme, history } = await request.json();
    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const user = await getUser();

    const userProfileText = user
      ? `
Here is the profile of the logged-in user who is chatting with you:
- Full Name: ${user.full_name || "Guest User"}
- Gender: ${user.gender || "Not set"}
- Caste/Category: ${user.caste_category || "Not set"}
- State of Residence: ${user.state || "Not set"}
- Annual Income: ₹${user.annual_income ? user.annual_income.toLocaleString("en-IN") : "Not set"}
- Education Level: ${user.education || "Not set"}
- Occupation: ${user.occupation || "Not set"}
- Age/DOB: ${user.date_of_birth || "Not set"}
- Differently Abled: ${user.is_differently_abled ? "Yes" : "No"}
`
      : `No user profile details are currently available.`;

    const schemeContext = scheme
      ? `You are helping a user understand the welfare scheme titled "${scheme.title}".
Here are all known details about this scheme:
- Description: ${scheme.description || "N/A"}
- Ministry / Department: ${scheme.ministry || "N/A"}
- Category: ${scheme.category || "N/A"}
- Applicable State(s): ${scheme.state || "All India"}
- Minimum Benefit: Rs.${(scheme.min_benefit_amount || 0).toLocaleString("en-IN")}
- Maximum Benefit: Rs.${(scheme.max_benefit_amount || 0).toLocaleString("en-IN")}
- Required Documents: ${Array.isArray(scheme.required_documents) ? scheme.required_documents.join(", ") : "N/A"}
- Eligibility Prerequisites: ${Array.isArray(scheme.prerequisites) ? scheme.prerequisites.join(", ") : "N/A"}
- Application Deadline: ${scheme.deadline ? new Date(scheme.deadline).toLocaleDateString("en-IN") : "Open / Not Specified"}
- Official Application URL: ${scheme.application_url || "N/A"}
- Eligibility Criteria (Rules JSON): ${JSON.stringify(scheme.eligibility_json || {})}

${userProfileText}

Guidelines for this scheme:
1. Answer questions ONLY about this scheme. If the user asks about something unrelated, gently guide them back.
2. If the user asks about their eligibility, compare their profile details listed above with the scheme's criteria. Be explicit and friendly: explain why they qualify (e.g. "Since your income is ₹${user?.annual_income?.toLocaleString("en-IN") || "0"} and the limit is...") or what criteria they do not meet.`
      : `You are SchemeFit AI, a helpful welfare scheme assistant.
You help Indian citizens understand government welfare schemes, scholarships, and benefit programs.
Provide clear, accurate, and helpful information. Keep responses concise and easy to understand.

${userProfileText}

If they ask general questions about what they qualify for, you can refer to their profile details listed above.`;

    const systemPrompt = `${schemeContext}

Important general guidelines:
- Be concise, friendly, and professional.
- Use simple, easy-to-understand language.
- Format responses beautifully using bold text, lists, and bullet points where helpful.
- If you do not know something or if it's not in the scheme details, state that honestly.
- Always encourage users to visit official portals for final verification.`;

    const conversationHistory = Array.isArray(history) ? history : [];
    
    // Map history to OpenAI format for Groq
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      })),
      { role: "user", content: question }
    ];

    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      // Try models in order of capability
      const models = ["llama-3.3-70b-versatile", "llama3-70b-8192", "llama3-8b-8192"];
      for (const model of models) {
        try {
          const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
              },
              body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 800,
              }),
              signal: AbortSignal.timeout(8000)
            }
          );

          if (response.ok) {
            const data = await response.json();
            const answer = data.choices?.[0]?.message?.content;
            if (answer) {
              return NextResponse.json({ answer: answer.trim(), source: "groq" });
            }
          } else {
            const errText = await response.text();
            console.error(`Groq API error with model ${model}:`, response.status, errText);
          }
        } catch (err) {
          console.warn(`Groq API timeout/error with model ${model}:`, err);
        }
      }
    }

    // Local fallback answer when API is unavailable
    const fallbackAnswer = scheme
      ? `Based on the scheme details I have: "${scheme.title}" offers up to Rs.${(scheme.max_benefit_amount || 0).toLocaleString("en-IN")} in benefits. Required documents include: ${Array.isArray(scheme.required_documents) ? scheme.required_documents.join(", ") : "N/A"}. For detailed verified information, please visit: ${scheme.application_url || "scholarships.gov.in"}.`
      : `I am here to help with welfare scheme questions! Please select a specific scheme from the dropdown above so I can give you detailed answers about eligibility, benefits, required documents, and the application process.`;

    return NextResponse.json({ answer: fallbackAnswer, source: "local" });
  } catch (error) {
    console.error("Chatbot API error:", error);
    return NextResponse.json({ error: "Failed to process question" }, { status: 500 });
  }
}
