import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { question, scheme, history } = await request.json();
    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

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
- Eligibility Criteria: ${JSON.stringify(scheme.eligibility_json || {})}

Answer questions ONLY about this scheme. If the user asks about something unrelated, gently guide them back to the scheme context.`
      : `You are SchemeFit AI, a helpful welfare scheme assistant.
You help Indian citizens understand government welfare schemes, scholarships, and benefit programs.
Provide clear, accurate, and helpful information. Keep responses concise and easy to understand.`;

    const systemPrompt = `${schemeContext}

Important guidelines:
- Be concise and friendly
- Use simple language (avoid legal jargon)
- If you do not know something, say so honestly
- Always encourage users to visit official portals for final verification`;

    const conversationHistory = Array.isArray(history) ? history : [];
    const conversationText = conversationHistory
      .map((msg: { role: string; content: string }) =>
        `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n");

    const fullPrompt = `${systemPrompt}\n\n${conversationText}\nUser: ${question}\nAssistant:`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: fullPrompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 512,
              }
            }),
            signal: AbortSignal.timeout(8000)
          }
        );

        if (response.ok) {
          const data = await response.json();
          const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (answer) {
            return NextResponse.json({ answer: answer.trim(), source: "gemini" });
          }
        } else {
          const errText = await response.text();
          console.error("Gemini chatbot API error:", response.status, errText);
        }
      } catch (err) {
        console.warn("Gemini chatbot API timeout, using fallback:", err);
      }
    }

    // Local fallback answer when Gemini is unavailable
    const fallbackAnswer = scheme
      ? `Based on the scheme details I have: "${scheme.title}" offers up to Rs.${(scheme.max_benefit_amount || 0).toLocaleString("en-IN")} in benefits. Required documents include: ${Array.isArray(scheme.required_documents) ? scheme.required_documents.join(", ") : "N/A"}. For detailed verified information, please visit: ${scheme.application_url || "scholarships.gov.in"}.`
      : `I am here to help with welfare scheme questions! Please select a specific scheme from the dropdown above so I can give you detailed answers about eligibility, benefits, required documents, and the application process.`;

    return NextResponse.json({ answer: fallbackAnswer, source: "local" });
  } catch (error) {
    console.error("Chatbot API error:", error);
    return NextResponse.json({ error: "Failed to process question" }, { status: 500 });
  }
}
