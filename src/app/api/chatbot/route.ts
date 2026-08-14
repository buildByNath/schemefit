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
              model: "llama3-8b-8192",
              messages: messages,
              temperature: 0.7,
              max_tokens: 512,
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
          console.error("Groq chatbot API error:", response.status, errText);
        }
      } catch (err) {
        console.warn("Groq chatbot API timeout, using fallback:", err);
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
