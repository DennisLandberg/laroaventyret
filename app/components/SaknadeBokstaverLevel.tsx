"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  answersMatch,
  getSaknadeBokstaverQuestions,
} from "@/app/game/ordlandetLevels";
import {
  OrdCompleteScreen,
  OrdFailScreen,
  OrdLevelFrame,
} from "@/app/components/OrdLevelFrame";

const STARTING_HEARTS = 3;

interface SaknadeBokstaverLevelProps {
  initialStars: number;
  onBackToMap: (updatedStars: number, completedLevel: boolean) => void;
}

export default function SaknadeBokstaverLevel({
  initialStars,
  onBackToMap,
}: SaknadeBokstaverLevelProps) {
  const questions = getSaknadeBokstaverQuestions();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [stars, setStars] = useState(initialStars);
  const [hearts, setHearts] = useState(STARTING_HEARTS);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQ = questions[currentQuestionIndex];

  useEffect(() => {
    if (!isCompleted && !isFailed && !isAdvancing && currentQ) {
      inputRef.current?.focus();
    }
  }, [currentQuestionIndex, isCompleted, isFailed, isAdvancing, currentQ]);

  const handleRetryLevel = () => {
    setIsFailed(false);
    setIsCompleted(false);
    setIsAdvancing(false);
    setHearts(STARTING_HEARTS);
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setFeedback(null);
    setShowHint(false);
    setStars(initialStars);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentQ || isAdvancing || !userAnswer.trim()) {
      return;
    }

    if (answersMatch(userAnswer, currentQ.answer)) {
      setStars((prev) => prev + 1);
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
      return;
    }

    const remainingHearts = hearts - 1;
    setUserAnswer("");

    if (remainingHearts <= 0) {
      setHearts(0);
      setStars(initialStars);
      setFeedback(null);
      setShowHint(false);
      setIsAdvancing(false);
      setIsFailed(true);
      return;
    }

    setHearts(remainingHearts);
    setFeedback({
      type: "error",
      message: "Inte riktigt, men du var nära! Försök igen! 💪",
    });
    inputRef.current?.focus();
  };

  if (isFailed) {
    return <OrdFailScreen onRetry={handleRetryLevel} />;
  }

  if (isCompleted) {
    return (
      <OrdCompleteScreen
        title="Nivå 2 klarad!"
        message="Du fyllde i de saknade bokstäverna. Bygg meningen är nu upplåst i Ordhuset!"
        stars={stars}
        onBack={() => onBackToMap(stars, true)}
      />
    );
  }

  return (
    <OrdLevelFrame
      title="Saknade bokstäver"
      progressLabel={`Fråga ${currentQuestionIndex + 1} av ${questions.length}`}
      hearts={hearts}
      stars={stars}
      ladybugLine="Vilken bokstav saknas? Skriv hela ordet!"
      onBack={() => onBackToMap(stars, false)}
      feedback={feedback}
    >
      <p className="ordmagi-kicker">✨ Fyll i den saknade bokstaven</p>
      <p className="ordmagi-puzzle">{currentQ.puzzle.split("").join(" ")}</p>

      <form onSubmit={handleSubmit} className="ordmagi-form">
        <label className="ordmagi-label">
          Skriv hela ordet
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            value={userAnswer}
            disabled={isAdvancing}
            onChange={(event) => setUserAnswer(event.target.value)}
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
      {showHint ? (
        <p className="ordmagi-hint-text">{currentQ.hint}</p>
      ) : null}
    </OrdLevelFrame>
  );
}
