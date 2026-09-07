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
    <div className="w-full flex flex-col gap-2 pointer-events-none select-none">
      {/* Top HUD Bar */}
      <div className="w-full flex items-center justify-between gap-4 p-3 sm:p-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-md border-2 border-emerald-300 pointer-events-auto">
        {/* World Name Badge */}
        <div className="flex items-center gap-2.5">
          <span className="text-2xl sm:text-3xl">{world.icon}</span>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 leading-tight">
              {world.name}
            </h2>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              {world.subtitle}
            </p>
          </div>
        </div>

        {/* Currency Counters (Stars & Coins) */}
        <div className="flex items-center gap-3">
          {/* Stars */}
          <div
            className="flex items-center gap-1.5 bg-amber-100 border-2 border-amber-300 px-3.5 py-1.5 rounded-full shadow-sm text-amber-950 font-black text-sm sm:text-base"
            title="Dina stjärnor"
          >
            <span className="text-lg sm:text-xl">⭐</span>
            <span>{stars}</span>
          </div>

          {/* Coins */}
          <div
            className="flex items-center gap-1.5 bg-yellow-100 border-2 border-yellow-400 px-3.5 py-1.5 rounded-full shadow-sm text-yellow-950 font-black text-sm sm:text-base"
            title="Dina mynt"
          >
            <span className="text-lg sm:text-xl">🪙</span>
            <span>{coins}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
