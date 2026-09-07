import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { num1, num2 } = body;

    if (typeof num1 !== "number" || typeof num2 !== "number") {
      return NextResponse.json(
        { error: "Ogiltiga tal skickades." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment.");
      return NextResponse.json({
        hint: `Börja på ${Math.max(num1, num2)} och räkna ${Math.min(num1, num2)} steg framåt på dina fingrar! Du klarar det! 🪄`,
        source: "fallback",
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Du är en pedagogisk och lekfull trollkarl i barnspelet Läroäventyret för barn i åldern 6-9 år.
Barnet behöver en ledtråd för additionsuppgiften: ${num1} + ${num2}.
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
      hint: "Börja på det största talet och räkna uppåt med dina fingrar ett steg i taget! Du är jätteduktig! ✨",
      source: "fallback",
    });
  }
}
