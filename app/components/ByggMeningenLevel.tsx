"use client";

import React, { useMemo, useState } from "react";
import {
  answersMatch,
  formatBuiltSentence,
  getByggMeningenQuestions,
  shuffleWords,
} from "@/app/game/ordlandetLevels";
import {
  OrdCompleteScreen,
  OrdFailScreen,
  OrdLevelFrame,
} from "@/app/components/OrdLevelFrame";

const STARTING_HEARTS = 3;

interface ByggMeningenLevelProps {
  initialStars: number;
  onBackToMap: (updatedStars: number, completedLevel: boolean) => void;
}

export default function ByggMeningenLevel({
  initialStars,
  onBackToMap,
}: ByggMeningenLevelProps) {
  const questions = useMemo(() => getByggMeningenQuestions(), []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [builtWords, setBuiltWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState(() =>
    shuffleWords(questions[0].words)
  );
  const [stars, setStars] = useState(initialStars);
  const [hearts, setHearts] = useState(STARTING_HEARTS);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const currentQ = questions[currentQuestionIndex];

  const resetCurrentQuestion = (index: number) => {
    setBuiltWords([]);
    setAvailableWords(shuffleWords(questions[index].words));
    setFeedback(null);
  };

  const handleRetryLevel = () => {
    setIsFailed(false);
    setIsCompleted(false);
    setIsAdvancing(false);
    setHearts(STARTING_HEARTS);
    setCurrentQuestionIndex(0);
    setStars(initialStars);
    resetCurrentQuestion(0);
  };

  const handlePickWord = (word: string, index: number) => {
    if (isAdvancing) {
      return;
    }
    setAvailableWords((prev) => prev.filter((_, wordIndex) => wordIndex !== index));
    setBuiltWords((prev) => [...prev, word]);
    setFeedback(null);
  };

  const handleClear = () => {
    if (isAdvancing) {
      return;
    }
    resetCurrentQuestion(currentQuestionIndex);
  };

  const handleSubmit = () => {
    if (isAdvancing || builtWords.length === 0) {
      return;
    }

    if (answersMatch(builtWords.join(" "), currentQ.expected)) {
      setStars((prev) => prev + 1);
      setFeedback({
        type: "success",
        message: "Helt rätt! Du får 1 stjärna! ⭐",
      });
      setIsAdvancing(true);

      setTimeout(() => {
        if (currentQuestionIndex + 1 < questions.length) {
          const nextIndex = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIndex);
          resetCurrentQuestion(nextIndex);
          setIsAdvancing(false);
        } else {
          setIsCompleted(true);
          setIsAdvancing(false);
        }
      }, 800);
      return;
    }

    const remainingHearts = hearts - 1;
    if (remainingHearts <= 0) {
      setHearts(0);
      setStars(initialStars);
      setFeedback(null);
      setIsAdvancing(false);
      setIsFailed(true);
      return;
    }

    setHearts(remainingHearts);
    setBuiltWords([]);
    setAvailableWords(shuffleWords(currentQ.words));
    setFeedback({
      type: "error",
      message: "Inte riktigt, men du var nära! Försök igen! 💪",
    });
  };

  if (isFailed) {
    return <OrdFailScreen onRetry={handleRetryLevel} />;
  }

  if (isCompleted) {
    return (
      <OrdCompleteScreen
        title="Nivå 3 klarad!"
        message="Du byggde alla meningarna. Ordlandet är nu klart!"
        stars={stars}
        onBack={() => onBackToMap(stars, true)}
      />
    );
  }

  return (
    <OrdLevelFrame
      title="Bygg meningen"
      progressLabel={`Fråga ${currentQuestionIndex + 1} av ${questions.length}`}
      hearts={hearts}
      stars={stars}
      ladybugLine="Klicka på orden i rätt ordning!"
      onBack={() => onBackToMap(stars, false)}
      feedback={feedback}
    >
      <p className="ordmagi-kicker">✨ Bygg en hel mening</p>
      <div className={`ordmagi-page ${builtWords.length === 0 ? "is-empty" : ""}`}>
        {builtWords.length > 0
          ? formatBuiltSentence(builtWords)
          : "Klicka på orden nedan..."}
      </div>

      <div className="ordmagi-tiles">
        {availableWords.map((word, index) => (
          <button
            key={`${word}-${index}`}
            type="button"
            disabled={isAdvancing}
            onClick={() => handlePickWord(word, index)}
            className="ordmagi-tile"
          >
            {word}
          </button>
        ))}
      </div>

      <div className="ordmagi-controls">
        <button
          type="button"
          disabled={isAdvancing || builtWords.length === 0}
          onClick={handleClear}
          className="ordmagi-rensa"
        >
          Rensa
        </button>
        <button
          type="button"
          disabled={isAdvancing || availableWords.length > 0}
          onClick={handleSubmit}
          className="ordmagi-svara"
        >
          Svara ➜
        </button>
      </div>
    </OrdLevelFrame>
  );
}
