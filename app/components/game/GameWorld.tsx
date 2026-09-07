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
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center select-none">
      {/* Top HUD */}
      <div className="w-full mb-3">
        <HUD world={world} stars={stars} coins={coins} />
      </div>

      {/* Game Viewport Canvas/Container */}
      <div
        style={{ width: "100%", maxWidth: "800px", aspectRatio: "800 / 600" }}
        className="relative overflow-hidden rounded-3xl border-4 border-slate-700 shadow-2xl bg-emerald-700"
      >
        {/* World Floor Background */}
        <div
          className={`absolute inset-0 ${world.groundBgClass}`}
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Paths */}
        {world.paths.map((p, idx) => (
          <div
            key={idx}
            style={{
              left: `${(p.x / world.width) * 100}%`,
              top: `${(p.y / world.height) * 100}%`,
              width: `${(p.width / world.width) * 100}%`,
              height: `${(p.height / world.height) * 100}%`,
            }}
            className={`absolute rounded-xl ${
              p.type === "stone"
                ? "bg-slate-300 border-2 border-slate-400 shadow-inner"
                : p.type === "sand"
                ? "bg-amber-200 border-2 border-amber-300"
                : "bg-amber-300/80 border-2 border-amber-400/90"
            }`}
          />
        ))}

        {/* Scenery Objects */}
        {world.scenery.map((item) => {
          const left = `${(item.x / world.width) * 100}%`;
          const top = `${(item.y / world.height) * 100}%`;
          const width = `${(item.width / world.width) * 100}%`;
          const height = `${(item.height / world.height) * 100}%`;

          if (item.type === "house") {
            // Player's Cottage
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 flex flex-col items-center pointer-events-none"
              >
                {/* Chimney smoke */}
                <div className="absolute -top-3 right-6 text-xs animate-bounce opacity-80">
                  💨
                </div>
                {/* Cottage Roof */}
                <div className="w-full h-1/2 bg-amber-700 rounded-t-2xl border-2 border-amber-900 flex items-center justify-center relative shadow-md">
                  <div className="absolute -top-2 right-4 w-4 h-5 bg-amber-900 rounded-t-sm" />
                  <span className="text-white text-xs font-bold tracking-wider">
                    {item.label}
                  </span>
                </div>
                {/* Cottage Walls */}
                <div className="w-full h-1/2 bg-amber-100 border-2 border-t-0 border-amber-800 rounded-b-lg flex items-end justify-around px-2 pb-1 shadow-inner relative">
                  {/* Glowing Window */}
                  <div className="w-6 h-6 bg-yellow-300 border border-amber-800 rounded shadow-sm animate-pulse flex items-center justify-center text-[10px]">
                    🪟
                  </div>
                  {/* Door */}
                  <div className="w-7 h-10 bg-amber-800 border border-amber-950 rounded-t-md flex items-center justify-center">
                    <div className="w-1 h-1 bg-yellow-300 rounded-full ml-auto mr-1" />
                  </div>
                  {/* Flower pot */}
                  <div className="text-sm">🪴</div>
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
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 flex flex-col items-center pointer-events-none"
              >
                <div className="w-full h-4/5 bg-emerald-800 rounded-full border-2 border-emerald-950 shadow-md flex items-center justify-center text-xl">
                  🌲
                </div>
                <div className="w-2.5 h-1/5 bg-amber-900 rounded-sm" />
              </div>
            );
          }

          if (item.type === "bush") {
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 text-2xl flex items-center justify-center pointer-events-none"
              >
                🌳
              </div>
            );
          }

          if (item.type === "flower") {
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 text-lg flex items-center justify-center pointer-events-none"
              >
                {item.customIcon || "🌸"}
              </div>
            );
          }

          if (item.type === "sign") {
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 flex items-center justify-center pointer-events-none text-2xl"
              >
                {item.customIcon || "🪧"}
              </div>
            );
          }

          if (item.type === "deco") {
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

        {/* Portals */}
        {world.interactables
          .filter((i) => i.type === "portal")
          .map((portal) => {
            const left = `${((portal.x - 30) / world.width) * 100}%`;
            const top = `${((portal.y - 30) / world.height) * 100}%`;

            const colorClasses =
              portal.portalColor === "blue"
                ? "bg-blue-500/30 border-blue-400 shadow-blue-400/80 text-blue-200"
                : portal.portalColor === "green"
                ? "bg-emerald-500/30 border-emerald-400 shadow-emerald-400/80 text-emerald-200"
                : "bg-amber-500/30 border-amber-400 shadow-amber-400/80 text-amber-200";

            return (
              <div
                key={portal.id}
                style={{ left, top, width: "60px", height: "60px" }}
                className="absolute z-10 flex flex-col items-center justify-center pointer-events-none"
              >
                {/* Pulsing Swirl Ring */}
                <div
                  className={`w-14 h-14 rounded-full border-4 ${colorClasses} shadow-lg animate-spin flex items-center justify-center backdrop-blur-xs`}
                  style={{ animationDuration: "5s" }}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/60 animate-reverse-spin" />
                </div>
                {/* Portal Icon */}
                <div className="absolute text-xl animate-pulse">
                  {portal.portalColor === "blue"
                    ? "🌌"
                    : portal.portalColor === "green"
                    ? "🌀"
                    : "✨"}
                </div>
                {/* Label */}
                <div className="absolute -bottom-6 px-2 py-0.5 bg-black/60 rounded-md text-[10px] sm:text-xs font-black text-white whitespace-nowrap shadow-sm border border-white/20">
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
