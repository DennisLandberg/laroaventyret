"use client";

import { useState } from "react";

interface Level {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  themeColor: string;
  unlocked: boolean;
  starsRequired: number;
}

const levels: Level[] = [
  {
    id: 1,
    title: "Mattemagi",
    subtitle: "Klura med magiska siffror och räknetrick!",
    icon: "🪄",
    themeColor: "from-amber-400 to-orange-500",
    unlocked: true,
    starsRequired: 0,
  },
  {
    id: 2,
    title: "Ordskogen",
    subtitle: "Hitta gömda ord och bokstäver bland träden.",
    icon: "🌲",
    themeColor: "from-emerald-400 to-green-600",
    unlocked: false,
    starsRequired: 3,
  },
  {
    id: 3,
    title: "Skrivgrottan",
    subtitle: "Skapa egna spännande berättelser och hemliga meddelanden.",
    icon: "💎",
    themeColor: "from-indigo-400 to-purple-600",
    unlocked: false,
    starsRequired: 6,
  },
];

export default function AdventureMap() {
  const [stars] = useState<number>(0);
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "locked" | null>(null);

  const handleLevelClick = (level: Level) => {
    if (level.unlocked) {
      setMessageType("success");
      setActiveMessage(
        `🎉 Välkommen till ${level.title}! Gör dig redo för ditt allra första magiska uppdrag!`
      );
    } else {
      setMessageType("locked");
      setActiveMessage(
        `🔒 ${level.title} är låst än så länge! Klara föregående nivå för att samla stjärnor och låsa upp den.`
      );
    }
  };

  const handleStartLevel1 = () => {
    const level1 = levels[0];
    handleLevelClick(level1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Top Header: Star Counter */}
      <div className="w-full flex justify-end mb-4 sm:mb-8">
        <div className="flex items-center gap-2 bg-amber-100 border-2 border-amber-300 px-5 py-2.5 rounded-full shadow-md text-amber-900 font-bold text-lg sm:text-xl transform hover:scale-105 transition-transform">
          <span className="text-2xl animate-pulse">⭐</span>
          <span>{stars} stjärnor</span>
        </div>
      </div>

      {/* Main Title & Welcome Box */}
      <div className="text-center mb-10 sm:mb-12">
        <div className="inline-block px-4 py-1.5 bg-yellow-200 text-yellow-900 text-sm sm:text-base font-extrabold rounded-full mb-3 shadow-sm uppercase tracking-wider">
          Ett magiskt lärandeäventyr ✨
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-800 drop-shadow-sm mb-4">
          <span className="bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Läroäventyret
          </span>
        </h1>
        <p className="text-lg sm:text-2xl text-slate-700 max-w-2xl font-medium leading-relaxed bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-3xl shadow-sm border border-orange-100">
          Välkommen till Läroäventyret! Följ den magiska kartan, samla stjärnor
          och klara roliga utmaningar. Är du redo att börja utforska? 🎈
        </p>
      </div>

      {/* Interactive Modal / Toast Notification */}
      {activeMessage && (
        <div
          role="alert"
          className={`w-full max-w-lg mb-8 p-5 rounded-3xl shadow-lg border-2 flex items-center justify-between gap-4 transition-all duration-300 ${
            messageType === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-amber-50 border-amber-300 text-amber-900"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl">
              {messageType === "success" ? "✨" : "🗝️"}
            </span>
            <p className="text-base sm:text-lg font-semibold leading-snug">
              {activeMessage}
            </p>
          </div>
          <button
            onClick={() => setActiveMessage(null)}
            className="text-slate-500 hover:text-slate-800 bg-white/70 hover:bg-white rounded-full p-2 font-bold transition-colors shrink-0"
            aria-label="Stäng meddelande"
          >
            ✕
          </button>
        </div>
      )}

      {/* Adventure Map Container */}
      <div className="w-full bg-gradient-to-b from-sky-50 to-emerald-50 border-4 border-sky-200 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden mb-10">
        {/* Playful Map Header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-3xl">🗺️</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-sky-900">
            Äventyrskartan
          </h2>
          <span className="text-3xl">🧭</span>
        </div>

        {/* Levels Grid / Trail */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {levels.map((level) => {
            return (
              <div
                key={level.id}
                onClick={() => handleLevelClick(level)}
                className={`relative group rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between cursor-pointer select-none text-center ${
                  level.unlocked
                    ? "bg-white border-4 border-amber-400 shadow-xl hover:-translate-y-2 hover:shadow-2xl ring-4 ring-amber-100"
                    : "bg-slate-100/90 border-4 border-slate-300 opacity-75 hover:opacity-90 grayscale-[30%]"
                }`}
              >
                {/* Level Number Pill */}
                <div className="flex justify-between items-center mb-4">
                  <span
                    className={`text-xs sm:text-sm font-extrabold px-3 py-1 rounded-full ${
                      level.unlocked
                        ? "bg-amber-400 text-amber-950 shadow-sm"
                        : "bg-slate-300 text-slate-700"
                    }`}
                  >
                    Nivå {level.id}
                  </span>

                  {/* Status Badge */}
                  {level.unlocked ? (
                    <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-bold px-3 py-1 rounded-full border border-emerald-300">
                      <span>🟢</span> Upplåst
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold px-3 py-1 rounded-full border border-slate-300">
                      <span>🔒</span> Låst
                    </span>
                  )}
                </div>

                {/* Level Icon */}
                <div className="my-3 flex justify-center">
                  <div
                    className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center text-5xl sm:text-6xl shadow-inner transition-transform duration-300 ${
                      level.unlocked
                        ? `bg-gradient-to-tr ${level.themeColor} text-white group-hover:scale-110 shadow-orange-200`
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {level.unlocked ? level.icon : "🔒"}
                  </div>
                </div>

                {/* Level Info */}
                <div className="mt-2">
                  <h3
                    className={`text-2xl font-black mb-2 ${
                      level.unlocked ? "text-slate-800" : "text-slate-500"
                    }`}
                  >
                    {level.title}
                  </h3>
                  <p
                    className={`text-sm sm:text-base ${
                      level.unlocked ? "text-slate-600" : "text-slate-500"
                    }`}
                  >
                    {level.subtitle}
                  </p>
                </div>

                {/* Level Action Prompt */}
                <div className="mt-6 pt-4 border-t border-dashed border-slate-200">
                  {level.unlocked ? (
                    <span className="inline-flex items-center gap-1.5 font-bold text-amber-700 text-base group-hover:underline">
                      Spela nu <span>➔</span>
                    </span>
                  ) : (
                    <span className="text-xs sm:text-sm font-semibold text-slate-500 flex items-center justify-center gap-1">
                      <span>⭐</span> Kräver stjärnor
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trail Footsteps Decoration between cards */}
        <div className="hidden md:flex justify-around items-center mt-6 text-2xl text-sky-400 select-none">
          <span>👣</span>
          <span>👣</span>
          <span>👣</span>
          <span>👣</span>
        </div>
      </div>

      {/* Large Call-To-Action Button for Level 1 */}
      <div className="w-full flex flex-col items-center">
        <button
          onClick={handleStartLevel1}
          className="w-full sm:w-auto min-w-[320px] px-8 py-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white font-black text-2xl sm:text-3xl rounded-full shadow-2xl hover:shadow-emerald-200/80 transition-all duration-200 transform hover:-translate-y-1 flex items-center justify-center gap-4 border-4 border-emerald-300 cursor-pointer"
        >
          <span className="text-3xl animate-bounce">🚀</span>
          <span>Starta Mattemagi!</span>
          <span className="text-3xl">✨</span>
        </button>
        <p className="text-slate-500 text-sm sm:text-base font-semibold mt-3">
          Tryck på knappen för att starta Nivå 1 direkt
        </p>
      </div>
    </div>
  );
}
