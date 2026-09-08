"use client";

import React, { useState, useRef, useEffect } from "react";

interface MathQuestion {
  num1: number;
  num2: number;
  answer: number;
  fallbackHint: string;
  emoji: string;
}

const questions: MathQuestion[] = [
  {
    num1: 2,
    num2: 3,
    answer: 5,
    fallbackHint: "Räkna med äpplen: 🍎🍎 och 🍎🍎🍎 blir 5 äpplen tillsammans!",
    emoji: "🍎",
  },
  {
    num1: 4,
    num2: 1,
    answer: 5,
    fallbackHint: "Börja på 4 och räkna ett steg uppåt: 4... 5!",
    emoji: "⭐",
  },
  {
    num1: 5,
    num2: 5,
    answer: 10,
    fallbackHint: "Tänk på dina fingrar: 5 på vänster hand och 5 på höger hand blir 10!",
    emoji: "🖐️",
  },
  {
    num1: 6,
    num2: 2,
    answer: 8,
    fallbackHint: "Börja på 6 och hoppa 2 steg framåt: 7, 8!",
    emoji: "🐸",
  },
  {
    num1: 3,
    num2: 4,
    answer: 7,
    fallbackHint: "Börja på 4 och lägg till 3 steg till: 5, 6, 7!",
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
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [hintCache, setHintCache] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const currentQ = questions[currentQuestionIndex];

  useEffect(() => {
    if (!isCompleted && !isAdvancing) {
      inputRef.current?.focus();
    }
  }, [currentQuestionIndex, isCompleted, isAdvancing]);

  const handleToggleHint = async () => {
    if (showHint) {
      setShowHint(false);
      return;
    }

    setShowHint(true);

    if (hintCache[currentQuestionIndex]) {
      return;
    }

    setIsLoadingHint(true);
    try {
      const response = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          num1: currentQ.num1,
          num2: currentQ.num2,
        }),
      });

      if (!response.ok) {
        throw new Error("Kunde inte hämta ledtråd");
      }

      const data = await response.json();
      const generatedHint = data.hint || currentQ.fallbackHint;
      setHintCache((prev) => ({
        ...prev,
        [currentQuestionIndex]: generatedHint,
      }));
    } catch {
      setHintCache((prev) => ({
        ...prev,
        [currentQuestionIndex]: currentQ.fallbackHint,
      }));
    } finally {
      setIsLoadingHint(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdvancing || !userAnswer.trim()) return;

    const parsedAnswer = parseInt(userAnswer.trim(), 10);

    if (parsedAnswer === currentQ.answer) {
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

  const nudgeAnswer = (delta: number) => {
    const current = parseInt(userAnswer.trim(), 10);
    const base = Number.isFinite(current) ? current : 0;
    const next = Math.min(20, Math.max(0, base + delta));
    setUserAnswer(String(next));
  };

  const ladybugLine = isLoadingHint
    ? "Nyckelpigan tänker... ✨"
    : feedback?.type === "success"
      ? "Rätt! Fantastiskt! ⭐"
      : feedback?.type === "error"
        ? "Nästan! Försök en gång till! ❤️"
        : showHint
          ? hintCache[currentQuestionIndex] || currentQ.fallbackHint
          : "Du klarar det!\nRäkna äpplena\nså ser du! ❤️";

  return (
    <div className="mattemagi-scene">
      <div className="mattemagi-room" aria-hidden>
        <div className="mattemagi-shelf" style={{ left: "2.5%" }}>
          <span style={{ background: "#c44a3a" }} />
          <span style={{ background: "#355f9a" }} />
          <span style={{ background: "#3d8a46" }} />
          <span style={{ background: "#7a3ea0" }} />
          <span style={{ background: "#c47a28" }} />
          <span style={{ background: "#2f7a6a" }} />
        </div>
        <div className="mattemagi-shelf" style={{ right: "2.5%" }}>
          <span style={{ background: "#355f9a" }} />
          <span style={{ background: "#c44a3a" }} />
          <span style={{ background: "#c47a28" }} />
          <span style={{ background: "#3d8a46" }} />
          <span style={{ background: "#7a3ea0" }} />
        </div>
        <div className="mattemagi-window">
          <span className="mattemagi-tower" />
        </div>
        <div className="mattemagi-lantern" style={{ left: "11%", top: "12%" }} />
        <div className="mattemagi-lantern" style={{ right: "11%", top: "38%" }} />
        <div className="mattemagi-floor-books">
          <span>ÄVENTYR ❤️</span>
          <span>ÄR ETT</span>
          <span>MATEMATIK</span>
        </div>
        <div className="mattemagi-motto">Små steg leder till stora framsteg!</div>
        <div className="mattemagi-rug" />
      </div>

      <div className="mattemagi-stage">
        <VineFrame />

        {isCompleted ? (
          <CompletionBoard stars={stars} onBack={() => onBackToMap(stars)} />
        ) : (
          <>
            <header className="mattemagi-hud">
              <button
                type="button"
                className="mattemagi-wood mattemagi-hud-back"
                onClick={() => onBackToMap(stars)}
                title="Gå tillbaka till Mattehuset"
              >
                ← Tillbaka
              </button>

              <div className="flex flex-col items-center">
                <div className="mattemagi-wood mattemagi-hud-title">MATTEMAGI</div>
                <div className="mattemagi-wood mattemagi-hud-sub">
                  Fråga {currentQuestionIndex + 1} av {questions.length}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="mattemagi-wood mattemagi-hud-stat"
                  title={`${hearts} hjärtan kvar`}
                >
                  {[1, 2, 3].map((heartIndex) => (
                    <span
                      key={heartIndex}
                      style={{
                        opacity: heartIndex <= hearts ? 1 : 0.28,
                        filter: heartIndex <= hearts ? "none" : "grayscale(1)",
                        display: "inline-block",
                        animation:
                          feedback?.type === "error" && heartIndex === hearts + 1
                            ? "mattemagi-heart-pulse 0.55s ease-in-out"
                            : undefined,
                      }}
                    >
                      ❤️
                    </span>
                  ))}
                </div>
                <div
                  className="mattemagi-wood mattemagi-hud-stat"
                  style={{
                    animation:
                      feedback?.type === "success"
                        ? "mattemagi-star-bounce 0.7s ease-in-out"
                        : undefined,
                  }}
                >
                  <span>⭐</span>
                  <span>{stars}</span>
                </div>
              </div>
            </header>

            <div className="mattemagi-body">
              <div className="mattemagi-npc">
                <div className="mattemagi-bubble">{ladybugLine}</div>
                <WizardLadybug mood={feedback?.type === "success" ? "happy" : "idle"} />
              </div>

              <div
                className={`mattemagi-board ${feedback?.type === "success" ? "is-correct" : ""}`}
              >
                <BoardVines />
                {feedback?.type === "success" ? <SparkleBurst /> : null}
                <div className="mattemagi-parchment">
                  <div className="mattemagi-kicker">✨ Trolla fram rätt svar!</div>

                  <div className="mattemagi-objects">
                    <div className="mattemagi-obj-group">
                      {Array.from({ length: currentQ.num1 }).map((_, i) => (
                        <span key={`a-${i}`}>{currentQ.emoji}</span>
                      ))}
                    </div>
                    <span className="mattemagi-eq-op font-black">+</span>
                    <div className="mattemagi-obj-group">
                      {Array.from({ length: currentQ.num2 }).map((_, i) => (
                        <span key={`b-${i}`}>{currentQ.emoji}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mattemagi-eq">
                    <span>{currentQ.num1}</span>
                    <span className="mattemagi-eq-op">+</span>
                    <span>{currentQ.num2}</span>
                    <span className="mattemagi-eq-op">=</span>
                    <span>?</span>
                  </div>

                  <form onSubmit={handleSubmit} className="mattemagi-controls">
                    <div
                      className={`mattemagi-stone ${feedback?.type === "error" ? "is-wrong" : ""}`}
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
                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <div className="mattemagi-step">
                        <button
                          type="button"
                          aria-label="Öka talet"
                          disabled={isAdvancing}
                          onClick={() => nudgeAnswer(1)}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          aria-label="Minska talet"
                          disabled={isAdvancing}
                          onClick={() => nudgeAnswer(-1)}
                        >
                          ▼
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="mattemagi-svara"
                      disabled={isAdvancing || !userAnswer.trim()}
                    >
                      Svara ➜
                    </button>
                  </form>

                  {feedback && (
                    <div role="alert" className="sr-only">
                      {feedback.message}
                    </div>
                  )}

                  <button
                    type="button"
                    className="mattemagi-wood mattemagi-hint"
                    onClick={handleToggleHint}
                  >
                    💡 Fråga nyckelpigan om en ledtråd!
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CompletionBoard({
  stars,
  onBack,
}: {
  stars: number;
  onBack: () => void;
}) {
  return (
    <div className="mattemagi-body" style={{ alignItems: "center" }}>
      <div className="mattemagi-board" style={{ width: "72%", height: "78%" }}>
        <div className="mattemagi-parchment">
          <div style={{ fontSize: "4rem" }}>🏆</div>
          <div className="mattemagi-wood mattemagi-hud-sub">NIVÅ 1 KLARAD!</div>
          <h2 className="mattemagi-eq" style={{ fontSize: "2.6rem" }}>
            Hurra! Du är en Mattemagiker!
          </h2>
          <p className="mattemagi-kicker">
            Du klarade alla 5 frågor i Mattemagi och samlade massor av stjärnglans!
          </p>
          <div className="mattemagi-wood mattemagi-hud-stat">
            <span>⭐</span>
            <span>{stars} stjärnor totalt</span>
          </div>
          <button type="button" className="mattemagi-svara" onClick={onBack}>
            Tillbaka till Mattehuset
          </button>
        </div>
      </div>
    </div>
  );
}

function WizardLadybug({ mood }: { mood: "idle" | "happy" }) {
  return (
    <div className={`mattemagi-ladybug ${mood === "happy" ? "is-happy" : ""}`}>
      <div className="relative mx-auto h-[210px] w-[168px]">
        <div
          className="absolute left-[52px] top-0 h-[70px] w-[64px]"
          style={{
            background: "#7b3db8",
            clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
            boxShadow: "inset 0 0 0 4px #4a1d78",
          }}
        />
        <div className="absolute left-[78px] top-[28px] h-[12px] w-[14px] bg-[#f0d48a]" />
        <div className="absolute left-[86px] top-[8px] h-[10px] w-[10px] rounded-sm bg-[#f4efe4]" />
        <div
          className="absolute left-[28px] top-[62px] h-[92px] w-[112px] bg-[#e23b32]"
          style={{ boxShadow: "inset 0 0 0 5px #7a1814" }}
        />
        <div className="absolute left-[48px] top-[84px] h-[16px] w-[16px] bg-[#1a1210]" />
        <div className="absolute left-[86px] top-[78px] h-[14px] w-[14px] bg-[#1a1210]" />
        <div className="absolute left-[72px] top-[108px] h-[14px] w-[14px] bg-[#1a1210]" />
        <div className="absolute left-[58px] top-[88px] h-[14px] w-[14px] bg-white" />
        <div className="absolute left-[90px] top-[88px] h-[14px] w-[14px] bg-white" />
        <div className="absolute left-[63px] top-[93px] h-[5px] w-[5px] bg-[#1a1210]" />
        <div className="absolute left-[95px] top-[93px] h-[5px] w-[5px] bg-[#1a1210]" />
        <div className="absolute left-[136px] top-[108px] h-[8px] w-[28px] bg-[#6b4326]" />
        <div className="absolute left-[156px] top-[94px] h-[16px] w-[16px] bg-[#f3d27a] shadow-[0_0_10px_#f3d27a]" />
        <div className="absolute bottom-0 left-[18px] flex w-[132px] flex-col-reverse">
          <div className="h-[16px] bg-[#3d6b3a] text-center text-[9px] font-black leading-[16px] text-amber-50">
            DU KAN!
          </div>
          <div className="h-[16px] bg-[#5a3d8a] text-center text-[9px] font-black leading-[16px] text-amber-50">
            RÄKNA
          </div>
          <div className="h-[16px] bg-[#355f9a] text-center text-[9px] font-black leading-[16px] text-amber-50">
            TAL
          </div>
        </div>
      </div>
    </div>
  );
}

function SparkleBurst() {
  const sparks = [
    { left: "12%", top: "16%", delay: "0s" },
    { left: "78%", top: "14%", delay: "0.08s" },
    { left: "48%", top: "6%", delay: "0.04s" },
    { left: "22%", top: "38%", delay: "0.12s" },
    { left: "70%", top: "36%", delay: "0.16s" },
    { left: "58%", top: "20%", delay: "0.1s" },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {sparks.map((s, i) => (
        <span
          key={i}
          className="absolute text-2xl text-amber-300"
          style={{
            left: s.left,
            top: s.top,
            animation: `mattemagi-spark 0.75s ease-out ${s.delay} both`,
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function PixelBloom({
  color,
  x,
  y,
  size = 14,
}: {
  color: string;
  x: string;
  y: string;
  size?: number;
}) {
  const p = Math.max(4, Math.round(size * 0.38));
  return (
    <div className="absolute" style={{ left: x, top: y, width: size, height: size }}>
      <div className="absolute left-1/2 top-0 -translate-x-1/2" style={{ width: p, height: p, background: color }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ width: p, height: p, background: color }} />
      <div className="absolute left-0 top-1/2 -translate-y-1/2" style={{ width: p, height: p, background: color }} />
      <div className="absolute right-0 top-1/2 -translate-y-1/2" style={{ width: p, height: p, background: color }} />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: p, height: p, background: "#f4e27a" }}
      />
    </div>
  );
}

function PixelLeaf({ x, y, rot = 0 }: { x: string; y: string; rot?: number }) {
  return (
    <div
      className="absolute h-[12px] w-[18px] bg-[#3d8a46]"
      style={{
        left: x,
        top: y,
        transform: `rotate(${rot}deg)`,
        boxShadow: "inset 2px 0 0 #2f6e38",
      }}
    />
  );
}

function BoardVines() {
  const blooms = [
    { color: "#e86aa0", x: "-2%", y: "8%", size: 16 },
    { color: "#f4efe4", x: "4%", y: "-2%", size: 14 },
    { color: "#f2d24a", x: "18%", y: "-3%", size: 13 },
    { color: "#e86aa0", x: "38%", y: "-4%", size: 17 },
    { color: "#c084fc", x: "62%", y: "-3%", size: 14 },
    { color: "#f4efe4", x: "82%", y: "-2%", size: 15 },
    { color: "#e86aa0", x: "96%", y: "10%", size: 16 },
    { color: "#f2d24a", x: "97%", y: "42%", size: 14 },
    { color: "#e86aa0", x: "95%", y: "72%", size: 15 },
    { color: "#f4efe4", x: "-1%", y: "46%", size: 13 },
    { color: "#e86aa0", x: "-2%", y: "78%", size: 15 },
  ];
  const leaves = [
    { x: "8%", y: "-1%", rot: -18 },
    { x: "28%", y: "-2%", rot: 12 },
    { x: "52%", y: "-2%", rot: -8 },
    { x: "74%", y: "-1%", rot: 20 },
    { x: "-2%", y: "22%", rot: 80 },
    { x: "-3%", y: "58%", rot: 95 },
    { x: "97%", y: "24%", rot: -85 },
    { x: "98%", y: "58%", rot: -70 },
  ];
  return (
    <div className="mattemagi-board-vine" aria-hidden>
      {leaves.map((l, i) => (
        <PixelLeaf key={`bl-${i}`} x={l.x} y={l.y} rot={l.rot} />
      ))}
      {blooms.map((b, i) => (
        <PixelBloom key={`bb-${i}`} color={b.color} x={b.x} y={b.y} size={b.size} />
      ))}
    </div>
  );
}

function VineFrame() {
  const blooms: { color: string; x: string; y: string; size?: number }[] = [
    { color: "#e86aa0", x: "1%", y: "2%", size: 22 },
    { color: "#f2d24a", x: "4%", y: "0.5%", size: 16 },
    { color: "#f4efe4", x: "8%", y: "2%", size: 14 },
    { color: "#e86aa0", x: "14%", y: "0.4%", size: 18 },
    { color: "#c084fc", x: "48%", y: "0.5%", size: 15 },
    { color: "#f2d24a", x: "72%", y: "0.6%", size: 16 },
    { color: "#e86aa0", x: "88%", y: "1%", size: 20 },
    { color: "#f4efe4", x: "93%", y: "0.4%", size: 15 },
    { color: "#e86aa0", x: "95.5%", y: "1.5%", size: 18 },
    { color: "#e86aa0", x: "1%", y: "20%", size: 16 },
    { color: "#f2d24a", x: "0.4%", y: "48%", size: 18 },
    { color: "#e86aa0", x: "1%", y: "76%", size: 16 },
    { color: "#f4efe4", x: "0.6%", y: "92%", size: 14 },
    { color: "#f4efe4", x: "95.5%", y: "18%", size: 15 },
    { color: "#c084fc", x: "96%", y: "46%", size: 14 },
    { color: "#e86aa0", x: "95%", y: "74%", size: 18 },
    { color: "#f2d24a", x: "6%", y: "94%", size: 16 },
    { color: "#e86aa0", x: "24%", y: "95%", size: 18 },
    { color: "#f4efe4", x: "62%", y: "94.5%", size: 14 },
    { color: "#c084fc", x: "86%", y: "94.5%", size: 16 },
    { color: "#e86aa0", x: "92%", y: "93%", size: 20 },
  ];
  const leaves: { x: string; y: string; rot: number }[] = [
    { x: "3%", y: "8%", rot: -20 },
    { x: "8%", y: "5%", rot: 15 },
    { x: "14%", y: "2%", rot: -10 },
    { x: "30%", y: "1%", rot: 25 },
    { x: "40%", y: "2%", rot: -15 },
    { x: "58%", y: "1%", rot: 10 },
    { x: "76%", y: "2%", rot: -25 },
    { x: "90%", y: "6%", rot: 18 },
    { x: "2%", y: "16%", rot: 70 },
    { x: "1%", y: "34%", rot: 85 },
    { x: "2%", y: "58%", rot: 95 },
    { x: "1.5%", y: "82%", rot: 80 },
    { x: "96%", y: "14%", rot: -80 },
    { x: "97%", y: "32%", rot: -90 },
    { x: "96%", y: "56%", rot: -85 },
    { x: "97%", y: "80%", rot: -70 },
    { x: "16%", y: "93%", rot: 10 },
    { x: "42%", y: "95%", rot: -8 },
    { x: "54%", y: "94%", rot: 12 },
    { x: "72%", y: "93%", rot: -18 },
  ];
  return (
    <div className="mattemagi-vine">
      {leaves.map((l, i) => (
        <PixelLeaf key={`l-${i}`} x={l.x} y={l.y} rot={l.rot} />
      ))}
      {blooms.map((b, i) => (
        <PixelBloom key={`b-${i}`} color={b.color} x={b.x} y={b.y} size={b.size} />
      ))}
    </div>
  );
}
