"use client";

import React, { useState, useRef, useEffect } from "react";

interface MathQuestion {
  num1: number;
  num2: number;
  answer: number;
  hint: string;
  emoji: string;
}

const questions: MathQuestion[] = [
  {
    num1: 2,
    num2: 3,
    answer: 5,
    hint: "Räkna med äpplen: 🍎🍎 och 🍎🍎🍎 blir 5 äpplen tillsammans!",
    emoji: "🍎",
  },
  {
    num1: 4,
    num2: 1,
    answer: 5,
    hint: "Börja på 4 och räkna ett steg uppåt: 4... 5!",
    emoji: "⭐",
  },
  {
    num1: 5,
    num2: 5,
    answer: 10,
    hint: "Tänk på dina fingrar: 5 på vänster hand och 5 på höger hand blir 10!",
    emoji: "🖐️",
  },
  {
    num1: 6,
    num2: 2,
    answer: 8,
    hint: "Börja på 6 och hoppa 2 steg framåt: 7, 8!",
    emoji: "🐸",
  },
  {
    num1: 3,
    num2: 4,
    answer: 7,
    hint: "Börja på 4 och lägg till 3 steg till: 5, 6, 7!",
    emoji: "🎈",
  },
];

interface MattemagiLevelProps {
  initialStars: number;
  onBackToMap: (updatedStars: number) => void;
}

