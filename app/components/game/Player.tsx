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
        transform: "translate(-50%, -70%)",
      }}
      className="absolute w-10 h-14 pointer-events-none z-20 flex flex-col items-center justify-center select-none"
    >
      {/* Soft shadow beneath player */}
      <div className="absolute -bottom-1 w-9 h-3 bg-black/30 rounded-full blur-[1px]" />

      {/* Adventurer Sprite Container with Walking Bobbing Animation */}
      <div
        className={`relative flex flex-col items-center filter drop-shadow-sm transition-transform ${
          isMoving ? "animate-bounce" : ""
        }`}
        style={{ animationDuration: "0.26s" }}
      >
        <svg
          width="36"
          height="46"
          viewBox="0 0 36 46"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          {/* DIRECTION: DOWN (Facing Player) */}
          {direction === "down" && (
            <g>
              {/* Explorer Hat */}
              <ellipse cx="18" cy="11" rx="14" ry="4.5" fill="#B45309" />
              <path
                d="M8 11C8 5.5 12 3 18 3C24 3 28 5.5 28 11"
                fill="#D97706"
                stroke="#92400E"
                strokeWidth="1.5"
              />
              {/* Hat Band & Feather */}
              <path d="M9 10H27V12H9V10Z" fill="#78350F" />
              <path d="M21 4L24 1L23 5L21 4Z" fill="#FDE047" />

              {/* Head & Ears */}
              <ellipse cx="6" cy="16" rx="2" ry="2.5" fill="#FDE68A" />
              <ellipse cx="30" cy="16" rx="2" ry="2.5" fill="#FDE68A" />
              <rect
                x="8"
                y="10"
                width="20"
                height="14"
                rx="6"
                fill="#FEF3C7"
                stroke="#FCD34D"
                strokeWidth="1.2"
              />

              {/* Hair strands */}
              <path
                d="M10 11C11 14 13 15 15 13C16 15 18 15 20 13C22 15 24 14 26 11"
                stroke="#92400E"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Eyes & Blush */}
              <circle cx="13" cy="17" r="1.8" fill="#1E293B" />
              <circle cx="23" cy="17" r="1.8" fill="#1E293B" />
              <circle cx="14" cy="16.2" r="0.6" fill="#FFFFFF" />
              <circle cx="24" cy="16.2" r="0.6" fill="#FFFFFF" />
              <ellipse cx="10.5" cy="19.5" rx="1.8" ry="1" fill="#FCA5A5" />
              <ellipse cx="25.5" cy="19.5" rx="1.8" ry="1" fill="#FCA5A5" />
              {/* Cheerful Smile */}
              <path
                d="M16 20C17 21.2 19 21.2 20 20"
                stroke="#B91C1C"
                strokeWidth="1.2"
                strokeLinecap="round"
              />

              {/* Tunic / Body */}
              <rect
                x="10"
                y="24"
                width="16"
                height="12"
                rx="3"
                fill="#0284C7"
                stroke="#0369A1"
                strokeWidth="1.5"
              />
              {/* Scarf / Collar */}
              <path
                d="M14 24L18 27L22 24"
                stroke="#FDE047"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Belt with Gold Buckle */}
              <rect x="10" y="32" width="16" height="3" fill="#78350F" />
              <rect x="16" y="31.5" width="4" height="4" rx="0.5" fill="#FBBF24" />

              {/* Backpack straps */}
              <line x1="12" y1="24" x2="12" y2="32" stroke="#92400E" strokeWidth="1.5" />
              <line x1="24" y1="24" x2="24" y2="32" stroke="#92400E" strokeWidth="1.5" />

              {/* Boots / Feet */}
              <rect
                x="11"
                y={isMoving ? "37" : "38"}
                width="5"
                height="6"
                rx="2"
                fill="#78350F"
              />
              <rect
                x="20"
                y={isMoving ? "39" : "38"}
                width="5"
                height="6"
                rx="2"
                fill="#78350F"
              />
            </g>
          )}

          {/* DIRECTION: UP (Facing Away) */}
          {direction === "up" && (
            <g>
              {/* Explorer Hat Back */}
              <ellipse cx="18" cy="11" rx="14" ry="4.5" fill="#B45309" />
              <path
                d="M8 11C8 5.5 12 3 18 3C24 3 28 5.5 28 11"
                fill="#D97706"
                stroke="#92400E"
                strokeWidth="1.5"
              />
              <path d="M9 10H27V12H9V10Z" fill="#78350F" />

              {/* Head / Back of Hair */}
              <rect
                x="8"
                y="10"
                width="20"
                height="14"
                rx="6"
                fill="#92400E"
              />

              {/* Backpack on Back */}
              <rect
                x="11"
                y="22"
                width="14"
                height="13"
                rx="3"
                fill="#92400E"
                stroke="#78350F"
                strokeWidth="1.5"
              />
              <rect x="13" y="24" width="10" height="5" rx="1" fill="#B45309" />
              <rect x="17" y="29" width="2" height="3" fill="#FBBF24" />

              {/* Tunic sides */}
              <rect x="9" y="24" width="2.5" height="9" rx="1" fill="#0284C7" />
              <rect x="24.5" y="24" width="2.5" height="9" rx="1" fill="#0284C7" />

              {/* Boots */}
              <rect
                x="11"
                y={isMoving ? "37" : "38"}
                width="5"
                height="6"
                rx="2"
                fill="#78350F"
              />
              <rect
                x="20"
                y={isMoving ? "39" : "38"}
                width="5"
                height="6"
                rx="2"
                fill="#78350F"
              />
            </g>
          )}

          {/* DIRECTION: LEFT */}
          {direction === "left" && (
            <g>
              {/* Hat brim tilted */}
              <ellipse cx="17" cy="11" rx="13" ry="4" fill="#B45309" />
              <path
                d="M9 11C9 5.5 13 3 18 3C22 3 25 5.5 25 11"
                fill="#D97706"
                stroke="#92400E"
                strokeWidth="1.5"
              />
              <path d="M8 10H25V12H8V10Z" fill="#78350F" />

              {/* Head Profile */}
              <rect
                x="10"
                y="10"
                width="15"
                height="14"
                rx="6"
                fill="#FEF3C7"
                stroke="#FCD34D"
                strokeWidth="1"
              />
              {/* Eye & Cheek */}
              <circle cx="13" cy="17" r="1.8" fill="#1E293B" />
              <circle cx="13.5" cy="16.2" r="0.6" fill="#FFFFFF" />
              <ellipse cx="12" cy="19.5" rx="1.5" ry="1" fill="#FCA5A5" />

              {/* Body & Side Backpack */}
              <rect
                x="12"
                y="24"
                width="12"
                height="12"
                rx="3"
                fill="#0284C7"
                stroke="#0369A1"
                strokeWidth="1.5"
              />
              {/* Backpack sticking out on right */}
              <rect
                x="21"
                y="23"
                width="6"
                height="11"
                rx="2"
                fill="#92400E"
                stroke="#78350F"
                strokeWidth="1"
              />
              {/* Belt */}
              <rect x="12" y="32" width="10" height="3" fill="#78350F" />

              {/* Boots */}
              <rect
                x="11"
                y={isMoving ? "37" : "38"}
                width="5.5"
                height="6"
                rx="2"
                fill="#78350F"
              />
              <rect
                x="17"
                y={isMoving ? "39" : "38"}
                width="5.5"
                height="6"
                rx="2"
                fill="#592507"
              />
            </g>
          )}

          {/* DIRECTION: RIGHT */}
          {direction === "right" && (
            <g>
              {/* Hat brim tilted */}
              <ellipse cx="19" cy="11" rx="13" ry="4" fill="#B45309" />
              <path
                d="M11 11C11 5.5 14 3 18 3C23 3 27 5.5 27 11"
                fill="#D97706"
                stroke="#92400E"
                strokeWidth="1.5"
              />
              <path d="M11 10H28V12H11V10Z" fill="#78350F" />

              {/* Head Profile */}
              <rect
                x="11"
                y="10"
                width="15"
                height="14"
                rx="6"
                fill="#FEF3C7"
                stroke="#FCD34D"
                strokeWidth="1"
              />
              {/* Eye & Cheek */}
              <circle cx="23" cy="17" r="1.8" fill="#1E293B" />
              <circle cx="23.5" cy="16.2" r="0.6" fill="#FFFFFF" />
              <ellipse cx="24" cy="19.5" rx="1.5" ry="1" fill="#FCA5A5" />

              {/* Body & Side Backpack */}
              <rect
                x="12"
                y="24"
                width="12"
                height="12"
                rx="3"
                fill="#0284C7"
                stroke="#0369A1"
                strokeWidth="1.5"
              />
              {/* Backpack sticking out on left */}
              <rect
                x="9"
                y="23"
                width="6"
                height="11"
                rx="2"
                fill="#92400E"
                stroke="#78350F"
                strokeWidth="1"
              />
              {/* Belt */}
              <rect x="14" y="32" width="10" height="3" fill="#78350F" />

              {/* Boots */}
              <rect
                x="14"
                y={isMoving ? "39" : "38"}
                width="5.5"
                height="6"
                rx="2"
                fill="#592507"
              />
              <rect
                x="20"
                y={isMoving ? "37" : "38"}
                width="5.5"
                height="6"
                rx="2"
                fill="#78350F"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
