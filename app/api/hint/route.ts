import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  let isSubtraction = false;
  try {
    const body = await request.json();
    const { num1, num2, operator, story } = body;

    if (typeof num1 !== "number" || typeof num2 !== "number") {
      return NextResponse.json(
        { error: "Ogiltiga tal skickades." },
        { status: 400 }
      );
    }

    const isSubtractionOp =
      operator === "-" || operator === "subtraction";
    isSubtraction = isSubtractionOp;
    const equation = isSubtractionOp
      ? `${num1} - ${num2}`
      : `${num1} + ${num2}`;
    const isStoryHint = Boolean(story);
    const fallbackHint = isSubtractionOp
      ? `Börja på ${num1} och räkna ${num2} steg bakåt. Du klarar det! 🪄`
      : `Börja på ${Math.max(num1, num2)} och räkna ${Math.min(num1, num2)} steg framåt på dina fingrar! Du klarar det! 🪄`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment.");
      return NextResponse.json({
        hint: fallbackHint,
        source: "fallback",
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = isSubtractionOp
      ? `Du är en pedagogisk och lekfull trollkarl i barnspelet Läroäventyret för barn i åldern 6-9 år.
Barnet behöver en ledtråd för subtraktionsuppgiften: ${equation}.
${isStoryHint ? "Barnet har en sagouppgift. Hjälp dem förstå att något tas bort. Upprepa gärna de två talen." : ""}
Skriv en mycket kort och uppmuntrande ledtråd på enkel svenska (max 1–2 korta meningar).

Viktiga regler:
1. Avslöja ALDRIG det rätta svaret eller skillnaden.
2. Hjälp barnet att tänka själv, till exempel genom att tipsa om att räkna bakåt, ta bort saker, eller räkna hur många som blir kvar.
3. Använd en varm, positiv och magisk ton med 1 passande emoji (t.ex. 🪄, ✨, 🖐️, 🍎).`
      : `Du är en pedagogisk och lekfull trollkarl i barnspelet Läroäventyret för barn i åldern 6-9 år.
Barnet behöver en ledtråd för additionsuppgiften: ${equation}.
${isStoryHint ? "Barnet har en sagouppgift. Hjälp dem förstå att de ska lägga ihop. Upprepa gärna de två talen." : ""}
Skriv en mycket kort och uppmuntrande ledtråd på enkel svenska (max 1–2 korta meningar).

Viktiga regler:
1. Avslöja ALDRIG det rätta svaret eller summan.
2. Hjälp barnet att tänka själv, till exempel genom att tipsa om att räkna på fingrarna, ta steg framåt från det största talet, eller räkna med magiska föremål.
3. Använd en varm, positiv och magisk ton med 1 passande emoji (t.ex. 🪄, ✨, 🖐️, 🍎).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const hint = response.text?.trim();

    if (!hint) {
      throw new Error("Tomt svar från Gemini.");
    }

    return NextResponse.json({
      hint,
      source: "ai",
    });
  } catch (error) {
    console.error("Fel vid generering av ledtråd med Gemini:", error);
    return NextResponse.json({
      hint: isSubtraction
        ? "Börja på det första talet och räkna bakåt ett steg i taget! Du är jätteduktig! ✨"
        : "Börja på det största talet och räkna uppåt med dina fingrar ett steg i taget! Du är jätteduktig! ✨",
      source: "fallback",
    });
  }
}