export default function MattemagiLevel({
  initialStars,
  onBackToMap,
}: MattemagiLevelProps) {
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

  const currentQ = questions[currentQuestionIndex];

  // Focus input on question change
  useEffect(() => {
    if (!isCompleted && !isAdvancing) {
      inputRef.current?.focus();
    }
  }, [currentQuestionIndex, isCompleted, isAdvancing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdvancing || !userAnswer.trim()) return;

    const parsedAnswer = parseInt(userAnswer.trim(), 10);

    if (parsedAnswer === currentQ.answer) {
      // Correct answer
      const newStars = stars + 1;
      setStars(newStars);
      setFeedback({
        type: "success",
        message: "🎉 Helt rätt! Bra jobbat! Du får 1 stjärna!",
      });
      setShowHint(false);
      setIsAdvancing(true);

      setTimeout(() => {
        if (currentQuestionIndex + 1 < questions.length) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setUserAnswer("");
          setFeedback(null);
          setIsAdvancing(false);
        } else {
          setIsCompleted(true);
          setIsAdvancing(false);
        }
      }, 1400);
    } else {
      // Wrong answer
      let newHearts = hearts - 1;
      let extraMessage = "";

      if (newHearts <= 0) {
        newHearts = 3;
        extraMessage = " Hjärtana tog slut, men magin fyller på dem igen! ✨";
      }

      setHearts(newHearts);
      setFeedback({
        type: "error",
        message: `Inte riktigt, men du var nära! Tänk efter och försök igen! 💪${extraMessage}`,
      });
      setUserAnswer("");
      inputRef.current?.focus();
    }
  };

  // Success screen
  if (isCompleted) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-2xl border-4 border-amber-300 text-center animate-fade-in">
        <div className="text-6xl sm:text-7xl mb-4 animate-bounce">🏆</div>
        <div className="inline-block px-5 py-2 bg-yellow-200 text-yellow-900 rounded-full font-black text-sm sm:text-base mb-3 shadow-sm">
          NIVÅ 1 KLARAD! 🌟
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-800 mb-4">
          Hurra! Du är en Mattemagiker!
        </h2>
        <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-md mx-auto">
          Du klarade alla 5 frågor i Mattemagi och samlade massor av stjärnglans!
        </p>

        {/* Total Stars Box */}
        <div className="inline-flex items-center gap-3 bg-amber-100 border-3 border-amber-400 px-8 py-4 rounded-3xl shadow-inner mb-8 text-2xl sm:text-3xl font-black text-amber-900">
          <span className="text-4xl animate-pulse">⭐</span>
          <span>{stars} stjärnor totalt</span>
        </div>

        {/* Return Button */}
        <div>
          <button
            onClick={() => onBackToMap(stars)}
            className="w-full sm:w-auto px-8 py-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xl sm:text-2xl rounded-full shadow-xl hover:shadow-emerald-200/80 transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer border-4 border-emerald-300 inline-flex items-center justify-center gap-3"
          >
            <span>🗺️</span>
            <span>Tillbaka till äventyrskartan</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {/* Top Bar: Navigation, Question Progress, Hearts, and Stars */}
      <div className="w-full bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-lg border-2 border-orange-200 mb-8 flex flex-wrap items-center justify-between gap-4">
        {/* Return to map button */}
        <button
          onClick={() => onBackToMap(stars)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full text-sm sm:text-base transition-colors border border-slate-300"
          title="Gå tillbaka till kartan"
        >
          <span>⬅️</span>
          <span>Kartan</span>
        </button>

        {/* Current Question Indicator */}
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm font-extrabold uppercase text-amber-800 tracking-wider">
            Mattemagi
          </span>
          <span className="text-base sm:text-xl font-black text-slate-800">
            Fråga {currentQuestionIndex + 1} av {questions.length}
          </span>
        </div>

        {/* Hearts and Stars Display */}
        <div className="flex items-center gap-4">
          {/* Hearts */}
          <div
            className="flex items-center gap-1 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full"
            title={`${hearts} hjärtan kvar`}
          >
            {[1, 2, 3].map((heartIndex) => (
              <span
                key={heartIndex}
                className={`text-xl sm:text-2xl transition-transform ${
                  heartIndex <= hearts
                    ? "scale-100"
                    : "opacity-30 grayscale scale-90"
                }`}
              >
                ❤️
              </span>
            ))}
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1.5 bg-amber-100 border border-amber-300 px-3.5 py-1.5 rounded-full font-black text-amber-900 text-base sm:text-lg">
            <span className="text-xl">⭐</span>
            <span>{stars}</span>
          </div>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="w-full flex justify-center items-center gap-3 mb-6">
        {questions.map((_, idx) => (
          <div
            key={idx}
            className={`h-3.5 rounded-full transition-all duration-300 ${
              idx === currentQuestionIndex
                ? "w-10 bg-amber-500 shadow-md"
                : idx < currentQuestionIndex
                ? "w-3.5 bg-emerald-500"
                : "w-3.5 bg-slate-300"
            }`}
          />
        ))}
      </div>

      {/* Main Question Card */}
      <div className="w-full bg-white rounded-3xl p-6 sm:p-12 shadow-2xl border-4 border-amber-300 relative text-center">
        {/* Sparkle Badges */}
        <div className="text-sm font-extrabold text-amber-800 bg-amber-100 border border-amber-300 inline-block px-4 py-1 rounded-full mb-6">
          🪄 Trolla fram rätt svar!
        </div>

        {/* Visual helper objects */}
        <div className="flex justify-center items-center gap-2 sm:gap-4 mb-6 flex-wrap select-none text-2xl sm:text-3xl">
          <div className="flex gap-1 bg-amber-50 p-2 sm:p-3 rounded-2xl border border-amber-200">
            {Array.from({ length: currentQ.num1 }).map((_, i) => (
              <span key={i} className="animate-pulse">
                {currentQ.emoji}
              </span>
            ))}
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-600">
            +
          </span>
          <div className="flex gap-1 bg-amber-50 p-2 sm:p-3 rounded-2xl border border-amber-200">
            {Array.from({ length: currentQ.num2 }).map((_, i) => (
              <span key={i} className="animate-pulse">
                {currentQ.emoji}
              </span>
            ))}
          </div>
        </div>

        {/* Math Equation */}
        <div className="text-4xl sm:text-6xl font-black text-slate-800 mb-8 flex items-center justify-center gap-3 sm:gap-5">
          <span>{currentQ.num1}</span>
          <span className="text-amber-500">+</span>
          <span>{currentQ.num2}</span>
          <span className="text-slate-400">=</span>
          <span className="text-amber-600 font-extrabold">?</span>
        </div>

        {/* Answer Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-6"
        >
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="?"
            disabled={isAdvancing}
            aria-label="Ditt svar"
            className="w-32 sm:w-36 h-20 text-4xl font-black text-center text-slate-800 bg-amber-50 border-4 border-amber-400 focus:border-amber-500 focus:bg-white rounded-2xl shadow-inner focus:outline-none focus:ring-4 focus:ring-amber-200 transition-all disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={isAdvancing || !userAnswer.trim()}
            className="w-full sm:w-auto px-8 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-2xl rounded-2xl shadow-xl transition-all border-4 border-emerald-300 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Svara</span>
            <span>➔</span>
          </button>
        </form>

        {/* Feedback Message */}
        {feedback && (
          <div
            role="alert"
            className={`p-4 rounded-2xl mb-4 font-bold text-base sm:text-lg border-2 inline-block max-w-md mx-auto transition-all ${
              feedback.type === "success"
                ? "bg-emerald-100 border-emerald-400 text-emerald-900 animate-bounce"
                : "bg-rose-100 border-rose-300 text-rose-900"
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Hint Section */}
        <div className="mt-4 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-950 font-bold text-sm sm:text-base bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-full transition-colors border border-amber-300 cursor-pointer"
          >
            <span>💡</span>
            <span>{showHint ? "Göm ledtråd" : "Behöver du en ledtråd?"}</span>
          </button>

          {showHint && (
            <div className="mt-3 p-4 bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-2xl max-w-md mx-auto text-slate-700 text-sm sm:text-base font-semibold">
              <p className="flex items-center justify-center gap-2 text-yellow-900 font-bold mb-1">
                <span>🪄 Magisk ledtråd:</span>
              </p>
              <p>{currentQ.hint}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
