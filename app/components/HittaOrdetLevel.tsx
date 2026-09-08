"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  getHittaOrdetQuestions,
  normalizeWordAnswer,
  parseWordChallenges,
  type WordQuestion,
} from "@/app/game/hittaOrdet";

interface HittaOrdetLevelProps {
  initialStars: number;
  onBackToMap: (updatedStars: number, completedLevel: boolean) => void;
}

type LoadedChallenges = {
  questions: WordQuestion[];
  source: "ai" | "fallback";
};

let inflightWordChallenges: Promise<LoadedChallenges> | null = null;

function loadWordChallenges(): Promise<LoadedChallenges> {
  if (inflightWordChallenges) {
    return inflightWordChallenges;
  }

  inflightWordChallenges = (async () => {
    const response = await fetch("/api/word-challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Kunde inte hämta ordgåtor");
    }

    const data: unknown = await response.json();
    const parsed = parseWordChallenges(data);
    if (!parsed) {
      throw new Error("Ogiltiga ordgåtor");
    }

    const source =
      data &&
      typeof data === "object" &&
      "source" in data &&
      (data as { source?: unknown }).source === "ai"
        ? "ai"
        : "fallback";

    return { questions: parsed, source };
  })()
    .catch((error) => {
      console.warn("Använder lokala ordgåtor som reserv:", error);
      return {
        questions: getHittaOrdetQuestions(),
        source: "fallback" as const,
      };
    })
    .finally(() => {
      inflightWordChallenges = null;
    });

  return inflightWordChallenges;
}

export default function HittaOrdetLevel({
  initialStars,
  onBackToMap,
}: HittaOrdetLevelProps) {
  const [questions, setQuestions] = useState<WordQuestion[] | null>(null);
  const [isMagicLoad, setIsMagicLoad] = useState(true);
  const [usedAiRiddles, setUsedAiRiddles] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [stars, setStars] = useState(initialStars);
  const [hearts, setHearts] = useState(3);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    void loadWordChallenges().then((result) => {
      if (cancelled) return;
      setUsedAiRiddles(result.source === "ai");
      setQuestions(result.questions);
      setIsMagicLoad(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const currentQ = questions?.[currentQuestionIndex];

  useEffect(() => {
    if (!isMagicLoad && currentQ && !isCompleted && !isAdvancing) {
      inputRef.current?.focus();
    }
  }, [currentQuestionIndex, isCompleted, isAdvancing, isMagicLoad, currentQ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questions || !currentQ || isAdvancing || !userAnswer.trim()) return;

    if (normalizeWordAnswer(userAnswer) === currentQ.answer) {
      const newStars = stars + 1;
      setStars(newStars);
      setFeedback({
        type: "success",
        message: "Helt rätt! Du får 1 stjärna! ⭐",
      });
      setShowHint(false);
      setIsAdvancing(true);

      setTimeout(() => {
        if (currentQuestionIndex + 1 < questions.length) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setUserAnswer("");
          setFeedback(null);
          setShowHint(false);
          setIsAdvancing(false);
        } else {
          setIsCompleted(true);
          setIsAdvancing(false);
        }
      }, 800);
    } else {
      let newHearts = hearts - 1;
      let extraMessage = "";

      if (newHearts <= 0) {
        newHearts = 3;
        extraMessage = " Hjärtana tog slut, men orden fyller på dem igen! ✨";
      }

      setHearts(newHearts);
      setFeedback({
        type: "error",
        message: `Inte riktigt, men du var nära! Försök igen! 💪${extraMessage}`,
      });
      setUserAnswer("");
      inputRef.current?.focus();
    }
  };

  if (isMagicLoad || !questions || !currentQ) {
    return (
      <div className="w-full max-w-xl rounded-3xl border-4 border-emerald-800 bg-amber-50 p-8 text-center shadow-2xl">
        <div className="text-5xl">🐞</div>
        <h2 className="mt-4 text-2xl font-black text-emerald-900">
          Nyckelpigan trollar fram nya ord... ✨
        </h2>
        <p className="mt-3 text-lg font-semibold text-amber-900">
          Snart är ordgåtorna klara!
        </p>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="w-full max-w-xl rounded-3xl border-4 border-emerald-800 bg-amber-50 p-8 text-center shadow-2xl">
        <div className="text-5xl">📖</div>
        <h2 className="mt-3 text-3xl font-black text-emerald-900">Nivå 1 klarad!</h2>
        <p className="mt-2 text-lg font-semibold text-amber-900">
          Du hittade alla orden. Saknade bokstäver är nu upplåst i Ordhuset!
        </p>
        <p className="mt-3 text-xl font-black text-amber-700">⭐ {stars} stjärnor totalt</p>
        <button
          type="button"
          className="mt-6 rounded-2xl bg-emerald-600 px-6 py-3 text-lg font-black text-white shadow-lg hover:bg-emerald-500"
          onClick={() => onBackToMap(stars, true)}
        >
          Tillbaka till Ordhuset
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl rounded-3xl border-4 border-emerald-800 bg-amber-50 p-6 shadow-2xl sm:p-8">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          className="rounded-xl bg-amber-800 px-4 py-2 font-black text-amber-50"
          onClick={() => onBackToMap(stars, false)}
        >
          ← Tillbaka
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-black text-emerald-900">Hitta ordet</h1>
          <p className="text-sm font-bold text-amber-800">
            Fråga {currentQuestionIndex + 1} av {questions.length}
          </p>
        </div>
        <div className="text-right text-lg font-black">
          <div>{"❤️".repeat(hearts)}{"🤍".repeat(3 - hearts)}</div>
          <div>⭐ {stars}</div>
        </div>
      </div>

      <p className="mt-4 text-center text-sm font-black text-emerald-800">
        {usedAiRiddles
          ? "✨ Nyckelpigans magiska ordgåta"
          : "✨ En ny ordgåta har trollats fram!"}
      </p>

      <p className="mt-3 rounded-2xl bg-white px-5 py-6 text-center text-xl font-bold text-emerald-950 shadow-inner">
        {currentQ.clue}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col items-center gap-3">
        <label className="w-full text-center text-sm font-bold text-amber-900">
          Skriv ordet
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            value={userAnswer}
            disabled={isAdvancing}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="mt-2 w-full rounded-2xl border-4 border-emerald-800 bg-white px-4 py-3 text-center text-2xl font-black text-emerald-950"
            aria-label="Ditt ord"
          />
        </label>
        <button
          type="submit"
          disabled={isAdvancing || !userAnswer.trim()}
          className="rounded-2xl bg-emerald-600 px-8 py-3 text-xl font-black text-white shadow-lg enabled:hover:bg-emerald-500 disabled:opacity-40"
        >
          Svara ➜
        </button>
      </form>

      {feedback && (
        <p
          role="alert"
          className={`mt-4 text-center text-lg font-black ${
            feedback.type === "success" ? "text-emerald-700" : "text-rose-700"
          }`}
        >
          {feedback.message}
        </p>
      )}

      <button
        type="button"
        className="mt-5 w-full rounded-xl bg-amber-200 px-4 py-2 font-bold text-amber-950"
        onClick={() => setShowHint((prev) => !prev)}
      >
        {showHint ? "Dölj ledtråd" : "💡 Visa en ledtråd"}
      </button>
      {showHint && (
        <p className="mt-2 text-center font-semibold text-amber-900">{currentQ.hint}</p>
      )}
    </div>
  );
}
