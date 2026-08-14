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
  "occupation": string (must be exactly "Student", "Farmer", "Worker", or "None". Default: "Student")
}`
                }]
              }],
              generationConfig: { responseMimeType: "application/json" }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            const parsed = JSON.parse(jsonText.trim());
            return NextResponse.json({ ...parsed, source: "gemini" });
          }
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
