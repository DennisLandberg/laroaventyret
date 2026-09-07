"use client";

import React from "react";
import { Direction } from "@/app/game/types";

interface PlayerProps {
  xPercent: number;
  yPercent: number;
  direction: Direction;
  isMoving: boolean;
}

export default function Player({
  xPercent,
  yPercent,
  direction,
  isMoving,
}: PlayerProps) {
  return (
    <div
      style={{
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        transform: "translate(-50%, -65%)",
      }}
      className="absolute w-10 h-14 pointer-events-none z-20 flex flex-col items-center justify-center select-none"
    >
      {/* Soft shadow beneath player */}
      <div className="absolute -bottom-1 w-8 h-3 bg-black/25 rounded-full blur-[1px]" />

      {/* Adventurer Character Container with Walking Bob */}
      <div
        className={`relative flex flex-col items-center transition-transform ${
          isMoving ? "animate-bounce" : ""
        }`}
        style={{ animationDuration: "0.25s" }}
      >
        {/* Hat / Hair */}
        <div className="relative w-8 h-4 bg-amber-500 rounded-t-full border border-amber-600 shadow-sm flex items-center justify-center">
          {/* Hat brim */}
          <div className="absolute -bottom-1 w-9 h-1.5 bg-amber-600 rounded-full" />
          {/* Little badge on hat */}
          <div className="w-1.5 h-1.5 bg-yellow-200 rounded-full" />
        </div>

        {/* Head / Face */}
        <div className="relative w-7 h-6 bg-amber-100 rounded-b-xl border border-amber-300 flex items-center justify-center overflow-hidden">
          {direction === "up" ? (
            // Back of head
            <div className="w-full h-full bg-amber-800/80 rounded-b-xl" />
          ) : direction === "left" ? (
            // Facing Left
            <div className="flex items-center justify-start w-full px-1">
              <div className="w-1.5 h-2 bg-slate-800 rounded-full" />
              <div className="w-1 h-1 bg-pink-300 rounded-full ml-1" />
            </div>
          ) : direction === "right" ? (
            // Facing Right
            <div className="flex items-center justify-end w-full px-1">
              <div className="w-1 h-1 bg-pink-300 rounded-full mr-1" />
              <div className="w-1.5 h-2 bg-slate-800 rounded-full" />
            </div>
          ) : (
            // Facing Down (Forward)
            <div className="flex flex-col items-center justify-center gap-0.5 mt-0.5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-2 bg-slate-800 rounded-full" />
                <div className="w-1.5 h-2 bg-slate-800 rounded-full" />
              </div>
              <div className="w-2 h-1 bg-rose-400 rounded-full" />
            </div>
          )}
        </div>

        {/* Body / Tunic with Backpack */}
        <div className="relative w-7 h-5 bg-sky-500 rounded-md border border-sky-600 flex items-center justify-center">
          {/* Backpack indicator */}
          {direction === "up" ? (
            <div className="w-5 h-4 bg-amber-700 rounded-sm border border-amber-800" />
          ) : direction === "left" ? (
            <div className="absolute right-0 w-2 h-3.5 bg-amber-700 rounded-l-sm" />
          ) : direction === "right" ? (
            <div className="absolute left-0 w-2 h-3.5 bg-amber-700 rounded-r-sm" />
          ) : (
            // Straps on chest
            <div className="w-full flex justify-between px-1">
              <div className="w-1 h-3.5 bg-amber-700" />
              <div className="w-1 h-3.5 bg-amber-700" />
            </div>
          )}
        </div>

        {/* Feet / Boots */}
        <div className="flex gap-2">
          <div
            className={`w-2.5 h-2 bg-amber-900 rounded-sm transition-transform ${
              isMoving ? "translate-y-0.5" : ""
            }`}
          />
          <div
            className={`w-2.5 h-2 bg-amber-900 rounded-sm transition-transform ${
              isMoving ? "-translate-y-0.5" : ""
            }`}
          />
        </div>
      </div>
    </div>
  );
}
