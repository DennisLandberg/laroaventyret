"use client";

import { useState } from "react";
import { WorldId, Position } from "./game/types";
import { WORLDS } from "./game/worlds";
import type { MathMode } from "./game/mathQuestions";
import type { OrdMode } from "./game/ordlandetLevels";
import GameWorld from "./components/game/GameWorld";
import MattemagiLevel from "./components/MattemagiLevel";
import HittaOrdetLevel from "./components/HittaOrdetLevel";
import SaknadeBokstaverLevel from "./components/SaknadeBokstaverLevel";
import ByggMeningenLevel from "./components/ByggMeningenLevel";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<
    "world" | "mattemagi" | "ordmagi"
  >("world");
  const [currentWorldId, setCurrentWorldId] = useState<WorldId>("hemgarden");
  const [playerSpawnPos, setPlayerSpawnPos] = useState<Position | undefined>(undefined);
  const [stars, setStars] = useState<number>(0);
  const [coins] = useState<number>(0);
  const [ordLevel1Complete, setOrdLevel1Complete] = useState(false);
  const [ordLevel2Complete, setOrdLevel2Complete] = useState(false);
  const [ordLevel3Complete, setOrdLevel3Complete] = useState(false);
  const [mathLevel1Complete, setMathLevel1Complete] = useState(false);
  const [mathLevel2Complete, setMathLevel2Complete] = useState(false);
  const [mathLevel3Complete, setMathLevel3Complete] = useState(false);
  const [mathMode, setMathMode] = useState<MathMode>("addition");
  const [ordMode, setOrdMode] = useState<OrdMode>("hitta_ordet");

  const handleTeleport = (targetWorld: WorldId, targetSpawn?: Position) => {
    setCurrentWorldId(targetWorld);
    setPlayerSpawnPos(targetSpawn);
  };

  const handleStartMattemagi = (mode: MathMode = "addition") => {
    setMathMode(mode);
    setCurrentScreen("mattemagi");
  };

  const handleStartOrdmagi = (mode: OrdMode = "hitta_ordet") => {
    setOrdMode(mode);
    setCurrentScreen("ordmagi");
  };

  const handleBackFromMattemagi = (
    updatedStars: number,
    completedLevel: boolean
  ) => {
    setStars(updatedStars);
    if (completedLevel && mathMode === "addition") {
      setMathLevel1Complete(true);
    }
    if (completedLevel && mathMode === "subtraction") {
      setMathLevel2Complete(true);
    }
    if (completedLevel && mathMode === "mixed") {
      setMathLevel3Complete(true);
    }
    setCurrentScreen("world");
    setCurrentWorldId("mattehuset_interior");
    setPlayerSpawnPos(
      mathMode === "mixed"
        ? { x: 450, y: 310 }
        : mathMode === "subtraction"
          ? { x: 450, y: 310 }
          : mathMode === "addition" && completedLevel
            ? { x: 300, y: 310 }
            : { x: 150, y: 310 }
    );
  };

  const handleBackFromOrdmagi = (
    updatedStars: number,
    completedLevel: boolean
  ) => {
    setStars(updatedStars);
    if (completedLevel && ordMode === "hitta_ordet") {
      setOrdLevel1Complete(true);
    }
    if (completedLevel && ordMode === "saknade_bokstaver") {
      setOrdLevel2Complete(true);
    }
    if (completedLevel && ordMode === "bygg_meningen") {
      setOrdLevel3Complete(true);
    }
    setCurrentScreen("world");
    setCurrentWorldId("ordhuset_interior");
    setPlayerSpawnPos(
      ordMode === "bygg_meningen"
        ? { x: 450, y: 310 }
        : ordMode === "saknade_bokstaver"
          ? { x: 450, y: 310 }
          : ordMode === "hitta_ordet" && completedLevel
            ? { x: 300, y: 310 }
            : { x: 150, y: 310 }
    );
  };

  const activeWorld = WORLDS[currentWorldId] || WORLDS.hemgarden;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-emerald-50/60 to-emerald-100 flex flex-col justify-between p-1.5 sm:p-3">
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
            ordLevel1Complete={ordLevel1Complete}
            ordLevel2Complete={ordLevel2Complete}
            ordLevel3Complete={ordLevel3Complete}
            mathLevel1Complete={mathLevel1Complete}
            mathLevel2Complete={mathLevel2Complete}
            mathLevel3Complete={mathLevel3Complete}
            onTeleport={handleTeleport}
            onStartMattemagi={handleStartMattemagi}
            onStartOrdmagi={handleStartOrdmagi}
          />
        ) : currentScreen === "mattemagi" ? (
          <MattemagiLevel
            key={mathMode}
            mode={mathMode}
            initialStars={stars}
            onBackToMap={handleBackFromMattemagi}
          />
        ) : ordMode === "saknade_bokstaver" ? (
          <SaknadeBokstaverLevel
            initialStars={stars}
            onBackToMap={handleBackFromOrdmagi}
          />
        ) : ordMode === "bygg_meningen" ? (
          <ByggMeningenLevel
            initialStars={stars}
            onBackToMap={handleBackFromOrdmagi}
          />
        ) : (
          <HittaOrdetLevel
            initialStars={stars}
            onBackToMap={handleBackFromOrdmagi}
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
