import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildLocalMathStory } from "@/app/game/mathStoryFallback";

function fallbackStoryResponse(
  num1: number,
  num2: number,
  operator: string,
  reason: unknown
) {
  console.warn("MATH STORIES SOURCE: FALLBACK", {
    num1,
    num2,
    operator,
    reason,
  });
  return NextResponse.json({
    story: buildLocalMathStory(num1, num2, operator),
    source: "fallback",
  });
}

function isSubtractionOperator(operator: unknown): boolean {
  return operator === "-" || operator === "subtraction";
}

function stripStoryText(text: string): string {
  const fenced = text.match(/```(?:json|text)?\s*([\s\S]*?)```/i);
  let raw = (fenced?.[1] ?? text).trim();
  try {
    const parsed = JSON.parse(raw) as { story?: unknown };
    if (typeof parsed?.story === "string") {
      raw = parsed.story.trim();
    }
  } catch {
    // plain story text
  }
  return raw.replace(/^["'«]+|["'»]+$/g, "").trim();
}

function storyContainsQuantities(
  story: string,
  num1: number,
  num2: number
): boolean {
  const numbers = story.match(/\d+/g)?.map((n) => Number(n)) ?? [];
  return numbers.includes(num1) && numbers.includes(num2);
}

function storyRevealsAnswer(
  story: string,
  answer: number,
  num1: number,
  num2: number
): boolean {
  const lower = story.toLowerCase();
  const answerText = String(answer);
  if (answer === num1 || answer === num2) {
    return /(?:svaret är|det blir|=)\s*\d+/.test(lower);
  }
  const leakPatterns = [
    new RegExp(`svaret är\\s*${answerText}\\b`),
    new RegExp(`det blir\\s*${answerText}\\b`),
    new RegExp(`har\\s*${answerText}\\s*kvar`),
    new RegExp(`är\\s*${answerText}\\s*kvar`),
    new RegExp(`=\\s*${answerText}\\b`),
  ];
  return leakPatterns.some((pattern) => pattern.test(lower));
}

export async function POST(request: Request) {
  let num1: number | undefined;
  let num2: number | undefined;
  let operator = "+";

  try {
    const body = await request.json();
    num1 = body.num1;
    num2 = body.num2;
    operator = typeof body.operator === "string" ? body.operator : "+";

    if (typeof num1 !== "number" || typeof num2 !== "number") {
      return NextResponse.json(
        { error: "Ogiltiga tal skickades." },
        { status: 400 }
      );
    }

    const isSubtraction = isSubtractionOperator(operator);
    if (isSubtraction && num1 < num2) {
      return fallbackStoryResponse(num1, num2, String(operator), "negative-subtraction");
    }

    const correctAnswer = isSubtraction ? num1 - num2 : num1 + num2;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return fallbackStoryResponse(num1, num2, String(operator), "GEMINI_API_KEY is not set");
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = isSubtraction
      ? `Du skriver korta mattegåtor till barn 6–8 år i spelet Läroäventyret.

Uppgift: ${num1} minus ${num2}. Rätt svar är ${correctAnswer} – skriv ALDRIG det talet som svar.

Krav:
- Exakt 2 eller 3 korta meningar på enkel svenska.
- Mening 1 måste innehålla talet ${num1} som en konkret mängd (t.ex. stenar, jordgubbar, äpplen, stjärnor).
- Mening 2 måste beskriva att ${num2} tas bort, ges bort, äts upp eller försvinner.
- Sista meningen måste vara en tydlig fråga, t.ex. "Hur många har hon kvar?"
- Nyckelpigan får gärna vara med.

Bra exempel (annan räkning):
"En nyckelpiga hittade 7 magiska stenar.
Hon gav bort 2.
Hur många stenar har hon kvar?"

Dåligt exempel, använd INTE:
"Nyckelpigan är ute på äventyr och funderar på lite matte. Kan du hjälpa henne?"

Skriv inte likhetstecken, plus, minus eller svaret ${correctAnswer}.
Svara med ENDAST sagotexten.`
      : `Du skriver korta mattegåtor till barn 6–8 år i spelet Läroäventyret.

Uppgift: ${num1} plus ${num2}. Rätt svar är ${correctAnswer} – skriv ALDRIG det talet som svar.

Krav:
- Exakt 2 eller 3 korta meningar på enkel svenska.
- Mening 1 måste innehålla talet ${num1} som en konkret mängd (t.ex. blommor, äpplen, stjärnor, leksaker).
- Mening 2 måste beskriva att ${num2} läggs till, hittas eller samlas in.
- Sista meningen måste vara en tydlig fråga, t.ex. "Hur många har hon nu?"
- Nyckelpigan får gärna vara med.

Bra exempel (annan räkning):
"Nyckelpigan hade 4 jordgubbar.
Hon hittade 2 till.
Hur många jordgubbar har hon nu?"

Dåligt exempel, använd INTE:
"Nyckelpigan är ute på äventyr och funderar på lite matte. Kan du hjälpa henne?"

Skriv inte likhetstecken, plus, minus eller svaret ${correctAnswer}.
Svara med ENDAST sagotexten.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const story = stripStoryText(response.text ?? "");
    if (!story || story.length > 420) {
      throw new Error("Ogiltig saga från Gemini.");
    }
    if (!storyContainsQuantities(story, num1, num2)) {
      throw new Error("Sagan saknar de rätta talen.");
    }
    if (storyRevealsAnswer(story, correctAnswer, num1, num2)) {
      throw new Error("Sagan avslöjade svaret.");
    }

    console.info("MATH STORIES SOURCE: AI", {
      num1,
      num2,
      operator,
      preview: story.slice(0, 120),
    });

    return NextResponse.json({
      story,
      source: "ai",
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error";
    if (typeof num1 === "number" && typeof num2 === "number") {
      return fallbackStoryResponse(num1, num2, operator, reason);
    }
    console.warn("MATH STORIES SOURCE: FALLBACK", reason);
    return NextResponse.json(
      { error: "Kunde inte skapa mattegåta." },
      { status: 500 }
    );
  }
}
