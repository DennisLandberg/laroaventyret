import { normalizeWordAnswer } from "@/app/game/hittaOrdet";

export type OrdMode = "hitta_ordet" | "saknade_bokstaver" | "bygg_meningen";

export interface MissingLetterQuestion {
  puzzle: string;
  answer: string;
  hint: string;
}

export interface SentenceQuestion {
  words: string[];
  expected: string;
}

export function getSaknadeBokstaverQuestions(): MissingLetterQuestion[] {
  return SAKNADE_BOKSTAVER_QUESTIONS.map((question) => ({ ...question }));
}

export function getByggMeningenQuestions(): SentenceQuestion[] {
  return BYGG_MENINGEN_QUESTIONS.map((question) => ({
    words: [...question.words],
    expected: question.expected,
  }));
}

export function answersMatch(userValue: string, expected: string): boolean {
  return normalizeWordAnswer(userValue) === normalizeWordAnswer(expected);
}

export function formatBuiltSentence(words: string[]): string {
  const sentence = words.join(" ").trim();
  if (!sentence) {
    return "";
  }
  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;
}

export function shuffleWords(words: string[]): string[] {
  if (words.length < 2) {
    return [...words];
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const next = [...words];
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    if (next.join(" ") !== words.join(" ")) {
      return next;
    }
  }

  return [...words].reverse();
}

const SAKNADE_BOKSTAVER_QUESTIONS: MissingLetterQuestion[] = [
  {
    puzzle: "K_TT",
    answer: "katt",
    hint: "Ett mjukt djur som säger mjau.",
  },
  {
    puzzle: "H_ND",
    answer: "hund",
    hint: "Ett djur som viftar på svansen.",
  },
  {
    puzzle: "S_L",
    answer: "sol",
    hint: "Den lyser och värmer på dagen.",
  },
  {
    puzzle: "B_L",
    answer: "bil",
    hint: "Den har hjul och kör på vägen.",
  },
  {
    puzzle: "H_ST",
    answer: "häst",
    hint: "Ett djur man kan rida på.",
  },
];

const BYGG_MENINGEN_QUESTIONS: SentenceQuestion[] = [
  {
    words: ["katten", "äter", "fisk"],
    expected: "katten äter fisk",
  },
  {
    words: ["flickan", "läser", "boken"],
    expected: "flickan läser boken",
  },
  {
    words: ["hunden", "jagar", "bollen"],
    expected: "hunden jagar bollen",
  },
  {
    words: ["vi", "leker", "ute"],
    expected: "vi leker ute",
  },
  {
    words: ["solen", "skiner", "varmt"],
    expected: "solen skiner varmt",
  },
];
