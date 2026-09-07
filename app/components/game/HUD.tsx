"use client";

import React from "react";
import { WorldConfig } from "@/app/game/types";

interface HUDProps {
  world: WorldConfig;
  stars: number;
  coins: number;
}

export default function HUD({ world, stars, coins }: HUDProps) {
  return (
    <div className="w-full flex items-center justify-between gap-3 px-3 py-2 sm:px-4 sm:py-2.5 bg-amber-950/85 backdrop-blur-md rounded-2xl border-2 border-amber-700/80 shadow-md text-amber-100 select-none">
      {/* World Name Badge */}
      <div className="flex items-center gap-2">
        <span className="text-xl sm:text-2xl drop-shadow">{world.icon}</span>
        <div>
          <h2 className="text-sm sm:text-base font-black text-amber-200 tracking-wide leading-tight">
            {world.name}
          </h2>
          <p className="text-[11px] text-amber-300/80 font-medium hidden sm:block">
            {world.subtitle}
          </p>
        </div>
      </div>

      {/* Currency Counters (Stars & Coins) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Stars */}
        <div
          className="flex items-center gap-1.5 bg-amber-900/90 border border-amber-600/80 px-3 py-1 rounded-full shadow-inner text-amber-200 font-black text-xs sm:text-sm"
          title="Dina stjärnor"
        >
          <span className="text-sm sm:text-base animate-pulse">⭐</span>
          <span>{stars}</span>
        </div>

        {/* Coins */}
        <div
          className="flex items-center gap-1.5 bg-yellow-950/90 border border-yellow-600/80 px-3 py-1 rounded-full shadow-inner text-yellow-300 font-black text-xs sm:text-sm"
          title="Dina mynt"
        >
          <span className="text-sm sm:text-base">🪙</span>
          <span>{coins}</span>
        </div>
      </div>
    </div>
  );
}
