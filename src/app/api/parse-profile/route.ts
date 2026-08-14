import { NextResponse } from "next/server";
import { parseSpeechText } from "@/lib/parser";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `You are an AI profile extractor. Extract demographic parameters from the user's spoken transcription: "${text}".
Return ONLY a raw JSON object with these keys (no markdown formatting, no comments):
{
  "annual_income": number (annual household income in rupees. Extract lakhs e.g. "2.5 lakh" -> 250000. Default: 250000),
  "caste_category": string (must be exactly "General", "OBC", "SC", or "ST". Default: "General"),
  "education": string (must be exactly "School", "Undergraduate", or "Postgraduate". Default: "Undergraduate"),
  "occupation": string (must be exactly "Student", "Farmer", "Worker", or "None". Default: "Student"),
  "date_of_birth": string (YYYY-MM-DD format if mentioned, else null),
  "gender": string ("Male", "Female", "Other", or null if not mentioned),
  "marital_status": string ("Single", "Married", "Divorced", "Widowed", or null),
  "religion": string (extract religion e.g. "Hindu", "Muslim", "Christian", "Sikh", etc., or null),
  "is_differently_abled": boolean (true if they mention disability, handicap, or being differently abled. Default: false),
  "bpl_status": boolean (true if they mention BPL, below poverty line, or BPL card. Default: false)
}`
                }]
              }],
              generationConfig: { responseMimeType: "application/json" }
            }),
            signal: AbortSignal.timeout(2000)
          }
        );

        if (response.ok) {
          const data = await response.json();
          const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            const parsed = JSON.parse(jsonText.trim());
            return NextResponse.json({ ...parsed, source: "gemini" });
          }
        } else {
          const errText = await response.text();
          console.error("Gemini API error response:", response.status, errText);
        }
      } catch (err) {
        console.error("Gemini API call failed, falling back to local regex parser:", err);
      }
    }

    // Local Regex Parsing fallback
    const parsed = parseSpeechText(text);
    return NextResponse.json({ ...parsed, source: "local" });
  } catch (error) {
    console.error("Parse API error:", error);
    return NextResponse.json({ error: "Failed to parse text" }, { status: 500 });
  }
}
