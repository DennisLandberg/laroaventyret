"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { WorldConfig, WorldId, Position, Direction, Interactable } from "@/app/game/types";
import Player from "./Player";
import HUD from "./HUD";

interface GameWorldProps {
  world: WorldConfig;
  stars: number;
  coins: number;
  initialPlayerPos?: Position;
  onTeleport: (targetWorld: WorldId, targetSpawn?: Position) => void;
  onStartMattemagi: () => void;
}

export default function GameWorld({
  world,
  stars,
  coins,
  initialPlayerPos,
  onTeleport,
  onStartMattemagi,
}: GameWorldProps) {
  // Player position and state
  const [playerPos, setPlayerPos] = useState<Position>(
    initialPlayerPos || world.spawnPosition
  );
  const [direction, setDirection] = useState<Direction>("down");
  const [isMoving, setIsMoving] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [infoModal, setInfoModal] = useState<string | null>(null);

  // References for game loop
  const posRef = useRef<Position>(initialPlayerPos || world.spawnPosition);
  const keysPressed = useRef<Set<string>>(new Set());
  const activeInteractableRef = useRef<Interactable | null>(null);
  const lastTimeRef = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);

  // Collision helper with wall-sliding support
  const checkCollision = useCallback(
    (x: number, y: number): boolean => {
      const radius = 14;
      // World boundary collision
      if (
        x < radius + 15 ||
        x > world.width - radius - 15 ||
        y < radius + 15 ||
        y > world.height - radius - 15
      ) {
        return true;
      }

      // Obstacle collision
      for (const obs of world.obstacles) {
        if (
          x + radius > obs.x &&
          x - radius < obs.x + obs.width &&
          y + radius > obs.y &&
          y - radius < obs.y + obs.height
        ) {
          return true;
        }
      }
      return false;
    },
    [world]
  );

  // Find nearby interactable
  const checkInteractables = useCallback(
    (x: number, y: number) => {
      let nearest: Interactable | null = null;
      let minDistance = Infinity;

      for (const item of world.interactables) {
        const dist = Math.hypot(item.x - x, item.y - y);
        if (dist <= item.radius && dist < minDistance) {
          minDistance = dist;
          nearest = item;
        }
      }

      activeInteractableRef.current = nearest;
      setActivePrompt(nearest ? nearest.prompt : null);
    },
    [world]
  );

  // Execute interaction
  const triggerInteraction = useCallback(() => {
    const item = activeInteractableRef.current;
    if (!item) return;

    if (item.action === "start_mattemagi") {
      onStartMattemagi();
    } else if (item.action === "teleport" && item.targetWorld) {
      onTeleport(item.targetWorld, item.targetSpawn);
    } else if (item.action === "info") {
      setInfoModal(item.infoMessage || item.prompt);
    }
  }, [onStartMattemagi, onTeleport]);

  // Handle keyboard inputs
  useEffect(() => {
    const keys = keysPressed.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling with arrows or spacebar
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
          e.code
        )
      ) {
        e.preventDefault();
      }

      keys.add(e.code);

      // Trigger E interaction
      if (e.key === "e" || e.key === "E") {
        triggerInteraction();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.delete(e.code);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      keys.clear();
    };
  }, [triggerInteraction]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    const speed = 190; // Pixels per second

    const updateLoop = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      let vx = 0;
      let vy = 0;

      const keys = keysPressed.current;

      if (keys.has("KeyW") || keys.has("ArrowUp")) vy -= 1;
      if (keys.has("KeyS") || keys.has("ArrowDown")) vy += 1;
      if (keys.has("KeyA") || keys.has("ArrowLeft")) vx -= 1;
      if (keys.has("KeyD") || keys.has("ArrowRight")) vx += 1;

      const moving = vx !== 0 || vy !== 0;
      setIsMoving(moving);

      if (moving) {
        // Update directional facing
        if (Math.abs(vx) > Math.abs(vy)) {
          setDirection(vx > 0 ? "right" : "left");
        } else if (vy !== 0) {
          setDirection(vy > 0 ? "down" : "up");
        }

        // Normalize diagonal speed
        if (vx !== 0 && vy !== 0) {
          vx *= Math.SQRT1_2;
          vy *= Math.SQRT1_2;
        }

        const moveDistX = vx * speed * dt;
        const moveDistY = vy * speed * dt;

        const currX = posRef.current.x;
        const currY = posRef.current.y;

        let nextX = currX;
        let nextY = currY;

        // Try moving along X
        if (!checkCollision(currX + moveDistX, currY)) {
          nextX = currX + moveDistX;
        }

        // Try moving along Y (wall-sliding)
        if (!checkCollision(nextX, currY + moveDistY)) {
          nextY = currY + moveDistY;
        }

        posRef.current = { x: nextX, y: nextY };
        setPlayerPos({ x: nextX, y: nextY });

        // Update active interactables proximity
        checkInteractables(nextX, nextY);
      }

      animationFrameId.current = requestAnimationFrame(updateLoop);
    };

    lastTimeRef.current = performance.now();
    animationFrameId.current = requestAnimationFrame(updateLoop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [checkCollision, checkInteractables]);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center select-none">
      {/* Top HUD */}
      <div className="w-full mb-2 sm:mb-2.5">
        <HUD world={world} stars={stars} coins={coins} />
      </div>

      {/* Game Viewport Canvas/Container with Handcrafted Timber Frame */}
      <div
        style={{ width: "100%", maxWidth: "880px", aspectRatio: "800 / 600" }}
        className="relative overflow-hidden rounded-3xl border-4 sm:border-6 border-amber-950/90 shadow-2xl bg-emerald-800 ring-4 ring-amber-900/30"
      >
        {/* Rich World Floor Background with Textured Pixel Grass */}
        <div
          className={`absolute inset-0 ${world.groundBgClass}`}
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.09) 1.5px, transparent 1.5px), radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)`,
            backgroundSize: "20px 20px, 40px 40px",
          }}
        />

        {/* Natural Paths with Soft Earth Tones and Texture */}
        {world.paths.map((p, idx) => (
          <div
            key={idx}
            style={{
              left: `${(p.x / world.width) * 100}%`,
              top: `${(p.y / world.height) * 100}%`,
              width: `${(p.width / world.width) * 100}%`,
              height: `${(p.height / world.height) * 100}%`,
            }}
            className={`absolute rounded-2xl ${
              p.type === "stone"
                ? "bg-stone-300 border-2 border-stone-400/90 shadow-inner"
                : p.type === "sand"
                ? "bg-amber-200 border-2 border-amber-300/90"
                : "bg-[#b07848] border-2 border-[#834f26] shadow-inner"
            }`}
          >
            {/* Subtle path stepping details */}
            {p.type === "dirt" && (
              <div className="w-full h-full opacity-25 flex items-center justify-around pointer-events-none text-[10px]">
                <span>•</span>
                <span>•</span>
                <span>•</span>
              </div>
            )}
          </div>
        ))}

        {/* Scenery Objects */}
        {world.scenery.map((item) => {
          const left = `${(item.x / world.width) * 100}%`;
          const top = `${(item.y / world.height) * 100}%`;
          const width = `${(item.width / world.width) * 100}%`;
          const height = `${(item.height / world.height) * 100}%`;

          if (item.type === "house") {
            // Detailed Cozy Player Cottage
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 flex flex-col items-center pointer-events-none filter drop-shadow-md"
              >
                {/* Chimney smoke */}
                <div className="absolute -top-4 right-7 text-xs animate-bounce opacity-80">
                  💨
                </div>

                {/* Shingle Roof */}
                <div className="w-full h-[52%] bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 rounded-t-2xl border-2 border-amber-950 flex flex-col items-center justify-center relative shadow-md overflow-hidden">
                  {/* Chimney */}
                  <div className="absolute -top-1 right-5 w-4 h-6 bg-stone-700 rounded-t-xs border border-stone-900 shadow-inner" />
                  {/* Roof Shingle Texture Rows */}
                  <div className="w-full border-b border-amber-950/40 my-0.5" />
                  <div className="w-full border-b border-amber-950/40 my-0.5" />
                  <span className="text-amber-100 text-[11px] font-black tracking-wider uppercase drop-shadow z-10">
                    {item.label}
                  </span>
                </div>

                {/* Timber Walls & Porch */}
                <div className="w-full h-[48%] bg-amber-100 border-2 border-t-0 border-amber-900 rounded-b-lg flex items-end justify-between px-3 pb-1 shadow-inner relative">
                  {/* Stone foundation strip */}
                  <div className="absolute bottom-0 inset-x-0 h-1.5 bg-stone-500 rounded-b-xs border-t border-stone-600" />

                  {/* Window with Flower Box */}
                  <div className="relative flex flex-col items-center mb-1">
                    <div className="w-7 h-7 bg-yellow-200 border-2 border-amber-900 rounded shadow-sm flex items-center justify-center relative overflow-hidden">
                      <div className="w-full h-0.5 bg-amber-900/60" />
                      <div className="h-full w-0.5 bg-amber-900/60 absolute" />
                    </div>
                    {/* Flower Box */}
                    <div className="w-8 h-2 bg-amber-800 rounded-b-xs border border-amber-950 text-[8px] flex justify-around items-center -mt-0.5">
                      <span>🌸</span>
                      <span>🌼</span>
                    </div>
                  </div>

                  {/* Cozy Wooden Door with Porch Step */}
                  <div className="relative flex flex-col items-center">
                    <div className="w-8 h-11 bg-amber-800 border-2 border-amber-950 rounded-t-md flex items-center justify-between px-1 shadow-inner">
                      <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full ml-auto shadow-xs" />
                    </div>
                    {/* Porch Welcome Step */}
                    <div className="w-10 h-2 bg-amber-900 rounded-sm border border-amber-950 -mt-0.5 shadow-xs" />
                  </div>

                  {/* Second Window with Flower Box */}
                  <div className="relative flex flex-col items-center mb-1">
                    <div className="w-7 h-7 bg-yellow-200 border-2 border-amber-900 rounded shadow-sm flex items-center justify-center relative overflow-hidden">
                      <div className="w-full h-0.5 bg-amber-900/60" />
                      <div className="h-full w-0.5 bg-amber-900/60 absolute" />
                    </div>
                    {/* Flower Box */}
                    <div className="w-8 h-2 bg-amber-800 rounded-b-xs border border-amber-950 text-[8px] flex justify-around items-center -mt-0.5">
                      <span>🌷</span>
                      <span>🌸</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (item.type === "math_house") {
            // Math House ("Mattehuset")
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 flex flex-col items-center pointer-events-none"
              >
                {/* Roof */}
                <div className="w-full h-1/2 bg-indigo-700 rounded-t-2xl border-2 border-indigo-950 flex flex-col items-center justify-center shadow-lg relative">
                  <span className="text-yellow-300 text-sm font-black animate-pulse">
                    ✨ 1 + 2 = 3 ✨
                  </span>
                  <span className="text-white text-xs font-bold">{item.label}</span>
                </div>
                {/* Walls */}
                <div className="w-full h-1/2 bg-indigo-100 border-2 border-t-0 border-indigo-900 rounded-b-lg flex items-end justify-between px-3 pb-1 shadow-inner">
                  <div className="text-xl">🪄</div>
                  {/* Glowing Math Door */}
                  <div className="w-9 h-11 bg-indigo-900 border border-indigo-950 rounded-t-lg flex items-center justify-center shadow-md">
                    <span className="text-amber-300 font-black text-xs">NUM</span>
                  </div>
                  <div className="text-xl">⭐</div>
                </div>
              </div>
            );
          }

          if (item.type === "tree") {
            const isBlossom = item.color === "pink";
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 flex flex-col items-center pointer-events-none filter drop-shadow-md"
              >
                {/* Tree Foliage Canopy */}
                <div
                  className={`w-full h-[78%] rounded-3xl border-2 flex items-center justify-center relative overflow-hidden shadow-md ${
                    isBlossom
                      ? "bg-gradient-to-b from-pink-300 via-pink-400 to-rose-400 border-pink-600 ring-2 ring-pink-200/50"
                      : "bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-900 border-emerald-950"
                  }`}
                >
                  {/* Foliage Highlights & Leaf clusters */}
                  <div
                    className={`absolute -top-1 -left-1 w-1/2 h-1/2 rounded-full opacity-60 ${
                      isBlossom ? "bg-pink-100" : "bg-emerald-400"
                    }`}
                  />
                  <div
                    className={`absolute top-2 right-2 w-1/3 h-1/3 rounded-full opacity-50 ${
                      isBlossom ? "bg-pink-200" : "bg-emerald-500"
                    }`}
                  />
                  <span className="text-2xl sm:text-3xl z-10 drop-shadow">
                    {isBlossom ? "🌸" : "🌲"}
                  </span>
                </div>
                {/* Wooden Trunk & Roots */}
                <div className="w-3 h-[22%] bg-gradient-to-b from-amber-900 to-amber-950 rounded-b-xs border-x border-amber-950" />
              </div>
            );
          }

          if (item.type === "bush") {
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 flex items-center justify-center pointer-events-none filter drop-shadow-xs"
              >
                <div className="w-full h-full bg-emerald-700 border-2 border-emerald-950 rounded-full flex items-center justify-around px-1 shadow-inner">
                  <span className="text-xs">🍓</span>
                  <span className="text-xs">🌿</span>
                </div>
              </div>
            );
          }

          if (item.type === "flower") {
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 text-lg flex items-center justify-center pointer-events-none animate-pulse"
                style-prop={{ animationDuration: "3s" }}
              >
                {item.customIcon || "🌸"}
              </div>
            );
          }

          if (item.type === "fence") {
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 bg-amber-900/90 border-2 border-amber-950 rounded-xs flex items-center justify-around overflow-hidden shadow-xs pointer-events-none"
              >
                <div className="w-2 h-full bg-amber-950 border-r border-amber-800" />
                <div className="w-2 h-full bg-amber-950 border-r border-amber-800" />
              </div>
            );
          }

          if (item.type === "garden_bed") {
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 bg-[#3d2415] border-2 border-[#26150b] rounded-lg p-1.5 flex flex-col justify-around items-center shadow-inner pointer-events-none"
              >
                {/* Furrowed Earth Rows */}
                <div className="flex justify-around w-full border-b border-black/20 pb-0.5 text-sm sm:text-base">
                  <span className="drop-shadow-xs">{item.customIcon || "🌱"}</span>
                  <span className="drop-shadow-xs">{item.customIcon || "🌱"}</span>
                </div>
                <div className="flex justify-around w-full pt-0.5 text-sm sm:text-base">
                  <span className="drop-shadow-xs">{item.customIcon || "🌱"}</span>
                  <span className="drop-shadow-xs">{item.customIcon || "🌱"}</span>
                </div>
              </div>
            );
          }

          if (item.type === "well") {
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 flex flex-col items-center justify-center pointer-events-none filter drop-shadow-md"
              >
                {/* Well Roof */}
                <div className="w-full h-4 bg-amber-800 rounded-t-md border-2 border-amber-950 flex items-center justify-center text-[9px] text-amber-200 font-bold shadow-xs">
                  BRUNN
                </div>
                {/* Stone Base & Bucket */}
                <div className="w-[88%] h-7 bg-stone-500 rounded-b-md border-2 border-stone-800 shadow-inner flex items-center justify-center text-xs">
                  🪣
                </div>
              </div>
            );
          }

          if (item.type === "mailbox") {
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 flex flex-col items-center justify-center pointer-events-none text-2xl filter drop-shadow-sm"
              >
                📮
              </div>
            );
          }

          if (item.type === "bed") {
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 bg-amber-900 border-2 border-amber-950 rounded-lg p-1 flex flex-col shadow-md pointer-events-none overflow-hidden"
              >
                <div className="w-full h-1/3 bg-amber-800 rounded-t flex items-center justify-center">
                  <div className="w-3/4 h-4 bg-white/90 rounded border border-slate-300 shadow-xs" />
                </div>
                <div className="w-full h-2/3 bg-rose-600 rounded-b border-t-2 border-rose-800 flex items-center justify-center text-xs text-yellow-200 font-bold">
                  ★
                </div>
              </div>
            );
          }

          if (item.type === "fireplace") {
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 bg-stone-700 border-2 border-stone-900 rounded-t-lg flex flex-col items-center justify-between p-1 shadow-lg pointer-events-none"
              >
                <div className="w-full h-2.5 bg-stone-800 rounded-t border-b border-stone-950" />
                <div className="w-3/4 h-2/3 bg-stone-950 rounded-t-md flex items-center justify-center border border-stone-800">
                  <span className="text-xl animate-pulse">🔥</span>
                </div>
              </div>
            );
          }

          if (item.type === "table") {
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 bg-amber-800 border-2 border-amber-950 rounded-md flex items-center justify-around px-2 shadow-md pointer-events-none"
              >
                <span className="text-sm">🪑</span>
                <div className="flex items-center gap-1 text-xs">
                  <span>☕</span>
                  <span>🕯️</span>
                </div>
                <span className="text-sm">🪑</span>
              </div>
            );
          }

          if (item.type === "bookshelf") {
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 bg-amber-900 border-2 border-amber-950 rounded-t flex flex-col justify-around p-1 shadow-md pointer-events-none"
              >
                <div className="w-full border-b border-amber-950 flex items-center justify-around text-[10px]">
                  📕📗📘
                </div>
                <div className="w-full border-b border-amber-950 flex items-center justify-around text-[10px]">
                  📙📜🔮
                </div>
                <div className="w-full flex items-center justify-around text-[10px]">
                  📘📕📗
                </div>
              </div>
            );
          }

          if (item.type === "rug") {
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-5 bg-gradient-to-r from-red-800 via-amber-700 to-red-800 border-2 border-amber-400/60 rounded-full flex items-center justify-center shadow-inner pointer-events-none opacity-90"
              >
                <div className="w-3/4 h-2/3 border border-dashed border-amber-300/60 rounded-full flex items-center justify-center text-xs text-amber-200">
                  {item.customIcon || "⚜️"}
                </div>
              </div>
            );
          }

          if (item.type === "chalkboard") {
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 bg-emerald-950 border-4 border-amber-900 rounded-md shadow-lg p-1.5 flex flex-col justify-between pointer-events-none"
              >
                <div className="flex justify-between items-center text-yellow-200 text-xs font-mono font-bold px-2">
                  <span>✨ 1 + 2 = 3</span>
                  <span>2 + 2 = 4 ✨</span>
                </div>
                <div className="text-center text-white/90 text-xs font-sans font-bold">
                  {item.label}
                </div>
              </div>
            );
          }

          if (item.type === "pedestal") {
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 flex flex-col items-center justify-between pointer-events-none select-none"
              >
                {/* Floating Book or Padlock */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-2 transition-all ${
                    item.isLocked
                      ? "bg-slate-700 border-slate-500 text-slate-300 opacity-80"
                      : "bg-gradient-to-tr from-amber-400 to-yellow-300 border-amber-200 text-amber-950 animate-bounce shadow-amber-300/60 ring-4 ring-amber-300/30"
                  }`}
                >
                  {item.isLocked ? "🔒" : "📖"}
                </div>

                {/* Pedestal Base */}
                <div
                  className={`w-full h-8 rounded-md border-2 flex items-center justify-center text-[10px] font-black tracking-wider uppercase shadow-inner ${
                    item.isLocked
                      ? "bg-slate-600 border-slate-700 text-slate-300"
                      : "bg-amber-600 border-amber-700 text-yellow-100"
                  }`}
                >
                  {item.label}
                </div>
              </div>
            );
          }

          if (item.type === "rock") {
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 flex items-center justify-center pointer-events-none text-2xl filter drop-shadow-xs"
              >
                {item.customIcon || "🪨"}
              </div>
            );
          }

          if (item.type === "sign") {
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 flex items-center justify-center pointer-events-none text-2xl filter drop-shadow-xs"
              >
                {item.customIcon || "🪧"}
              </div>
            );
          }

          if (item.type === "deco") {
            // Specialized environmental props
            if (item.customIcon === "pond") {
              // Mini Lilypad Pond
              return (
                <div
                  key={item.id}
                  style={{ left, top, width, height }}
                  className="absolute z-10 bg-sky-600/90 border-3 border-stone-600 rounded-full flex items-center justify-around shadow-inner pointer-events-none overflow-hidden"
                >
                  <span className="text-xs animate-pulse">🪷</span>
                  <span className="text-xs">🌾</span>
                  <span className="text-[10px]">💧</span>
                </div>
              );
            }

            if (item.customIcon === "bench") {
              // Wooden Garden Bench
              return (
                <div
                  key={item.id}
                  style={{ left, top, width, height }}
                  className="absolute z-10 bg-amber-800 border-2 border-amber-950 rounded-sm flex flex-col justify-around py-0.5 shadow-sm pointer-events-none"
                >
                  <div className="w-full h-1 bg-amber-700 border-b border-amber-950" />
                  <div className="w-full h-1 bg-amber-700" />
                </div>
              );
            }

            if (item.customIcon === "lantern") {
              // Rustic Lantern Post
              return (
                <div
                  key={item.id}
                  style={{ left, top, width, height }}
                  className="absolute z-10 flex flex-col items-center justify-end pointer-events-none filter drop-shadow"
                >
                  <div className="w-4 h-4 bg-yellow-300 rounded-full border border-amber-900 flex items-center justify-center text-[10px] animate-pulse shadow-yellow-300/80 shadow-md">
                    🕯️
                  </div>
                  <div className="w-1.5 h-6 bg-stone-700 rounded-b-xs" />
                </div>
              );
            }

            if (item.customIcon === "barrel") {
              // Wooden Barrel
              return (
                <div
                  key={item.id}
                  style={{ left, top, width, height }}
                  className="absolute z-10 bg-amber-900 border-2 border-amber-950 rounded-sm flex flex-col justify-around py-0.5 shadow-sm pointer-events-none text-[10px] items-center text-amber-200"
                >
                  <div className="w-full h-0.5 bg-stone-700" />
                  <span>🪵</span>
                  <div className="w-full h-0.5 bg-stone-700" />
                </div>
              );
            }

            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 flex items-center justify-center pointer-events-none text-xl animate-pulse"
              >
                {item.customIcon}
              </div>
            );
          }

          return null;
        })}

        {/* Handcrafted Stone-Framed Portals */}
        {world.interactables
          .filter((i) => i.type === "portal")
          .map((portal) => {
            const left = `${((portal.x - 36) / world.width) * 100}%`;
            const top = `${((portal.y - 36) / world.height) * 100}%`;

            const isBlue = portal.portalColor === "blue";
            const isGreen = portal.portalColor === "green";

            const ringClasses = isBlue
              ? "border-sky-400 bg-sky-600/30 shadow-sky-400/90"
              : isGreen
              ? "border-emerald-400 bg-emerald-600/30 shadow-emerald-400/90"
              : "border-amber-400 bg-amber-600/30 shadow-amber-400/90";

            return (
              <div
                key={portal.id}
                style={{ left, top, width: "72px", height: "72px" }}
                className="absolute z-10 flex flex-col items-center justify-center pointer-events-none select-none filter drop-shadow-lg"
              >
                {/* Ancient Stone Portal Arch Frame */}
                <div className="absolute inset-0 rounded-full border-4 border-stone-600/90 bg-stone-800/40 pointer-events-none" />

                {/* Swirling Magical Energy Vortex */}
                <div
                  className={`w-14 h-14 rounded-full border-4 ${ringClasses} shadow-xl animate-spin flex items-center justify-center backdrop-blur-xs`}
                  style={{ animationDuration: "6s" }}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/70 animate-reverse-spin" />
                </div>

                {/* Center Core Sparkle & Rune */}
                <div className="absolute text-xl animate-pulse drop-shadow">
                  {isBlue ? "🌌" : isGreen ? "🍃" : "✨"}
                </div>

                {/* Portal Wooden Label Plaque */}
                <div className="absolute -bottom-6 px-2.5 py-0.5 bg-amber-950/90 rounded-md text-[10px] sm:text-xs font-black text-amber-200 whitespace-nowrap shadow-md border border-amber-700">
                  {portal.label}
                </div>
              </div>
            );
          })}

        {/* Player Character */}
        <Player
          xPercent={(playerPos.x / world.width) * 100}
          yPercent={(playerPos.y / world.height) * 100}
          direction={direction}
          isMoving={isMoving}
        />

        {/* Floating Interaction Prompt Box */}
        {activePrompt && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 px-5 py-2.5 bg-amber-400 text-amber-950 font-black text-sm sm:text-base rounded-full shadow-2xl border-3 border-amber-100 flex items-center gap-2 animate-bounce">
            <span className="px-2 py-0.5 bg-amber-950 text-amber-300 rounded font-black text-xs">
              E
            </span>
            <span>{activePrompt}</span>
          </div>
        )}
      </div>

      {/* Bottom Controls Info Bar */}
      <div className="w-full mt-3 flex items-center justify-between px-4 py-2 bg-white/70 backdrop-blur-sm rounded-xl text-slate-600 text-xs sm:text-sm font-semibold border border-slate-200">
        <div className="flex items-center gap-2">
          <span>🎮</span>
          <span>
            Styr med <kbd className="px-1.5 py-0.5 bg-slate-200 rounded font-mono">W</kbd>{" "}
            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded font-mono">A</kbd>{" "}
            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded font-mono">S</kbd>{" "}
            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded font-mono">D</kbd> eller{" "}
            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded font-mono">Piltangenter</kbd>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Interagera:</span>
          <kbd className="px-2 py-0.5 bg-amber-300 text-amber-950 font-black rounded font-mono">
            E
          </kbd>
        </div>
      </div>

      {/* Friendly Info / Construction Dialog */}
      {infoModal && (
        <div
          role="dialog"
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-amber-300 shadow-2xl text-center animate-fade-in">
            <div className="text-5xl mb-3">🚧</div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">
              Under uppbyggnad!
            </h3>
            <p className="text-slate-600 font-medium text-base mb-6">
              {infoModal}
            </p>
            <button
              onClick={() => setInfoModal(null)}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-base rounded-full shadow-md border-2 border-emerald-300 cursor-pointer transition-all"
            >
              Okej, jag förstår! 👍
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
