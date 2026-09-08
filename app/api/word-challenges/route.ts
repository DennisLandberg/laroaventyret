import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  getHittaOrdetQuestions,
  parseWordChallenges,
  type WordChallengesPayload,
} from "@/app/game/hittaOrdet";

const WORD_CHALLENGE_PROMPT = `Du är nyckelpigan i barnspelet Läroäventyret. Skapa exakt 5 mycket enkla ordgåtor på svenska för barn i åldern 6–8 år.

Svara med ENDAST giltig JSON, inga markdown-staket och ingen extra text, i detta format:
{"questions":[{"clue":"...","answer":"...","hint":"..."}]}

Regler för varje gåta:
- clue: en kort, tydlig gåta på barnvänlig svenska
- answer: EXAKT ett vanligt svenskt vardagsord, bara gemener, utan punkt
- hint: en kort extra ledtråd som INTE avslöjar ordet rakt ut
- ett enda tydligt rätt svar
- undvik svåra stavningar, tvetydiga gåtor, egennamn, vuxna ämnen, våld och skrämmande teman

Bra teman: djur, mat, natur, hemmet, skolan, färger, vardagssaker.

Exempel på rätt svårighetsgrad:
{"clue":"Jag säger mjau och gillar möss. Vad är jag?","answer":"katt","hint":"Det är ett vanligt husdjur."}
{"clue":"Jag är gul och lyser på himlen.","answer":"sol","hint":"Den värmer oss på dagen."}
{"clue":"Jag har fyra hjul och kör på vägen.","answer":"bil","hint":"Man kan åka till affären i mig."}

Gör 5 OLIKA gåtor. Upprepa inte samma svar.`;

function fallbackPayload(): WordChallengesPayload {
  return {
    questions: getHittaOrdetQuestions(),
    source: "fallback",
  };
}

function extractJsonObject(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced?.[1] ?? text).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Inget JSON-objekt i svaret.");
  }
  return JSON.parse(raw.slice(start, end + 1));
}

async function generateWordChallengeText(apiKey: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: WORD_CHALLENGE_PROMPT,
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Tomt svar från Gemini.");
  }
  return text;
}

export async function POST() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const reason = "GEMINI_API_KEY is not set";
      console.warn("WORD CHALLENGES SOURCE: FALLBACK", reason);
      return NextResponse.json(fallbackPayload());
    }

    const text = await generateWordChallengeText(apiKey);
    const parsed = parseWordChallenges(extractJsonObject(text));
    if (!parsed) {
      throw new Error("Ogiltig frågestruktur från Gemini.");
    }

    console.log("WORD CHALLENGES SOURCE: AI");
    return NextResponse.json({
      questions: parsed,
      source: "ai",
    } satisfies WordChallengesPayload);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error";
    console.warn("WORD CHALLENGES SOURCE: FALLBACK", reason);
    return NextResponse.json(fallbackPayload());
  }
}
