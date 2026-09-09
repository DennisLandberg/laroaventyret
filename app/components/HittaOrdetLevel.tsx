"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  getHittaOrdetQuestions,
  normalizeWordAnswer,
  parseWordChallenges,
  type WordQuestion,
} from "@/app/game/hittaOrdet";
import {
  OrdCompleteScreen,
  OrdLevelFrame,
  OrdLoadingScreen,
} from "@/app/components/OrdLevelFrame";

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

  const request = (async (): Promise<LoadedChallenges> => {
    const response = await fetch("/api/word-challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ round: Date.now() }),
    });

    if (!response.ok) {
      throw new Error("Kunde inte hämta ordgåtor");
    }

    const data: unknown = await response.json();
    const parsed = parseWordChallenges(data);
    if (!parsed) {
      throw new Error("Ogiltiga ordgåtor");
    }

    const source: LoadedChallenges["source"] =
      data &&
      typeof data === "object" &&
      "source" in data &&
      (data as { source?: unknown }).source === "ai"
        ? "ai"
        : "fallback";

    return { questions: parsed, source };
  })().catch((error): LoadedChallenges => {
    console.warn("Använder lokala ordgåtor som reserv:", error);
    return {
      questions: getHittaOrdetQuestions(),
      source: "fallback",
    };
  });

  inflightWordChallenges = request.finally(() => {
    inflightWordChallenges = null;
  });

  return request;
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
    return <OrdLoadingScreen />;
  }

  if (isCompleted) {
    return (
      <OrdCompleteScreen
        title="Nivå 1 klarad!"
        message="Du hittade alla orden. Saknade bokstäver är nu upplåst i Ordhuset!"
        stars={stars}
        onBack={() => onBackToMap(stars, true)}
      />
    );
  }

  return (
    <OrdLevelFrame
      title="Hitta ordet"
      progressLabel={`Fråga ${currentQuestionIndex + 1} av ${questions.length}`}
      hearts={hearts}
      stars={stars}
      ladybugLine={
        usedAiRiddles
          ? "Nyckelpigan trollade fram en magisk ordgåta!"
          : "En ny ordgåta har trollats fram!"
      }
      onBack={() => onBackToMap(stars, false)}
      feedback={feedback}
    >
      <p className="ordmagi-kicker">✨ Hitta ordet</p>
      <p className="ordmagi-clue">{currentQ.clue}</p>

      <form onSubmit={handleSubmit} className="ordmagi-form">
        <label className="ordmagi-label">
          Skriv ordet
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            value={userAnswer}
            disabled={isAdvancing}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="ordmagi-input"
            aria-label="Ditt ord"
          />
        </label>
        <button
          type="submit"
          disabled={isAdvancing || !userAnswer.trim()}
          className="ordmagi-svara"
        >
          Svara ➜
        </button>
      </form>

      <button
        type="button"
        className="ordmagi-wood ordmagi-hint"
        onClick={() => setShowHint((prev) => !prev)}
      >
        {showHint ? "Dölj ledtråd" : "💡 Visa en ledtråd"}
      </button>
      {showHint ? <p className="ordmagi-hint-text">{currentQ.hint}</p> : null}
    </OrdLevelFrame>
  );
}
