"use client";

import { useState } from "react";
import { WorldId, Position } from "./game/types";
import { WORLDS } from "./game/worlds";
import GameWorld from "./components/game/GameWorld";
import MattemagiLevel from "./components/MattemagiLevel";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<"world" | "mattemagi">("world");
  const [currentWorldId, setCurrentWorldId] = useState<WorldId>("hemgarden");
  const [playerSpawnPos, setPlayerSpawnPos] = useState<Position | undefined>(undefined);
  const [stars, setStars] = useState<number>(0);
  const [coins] = useState<number>(0);

  const handleTeleport = (targetWorld: WorldId, targetSpawn?: Position) => {
    setCurrentWorldId(targetWorld);
    setPlayerSpawnPos(targetSpawn);
  };

  const handleStartMattemagi = () => {
    setCurrentScreen("mattemagi");
  };

  const handleBackFromMattemagi = (updatedStars: number) => {
    setStars(updatedStars);
    setCurrentScreen("world");
    // Return player INSIDE Mattehuset in front of Level 1 (Addition) station
    setCurrentWorldId("mattehuset_interior");
    setPlayerSpawnPos({ x: 150, y: 310 });
  };

  const activeWorld = WORLDS[currentWorldId] || WORLDS.hemgarden;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-emerald-50/60 to-emerald-100 flex flex-col justify-between p-3 sm:p-6">
      {/* Playful Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 opacity-30">
        <div className="absolute top-8 left-8 text-5xl sm:text-6xl animate-pulse">
          ☁️
        </div>
        <div className="absolute top-20 right-14 text-5xl sm:text-7xl animate-pulse delay-700">
          ☁️
        </div>
        <div className="absolute top-1/2 left-4 text-3xl animate-bounce">
          🎈
        </div>
        <div className="absolute top-1/3 right-8 text-4xl animate-bounce delay-500">
          ✨
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-2 sm:py-4">
        {currentScreen === "world" ? (
          <GameWorld
            key={`${currentWorldId}-${playerSpawnPos?.x ?? 0}-${playerSpawnPos?.y ?? 0}`}
            world={activeWorld}
            stars={stars}
            coins={coins}
            initialPlayerPos={playerSpawnPos}
            onTeleport={handleTeleport}
            onStartMattemagi={handleStartMattemagi}
          />
        ) : (
          <MattemagiLevel
            initialStars={stars}
            onBackToMap={handleBackFromMattemagi}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-3 text-slate-500 text-xs sm:text-sm font-medium">
        <p>🌟 Läroäventyret – Ett lekfullt toppstyrt lärandeäventyr</p>
      </footer>
    </div>
  );
}


