import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  getHittaOrdetQuestions,
  parseWordChallenges,
  type WordChallengesPayload,
} from "@/app/game/hittaOrdet";

export const dynamic = "force-dynamic";

const WORD_CHALLENGE_PROMPT = `Du är nyckelpigan i barnspelet Läroäventyret. Skapa exakt 5 mycket enkla ordgåtor på svenska för barn i åldern 6–8 år.

Svara med ENDAST giltig JSON, inga markdown-staket och ingen extra text, i detta format:
{"challenges":[{"clue":"...","answer":"...","hint":"..."}]}

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

Gör 5 OLIKA gåtor. Upprepa inte samma svar.
Skapa NYA gåtor varje gång. Kopiera inte exemplen ordagrant.`;

function toPayload(
  challenges: WordChallengesPayload["challenges"],
  source: WordChallengesPayload["source"]
): WordChallengesPayload {
  return {
    source,
    challenges,
    questions: challenges,
  };
}

function fallbackPayload(): WordChallengesPayload {
  return toPayload(getHittaOrdetQuestions(), "fallback");
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

function geminiFailureDetails(error: unknown): {
  status?: string | number;
  code?: string | number;
  message: string;
} {
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const nested =
      record.error && typeof record.error === "object"
        ? (record.error as Record<string, unknown>)
        : record;
    const status = nested.status ?? record.status;
    const code = nested.code ?? record.code;
    const message =
      typeof nested.message === "string"
        ? nested.message
        : error instanceof Error
          ? error.message
          : JSON.stringify(error);
    return {
      status: typeof status === "string" || typeof status === "number" ? status : undefined,
      code: typeof code === "string" || typeof code === "number" ? code : undefined,
      message,
    };
  }

  return {
    message: error instanceof Error ? error.message : String(error),
  };
}

function fallbackReason(error: unknown): string {
  const details = geminiFailureDetails(error);
  const text = details.message;

  if (text.includes("GenerateRequestsPerDayPerProjectPerModel-FreeTier")) {
    return "429 Gemini free-tier daily quota (20/day) for gemini-3.6-flash";
  }
  if (text.includes('"code":429') || text.includes("RESOURCE_EXHAUSTED") || details.code === 429) {
    return "429 Gemini quota exceeded for gemini-3.6-flash";
  }
  return text;
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
  console.log("WORD CHALLENGES REQUEST STARTED");

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const reason = "GEMINI_API_KEY is not set";
      console.warn("WORD CHALLENGES GEMINI FAILED");
      console.warn("reason for fallback:", reason);
      console.warn("WORD CHALLENGES SOURCE: FALLBACK", reason);
      return NextResponse.json(fallbackPayload());
    }

    const text = await generateWordChallengeText(apiKey);
    console.log("WORD CHALLENGES GEMINI SUCCESS");

    let extracted: unknown;
    try {
      extracted = extractJsonObject(text);
    } catch (parseError) {
      console.warn("WORD CHALLENGES GEMINI FAILED");
      console.warn("reason for fallback: malformed JSON from Gemini");
      console.warn("error message:", parseError instanceof Error ? parseError.message : String(parseError));
      console.warn("gemini text preview:", text.slice(0, 500));
      throw parseError;
    }

    const parsed = parseWordChallenges(extracted);
    if (!parsed) {
      console.warn("WORD CHALLENGES GEMINI FAILED");
      console.warn("reason for fallback: validation rejected Gemini JSON");
      console.warn("gemini text preview:", text.slice(0, 500));
      throw new Error("Ogiltig frågestruktur från Gemini.");
    }

    console.log("WORD CHALLENGES SOURCE: AI");
    return NextResponse.json(toPayload(parsed, "ai"));
  } catch (error) {
    const details = geminiFailureDetails(error);
    const reason = fallbackReason(error);
    console.warn("WORD CHALLENGES GEMINI FAILED");
    if (details.status !== undefined) {
      console.warn("status:", details.status);
    }
    if (details.code !== undefined) {
      console.warn("code:", details.code);
    }
    console.warn("error message:", details.message);
    console.warn("reason for fallback:", reason);
    console.warn("WORD CHALLENGES SOURCE: FALLBACK", reason);
    return NextResponse.json(fallbackPayload());
  }
}
