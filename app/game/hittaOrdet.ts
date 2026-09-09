export interface WordQuestion {
  clue: string;
  answer: string;
  hint: string;
}

export interface WordChallengesPayload {
  challenges: WordQuestion[];
  questions: WordQuestion[];
  source: "ai" | "fallback";
}

/**
 * Local fallback clues for Hitta ordet.
 * Used when Gemini is unavailable or returns invalid data.
 */
export function getHittaOrdetQuestions(): WordQuestion[] {
  return HITTA_ORDET_LOCAL_QUESTIONS.map((q) => ({ ...q }));
}

export function normalizeWordAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,!?:"'«»]/g, "")
    .replace(/\s+/g, " ");
}

export function parseWordChallenges(data: unknown): WordQuestion[] | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const payload = data as { questions?: unknown; challenges?: unknown };
  const questions = Array.isArray(payload.challenges)
    ? payload.challenges
    : payload.questions;
  if (!Array.isArray(questions) || questions.length < 5) {
    return null;
  }

  const parsed: WordQuestion[] = [];

  for (const item of questions) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const raw = item as {
      clue?: unknown;
      answer?: unknown;
      hint?: unknown;
      fallbackHint?: unknown;
    };
    const clue = typeof raw.clue === "string" ? raw.clue.trim() : "";
    const hintSource =
      typeof raw.hint === "string"
        ? raw.hint
        : typeof raw.fallbackHint === "string"
          ? raw.fallbackHint
          : "";
    const hint = hintSource.trim();
    const answer =
      typeof raw.answer === "string" ? normalizeWordAnswer(raw.answer) : "";

    if (!clue || !hint || !answer) {
      continue;
    }

    if (!isSimpleSwedishAnswer(answer)) {
      continue;
    }

    parsed.push({ clue, answer, hint });
    if (parsed.length === 5) {
      break;
    }
  }

  return parsed.length === 5 ? parsed : null;
}

function isSimpleSwedishAnswer(answer: string): boolean {
  const words = answer.split(" ").filter(Boolean);
  if (words.length < 1 || words.length > 2) {
    return false;
  }

  return /^[\p{L}]+(?: [\p{L}]+)?$/u.test(answer);
}

const HITTA_ORDET_LOCAL_QUESTIONS: WordQuestion[] = [
  {
    clue: "Jag säger mjau och gillar möss.",
    answer: "katt",
    hint: "Ett mjukt husdjur som jamar.",
  },
  {
    clue: "Jag är gul och lyser på himlen.",
    answer: "sol",
    hint: "Den värmer oss på dagen.",
  },
  {
    clue: "Jag har fyra hjul och kör på vägen.",
    answer: "bil",
    hint: "En vuxen kan köra den till affären.",
  },
  {
    clue: "Jag vajar i vinden och har gröna blad.",
    answer: "träd",
    hint: "Fåglar bygger ofta bo högt uppe i mig.",
  },
  {
    clue: "Man läser mig och jag är full av ord.",
    answer: "bok",
    hint: "Du hittar mig i en hylla eller i biblioteket.",
  },
];
