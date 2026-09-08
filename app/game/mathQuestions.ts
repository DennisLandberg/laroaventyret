export type MathMode = "addition" | "subtraction" | "mixed";

export interface MathQuestion {
  num1: number;
  num2: number;
  answer: number;
  operator: "+" | "-";
  fallbackHint: string;
  emoji: string;
}

const ADDITION_QUESTIONS: MathQuestion[] = [
  {
    num1: 2,
    num2: 3,
    answer: 5,
    operator: "+",
    fallbackHint: "Räkna med äpplen: 🍎🍎 och 🍎🍎🍎 blir 5 äpplen tillsammans!",
    emoji: "🍎",
  },
  {
    num1: 4,
    num2: 1,
    answer: 5,
    operator: "+",
    fallbackHint: "Börja på 4 och räkna ett steg uppåt: 4... 5!",
    emoji: "⭐",
  },
  {
    num1: 5,
    num2: 5,
    answer: 10,
    operator: "+",
    fallbackHint: "Tänk på dina fingrar: 5 på vänster hand och 5 på höger hand blir 10!",
    emoji: "🖐️",
  },
  {
    num1: 6,
    num2: 2,
    answer: 8,
    operator: "+",
    fallbackHint: "Börja på 6 och hoppa 2 steg framåt: 7, 8!",
    emoji: "🐸",
  },
  {
    num1: 3,
    num2: 4,
    answer: 7,
    operator: "+",
    fallbackHint: "Börja på 4 och lägg till 3 steg till: 5, 6, 7!",
    emoji: "🎈",
  },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function createAdditionQuestion(): MathQuestion {
  const num1 = randomInt(0, 10);
  const num2 = randomInt(0, 10);
  return {
    num1,
    num2,
    answer: num1 + num2,
    operator: "+",
    fallbackHint: `Börja på ${num1} och räkna ${num2} steg framåt.`,
    emoji: "🍎",
  };
}

function createSubtractionQuestion(): MathQuestion {
  const num1 = randomInt(0, 10);
  const num2 = randomInt(0, num1);
  if (num1 < num2) {
    throw new Error("Subtraktion får inte ge negativt svar.");
  }
  return {
    num1,
    num2,
    answer: num1 - num2,
    operator: "-",
    fallbackHint: `Börja på ${num1} och räkna ${num2} steg bakåt.`,
    emoji: "🍎",
  };
}

function createSubtractionQuestions(): MathQuestion[] {
  const pairs: Array<[number, number]> = [
    [5, 2],
    [7, 3],
    [9, 4],
    [6, 1],
    [8, 5],
  ];

  return pairs.map(([num1, num2]) => {
    if (num1 < num2) {
      throw new Error("Subtraktion får inte ge negativt svar.");
    }
    return {
      num1,
      num2,
      answer: num1 - num2,
      operator: "-" as const,
      fallbackHint: `Börja på ${num1} och räkna ${num2} steg bakåt.`,
      emoji: "🍎",
    };
  });
}

function createMixedQuestions(count = 5): MathQuestion[] {
  const operators: Array<"+" | "-"> = ["+", "-"];
  while (operators.length < count) {
    operators.push(Math.random() < 0.5 ? "+" : "-");
  }
  shuffleInPlace(operators);

  return operators.map((operator) =>
    operator === "+" ? createAdditionQuestion() : createSubtractionQuestion()
  );
}

export function getMathQuestions(mode: MathMode): MathQuestion[] {
  if (mode === "subtraction") {
    return createSubtractionQuestions();
  }
  if (mode === "mixed") {
    return createMixedQuestions();
  }
  return ADDITION_QUESTIONS.map((q) => ({ ...q }));
}

export function getMathLevelTitle(mode: MathMode): string {
  if (mode === "subtraction") {
    return "Nivå 2 – Subtraktion";
  }
  if (mode === "mixed") {
    return "Nivå 3 – Blandad matte";
  }
  return "Nivå 1 – Addition";
}
