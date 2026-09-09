"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { WorldConfig, WorldId, Position, Direction, Interactable, PathRect, SceneryItem } from "@/app/game/types";
import Player from "./Player";
import HUD from "./HUD";

interface GameWorldProps {
  world: WorldConfig;
  stars: number;
  coins: number;
  initialPlayerPos?: Position;
  ordLevel1Complete?: boolean;
  ordLevel2Complete?: boolean;
  ordLevel3Complete?: boolean;
  mathLevel1Complete?: boolean;
  mathLevel2Complete?: boolean;
  mathLevel3Complete?: boolean;
  onTeleport: (targetWorld: WorldId, targetSpawn?: Position) => void;
  onStartMattemagi: (mode?: "addition" | "subtraction" | "mixed") => void;
  onStartOrdmagi?: (mode?: "hitta_ordet" | "saknade_bokstaver" | "bygg_meningen") => void;
}

const OAK_BASE_WIDTH = 112;
const OAK_ASPECT = 1278 / 1230;
const BLOSSOM_VISUAL_SIZE = 126;
const BLOSSOM_ASPECT = 1254 / 1254;

/** Oaks kept off-screen visually. Gameplay boxes stay unchanged. */
const HEMGARDEN_HIDDEN_OAKS = new Set([
  "tree_t3",
  "tree_l1",
  "tree_b2",
  "tree_b4",
]);

/** Visual-only oak layout. Gameplay tree boxes stay unchanged. */
const OAK_VISUAL_BY_ID: Record<
  string,
  { scale: number; offsetX: number; offsetY: number }
> = {
  tree_t1: { scale: 0.78, offsetX: -40, offsetY: -18 },
  tree_l2: { scale: 0.88, offsetX: -22, offsetY: 8 },
  tree_l3: { scale: 0.96, offsetX: -24, offsetY: 8 },
  tree_b1: { scale: 0.9, offsetX: -14, offsetY: 6 },
  tree_b3: { scale: 1.02, offsetX: 18, offsetY: 4 },
};

const PINE_ASPECT = 1278 / 1230;
const HEMGARDEN_GRASS_SRC = "/assets/hemgarden/grass_tile.png";
const HEMGARDEN_GRASS_TILE_W = 320;
const HEMGARDEN_GRASS_TILE_H = Math.round((320 * 1122) / 1402);

const MATTEHUSET_SRC = "/assets/hemgarden/mattehuset.png";
const MATTEHUSET_ASPECT = 1402 / 1122;
const MATTEHUSET_VISUAL_W = 235;
const MATTEHUSET_DOOR_X = 615;
const MATTEHUSET_DOOR_Y = 305;
const MATTEHUSET_DOOR_FRAC_Y = 0.76;
const ORDHUSET_SRC = "/assets/hemgarden/ordhuset.png";
const ORDHUSET_ASPECT = 1536 / 1024;
const ORDHUSET_VISUAL_W = 248;
const ORDHUSET_DOOR_X = 615;
const ORDHUSET_DOOR_Y = 305;
const ORDHUSET_DOOR_FRAC_X = 678 / 1536;
const ORDHUSET_DOOR_FRAC_Y = 829 / 1024;
const MATTELAND_PATH_SPINE = `M 130 302 L 498 302 C 508 330 555 345 615 345`;
const MATTELAND_PATH_Y = 302;
const MATTELAND_COBBLE_COLORS = [
  "#d7cbb4",
  "#c4b49a",
  "#b39d82",
  "#cfc0a6",
  "#a89074",
  "#e0d4bc",
];

function mattelandHash(n: number) {
  const x = Math.sin(n * 127.1 + 3.14) * 43758.5453;
  return x - Math.floor(x);
}

function mattelandBezier(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
) {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

function mattelandBezierTan(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
) {
  const u = 1 - t;
  return {
    x: 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
  };
}

type MattelandCobble = { x: number; y: number; w: number; h: number; r: number; fill: string };

const MATTELAND_CURVE_PTS = [
  { x: 498, y: 302 },
  { x: 508, y: 330 },
  { x: 555, y: 345 },
  { x: 615, y: 345 },
] as const;

function buildMattelandCobbles(): MattelandCobble[] {
  const stones: MattelandCobble[] = [];
  let i = 0;
  const add = (x: number, y: number) => {
    const h0 = mattelandHash(i);
    const h1 = mattelandHash(i + 1);
    const h2 = mattelandHash(i + 2);
    const h3 = mattelandHash(i + 3);
    i += 4;
    stones.push({
      x: x + (h0 - 0.5) * 2.4,
      y: y + (h1 - 0.5) * 1.8,
      w: 7 + h2 * 4,
      h: 5 + h3 * 2.6,
      r: 1.6,
      fill: MATTELAND_COBBLE_COLORS[Math.floor(h0 * MATTELAND_COBBLE_COLORS.length)],
    });
  };

  for (let x = 136; x < 492; x += 11) {
    const stagger = (Math.floor(x / 11) % 2) * 4;
    add(x, MATTELAND_PATH_Y - 13 + stagger * 0.05);
    add(x + 3, MATTELAND_PATH_Y - 2);
    add(x + 1, MATTELAND_PATH_Y + 9 - stagger * 0.05);
  }

  const [p0, p1, p2, p3] = MATTELAND_CURVE_PTS;
  for (let t = 0.05; t <= 1; t += 0.06) {
    const p = mattelandBezier(t, p0, p1, p2, p3);
    const tan = mattelandBezierTan(t, p0, p1, p2, p3);
    const len = Math.hypot(tan.x, tan.y) || 1;
    const nx = -tan.y / len;
    const ny = tan.x / len;
    add(p.x + nx * -10, p.y + ny * -10);
    add(p.x + nx * 1, p.y + ny * 1);
    add(p.x + nx * 11, p.y + ny * 11);
  }
  return stones;
}

function buildMattelandGrassNubs() {
  const nubs: { x: number; y: number; w: number; h: number }[] = [];
  let i = 80;
  for (let x = 142; x < 490; x += 18) {
    const h = mattelandHash(i++);
    const top = h > 0.35;
    nubs.push({
      x: x + (mattelandHash(i) - 0.5) * 6,
      y: top ? MATTELAND_PATH_Y - 24 : MATTELAND_PATH_Y + 16,
      w: 3 + mattelandHash(i + 1) * 4,
      h: 2 + mattelandHash(i + 2) * 3,
    });
    i += 3;
  }
  const [p0, p1, p2, p3] = MATTELAND_CURVE_PTS;
  for (let t = 0.12; t < 0.92; t += 0.14) {
    const p = mattelandBezier(t, p0, p1, p2, p3);
    const tan = mattelandBezierTan(t, p0, p1, p2, p3);
    const len = Math.hypot(tan.x, tan.y) || 1;
    const nx = -tan.y / len;
    const ny = tan.x / len;
    const side = mattelandHash(i++) > 0.5 ? 20 : -20;
    nubs.push({
      x: p.x + nx * side - 2,
      y: p.y + ny * side - 1,
      w: 3,
      h: 3,
    });
  }
  return nubs;
}

const MATTELAND_COBBLES = buildMattelandCobbles();
const MATTELAND_PATH_GRASS_NUBS = buildMattelandGrassNubs();

const ORDLAND_PATH_SPINE = `M 130 302 L 622 308`;
const ORDLAND_PATH_Y = 302;

function buildOrdlandCobbles(): MattelandCobble[] {
  const stones: MattelandCobble[] = [];
  let i = 0;
  const add = (x: number, y: number) => {
    const h0 = mattelandHash(i);
    const h1 = mattelandHash(i + 1);
    const h2 = mattelandHash(i + 2);
    const h3 = mattelandHash(i + 3);
    i += 4;
    stones.push({
      x: x + (h0 - 0.5) * 2.4,
      y: y + (h1 - 0.5) * 1.8,
      w: 7 + h2 * 4,
      h: 5 + h3 * 2.6,
      r: 1.6,
      fill: MATTELAND_COBBLE_COLORS[Math.floor(h0 * MATTELAND_COBBLE_COLORS.length)],
    });
  };

  for (let x = 136; x <= 618; x += 11) {
    const stagger = (Math.floor(x / 11) % 2) * 4;
    add(x, ORDLAND_PATH_Y - 13 + stagger * 0.05);
    add(x + 3, ORDLAND_PATH_Y - 2);
    add(x + 1, ORDLAND_PATH_Y + 9 - stagger * 0.05);
  }
  return stones;
}

function buildOrdlandGrassNubs() {
  const nubs: { x: number; y: number; w: number; h: number }[] = [];
  let i = 80;
  for (let x = 142; x <= 600; x += 18) {
    const h = mattelandHash(i++);
    const top = h > 0.35;
    nubs.push({
      x: x + (mattelandHash(i) - 0.5) * 6,
      y: top ? ORDLAND_PATH_Y - 24 : ORDLAND_PATH_Y + 16,
      w: 3 + mattelandHash(i + 1) * 4,
      h: 2 + mattelandHash(i + 2) * 3,
    });
    i += 3;
  }
  return nubs;
}

const ORDLAND_COBBLES = buildOrdlandCobbles();
const ORDLAND_PATH_GRASS_NUBS = buildOrdlandGrassNubs();

/** Visual-only pine trunks (bottom-center). Does not affect gameplay. */
const HEMGARDEN_PINES: { x: number; y: number; width: number }[] = [
  { x: 788, y: 28, width: 96 },
  { x: 802, y: 318, width: 104 },
];

/** Visual-only Mattelandet trees. Gameplay boxes stay unchanged. */
const MATTELAND_TREE_VISUAL: Record<
  string,
  { kind: "oak" | "pine"; scale: number; offsetX: number; offsetY: number }
> = {
  m_tree_1: { kind: "oak", scale: 0.92, offsetX: -10, offsetY: 4 },
  m_tree_2: { kind: "pine", scale: 0.88, offsetX: 6, offsetY: 2 },
  m_tree_3: { kind: "oak", scale: 0.84, offsetX: -8, offsetY: 6 },
  m_tree_4: { kind: "pine", scale: 0.9, offsetX: 12, offsetY: 0 },
  m_tree_5: { kind: "pine", scale: 0.86, offsetX: -6, offsetY: 4 },
  m_tree_6: { kind: "oak", scale: 0.9, offsetX: 8, offsetY: 6 },
  m_tree_7: { kind: "pine", scale: 0.82, offsetX: -4, offsetY: 2 },
  m_tree_8: { kind: "oak", scale: 0.94, offsetX: 10, offsetY: 4 },
};

const ORDLAND_TREE_VISUAL: Record<
  string,
  { kind: "oak" | "pine"; scale: number; offsetX: number; offsetY: number }
> = {
  o_tree_1: { kind: "oak", scale: 0.9, offsetX: -8, offsetY: 4 },
  o_tree_2: { kind: "pine", scale: 0.86, offsetX: 6, offsetY: 2 },
  o_tree_3: { kind: "oak", scale: 0.84, offsetX: -6, offsetY: 6 },
  o_tree_4: { kind: "pine", scale: 0.92, offsetX: 10, offsetY: 0 },
  o_tree_5: { kind: "pine", scale: 0.84, offsetX: -4, offsetY: 4 },
  o_tree_6: { kind: "oak", scale: 0.88, offsetX: 8, offsetY: 6 },
  o_tree_7: { kind: "pine", scale: 0.8, offsetX: -6, offsetY: 2 },
  o_tree_8: { kind: "oak", scale: 0.9, offsetX: 8, offsetY: 4 },
};

function applyMattehusetProgress(
  world: WorldConfig,
  mathLevel1Complete: boolean,
  mathLevel2Complete: boolean
): WorldConfig {
  if (world.id !== "mattehuset_interior") {
    return world;
  }
  if (!mathLevel1Complete && !mathLevel2Complete) {
    return world;
  }

  return {
    ...world,
    scenery: world.scenery.map((item) => {
      if (item.id === "station_pedestal_2" && mathLevel1Complete) {
        return { ...item, isLocked: false };
      }
      if (item.id === "station_pedestal_3" && mathLevel2Complete) {
        return { ...item, isLocked: false };
      }
      return item;
    }),
    interactables: world.interactables.map((item) => {
      if (item.id === "station_subtraction" && mathLevel1Complete) {
        return {
          ...item,
          label: "Nivå 2: Subtraktion",
          prompt: "Tryck E för att spela Subtraktion",
          action: "start_mattemagi",
          mathMode: "subtraction",
          infoMessage: undefined,
        };
      }
      if (item.id === "station_mixed" && mathLevel2Complete) {
        return {
          ...item,
          label: "Nivå 3: Blandad matte",
          prompt: "Tryck E för att spela Blandad matte",
          action: "start_mattemagi",
          mathMode: "mixed",
          infoMessage: undefined,
        };
      }
      return item;
    }),
  };
}

function applyOrdHusetProgress(
  world: WorldConfig,
  ordLevel1Complete: boolean,
  ordLevel2Complete: boolean,
  ordLevel3Complete: boolean
): WorldConfig {
  if (world.id !== "ordhuset_interior") {
    return world;
  }
  if (!ordLevel1Complete && !ordLevel2Complete && !ordLevel3Complete) {
    return world;
  }

  return {
    ...world,
    scenery: world.scenery.map((item) => {
      if (item.id === "ord_station_pedestal_2" && ordLevel1Complete) {
        return { ...item, isLocked: false };
      }
      if (item.id === "ord_station_pedestal_3" && ordLevel2Complete) {
        return { ...item, isLocked: false };
      }
      if (item.id === "word_chalkboard" && ordLevel3Complete) {
        return { ...item, label: "Ordlandet klart!" };
      }
      return item;
    }),
    interactables: world.interactables.map((item) => {
      if (item.id === "station_saknade_bokstaver" && ordLevel1Complete) {
        return {
          ...item,
          label: "Nivå 2: Saknade bokstäver",
          prompt: "Tryck E för att spela Saknade bokstäver",
          action: "start_ordmagi",
          ordMode: "saknade_bokstaver",
          infoMessage: undefined,
        };
      }
      if (item.id === "station_bygg_meningen" && ordLevel2Complete) {
        return {
          ...item,
          label: "Nivå 3: Bygg meningen",
          prompt: "Tryck E för att spela Bygg meningen",
          action: "start_ordmagi",
          ordMode: "bygg_meningen",
          infoMessage: undefined,
        };
      }
      return item;
    }),
  };
}

const BUSH_SHEET = { src: "/assets/hemgarden/bushes.png", w: 1774, h: 887 };

const BUSH_FRAMES = {
  green: { x: 14, y: 229, w: 305, h: 214 },
  blueberry: { x: 646, y: 230, w: 302, h: 213 },
  pinkFlower: { x: 965, y: 235, w: 294, h: 208 },
  tall: { x: 1269, y: 229, w: 240, h: 214 },
  smallGreen: { x: 17, y: 568, w: 177, h: 150 },
  smallBlue: { x: 411, y: 553, w: 197, h: 167 },
  star: { x: 1356, y: 572, w: 167, h: 146 },
} as const;

type BushFrameId = keyof typeof BUSH_FRAMES;

/** Visual-only bushes. Bottom-center in world pixels. No collisions. */
const HEMGARDEN_BUSHES: { x: number; y: number; width: number; frame: BushFrameId }[] = [
  { x: 248, y: 246, width: 42, frame: "blueberry" },
  { x: 82, y: 368, width: 40, frame: "tall" },
  { x: 112, y: 472, width: 46, frame: "green" },
  { x: 318, y: 428, width: 44, frame: "pinkFlower" },
  { x: 528, y: 268, width: 30, frame: "smallGreen" },
  { x: 372, y: 468, width: 28, frame: "smallBlue" },
  { x: 598, y: 112, width: 26, frame: "star" },
];

export default function GameWorld({
  world: worldProp,
  stars,
  coins,
  initialPlayerPos,
  ordLevel1Complete = false,
  ordLevel2Complete = false,
  ordLevel3Complete = false,
  mathLevel1Complete = false,
  mathLevel2Complete = false,
  mathLevel3Complete = false,
  onTeleport,
  onStartMattemagi,
  onStartOrdmagi,
}: GameWorldProps) {
  const world = useMemo(
    () =>
      applyMattehusetProgress(
        applyOrdHusetProgress(
          worldProp,
          ordLevel1Complete,
          ordLevel2Complete,
          ordLevel3Complete
        ),
        mathLevel1Complete,
        mathLevel2Complete
      ),
    [
      worldProp,
      ordLevel1Complete,
      ordLevel2Complete,
      ordLevel3Complete,
      mathLevel1Complete,
      mathLevel2Complete,
    ]
  );
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
      onStartMattemagi(item.mathMode ?? "addition");
    } else if (item.action === "start_ordmagi") {
      onStartOrdmagi?.(item.ordMode ?? "hitta_ordet");
    } else if (item.action === "teleport" && item.targetWorld) {
      onTeleport(item.targetWorld, item.targetSpawn);
    } else if (item.action === "info") {
      setInfoModal(item.infoMessage || item.prompt);
    }
  }, [onStartMattemagi, onStartOrdmagi, onTeleport]);

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

  useEffect(() => {
    checkInteractables(posRef.current.x, posRef.current.y);
  }, [checkInteractables, initialPlayerPos]);

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
        {/* World floor */}
        {world.id === "hemgarden" ||
        world.id === "mattelandet" ||
        world.id === "ordlandet" ? (
          <HemgardenGround />
        ) : world.id === "player_home" ? (
          <PlayerHomeInterior />
        ) : world.id === "ordhuset_interior" ? (
          <OrdhusetInterior />
        ) : (
          <div
            className={`absolute inset-0 ${world.groundBgClass}`}
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.09) 1.5px, transparent 1.5px), radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)`,
              backgroundSize: "20px 20px, 40px 40px",
            }}
          />
        )}

        {/* Paths */}
        {world.id === "hemgarden" ? (
          <>
            <HemgardenDirtTrail world={world} />
            {world.paths
              .filter((p) => p.type === "stone")
              .map((p, idx) => (
                <HemgardenStonePath key={`stone-${idx}`} path={p} world={world} />
              ))}
          </>
        ) : world.id === "mattelandet" ? (
          <MattelandetPaths world={world} />
        ) : world.id === "ordlandet" ? (
          <MattelandetPaths
            world={world}
            spine={ORDLAND_PATH_SPINE}
            cobbles={ORDLAND_COBBLES}
            nubs={ORDLAND_PATH_GRASS_NUBS}
          />
        ) : (
          world.paths.map((p, idx) => (
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
              {p.type === "dirt" && (
                <div className="w-full h-full opacity-25 flex items-center justify-around pointer-events-none text-[10px]">
                  <span>•</span>
                  <span>•</span>
                  <span>•</span>
                </div>
              )}
            </div>
          ))
        )}

        {world.id === "hemgarden" ? <HemgardenBushes world={world} /> : null}
        {world.id === "hemgarden" ? <HemgardenPines world={world} /> : null}

        {/* Scenery Objects */}
        {world.scenery.map((item) => {
          const left = `${(item.x / world.width) * 100}%`;
          const top = `${(item.y / world.height) * 100}%`;
          const width = `${(item.width / world.width) * 100}%`;
          const height = `${(item.height / world.height) * 100}%`;

          if (world.id === "player_home") {
            return (
              <PlayerHomeProp
                key={item.id}
                item={item}
                left={left}
                top={top}
                width={width}
                height={height}
              />
            );
          }

          if (item.type === "house") {
            // Visual-only size: PNG is 1374x1145 (aspect 1.2). Gameplay box stays 150x125.
            const visualWidth = 270;
            const visualHeight = visualWidth / (1374 / 1145);
            // Door is centered in the PNG; door mass is ~y 650 of 1145.
            const visualLeft = 195 - visualWidth * 0.5;
            const visualTop = 225 - visualHeight * (650 / 1145);
            return (
              <div
                key={item.id}
                style={{
                  left: `${(visualLeft / world.width) * 100}%`,
                  top: `${(visualTop / world.height) * 100}%`,
                  width: `${(visualWidth / world.width) * 100}%`,
                  height: `${(visualHeight / world.height) * 100}%`,
                }}
                className="absolute z-10 pointer-events-none"
              >
                <Image
                  src="/assets/hemgarden/cottage.png"
                  alt={item.label || "Ditt Hus"}
                  fill
                  unoptimized
                  sizes="270px"
                  draggable={false}
                  className="object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
            );
          }

          if (item.type === "word_house") {
            const visualWidth = ORDHUSET_VISUAL_W;
            const visualHeight = visualWidth / ORDHUSET_ASPECT;
            const visualLeft =
              ORDHUSET_DOOR_X - visualWidth * ORDHUSET_DOOR_FRAC_X;
            const visualTop =
              ORDHUSET_DOOR_Y - visualHeight * ORDHUSET_DOOR_FRAC_Y;
            return (
              <div
                key={item.id}
                style={{
                  left: `${(visualLeft / world.width) * 100}%`,
                  top: `${(visualTop / world.height) * 100}%`,
                  width: `${(visualWidth / world.width) * 100}%`,
                  height: `${(visualHeight / world.height) * 100}%`,
                }}
                className="absolute z-10 pointer-events-none bg-transparent"
              >
                <Image
                  src={ORDHUSET_SRC}
                  alt={item.label || "Ordhuset"}
                  fill
                  unoptimized
                  sizes="248px"
                  draggable={false}
                  className="object-contain bg-transparent"
                  style={{ backgroundColor: "transparent" }}
                />
              </div>
            );
          }

          if (item.type === "math_house") {
            const visualWidth = MATTEHUSET_VISUAL_W;
            const visualHeight = visualWidth / MATTEHUSET_ASPECT;
            const visualLeft = MATTEHUSET_DOOR_X - visualWidth * 0.5;
            const visualTop =
              MATTEHUSET_DOOR_Y - visualHeight * MATTEHUSET_DOOR_FRAC_Y;
            return (
              <div
                key={item.id}
                style={{
                  left: `${(visualLeft / world.width) * 100}%`,
                  top: `${(visualTop / world.height) * 100}%`,
                  width: `${(visualWidth / world.width) * 100}%`,
                  height: `${(visualHeight / world.height) * 100}%`,
                }}
                className="absolute z-10 pointer-events-none bg-transparent"
              >
                <Image
                  src={MATTEHUSET_SRC}
                  alt={item.label || "Mattehuset"}
                  fill
                  unoptimized
                  sizes="235px"
                  draggable={false}
                  className="object-contain bg-transparent"
                  style={{ imageRendering: "pixelated", backgroundColor: "transparent" }}
                />
              </div>
            );
          }

          if (item.type === "tree") {
            const isBlossom = item.color === "pink";
            const pngTreeVisual =
              world.id === "mattelandet"
                ? MATTELAND_TREE_VISUAL[item.id]
                : world.id === "ordlandet"
                  ? ORDLAND_TREE_VISUAL[item.id]
                  : undefined;
            if (pngTreeVisual) {
              const aspect =
                pngTreeVisual.kind === "pine" ? PINE_ASPECT : OAK_ASPECT;
              const visualWidth = OAK_BASE_WIDTH * pngTreeVisual.scale;
              const visualHeight = visualWidth / aspect;
              const visualLeft =
                item.x +
                item.width / 2 -
                visualWidth / 2 +
                pngTreeVisual.offsetX;
              const visualTop =
                item.y +
                item.height -
                visualHeight +
                pngTreeVisual.offsetY;
              return (
                <div
                  key={item.id}
                  style={{
                    left: `${(visualLeft / world.width) * 100}%`,
                    top: `${(visualTop / world.height) * 100}%`,
                    width: `${(visualWidth / world.width) * 100}%`,
                    height: `${(visualHeight / world.height) * 100}%`,
                  }}
                  className="absolute z-10 pointer-events-none"
                >
                  <Image
                    src={
                      pngTreeVisual.kind === "pine"
                        ? "/assets/hemgarden/tree.pine.png"
                        : "/assets/hemgarden/tree_oak.png"
                    }
                    alt={pngTreeVisual.kind === "pine" ? "Tall" : "Ek"}
                    fill
                    unoptimized
                    sizes="130px"
                    draggable={false}
                    className="object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              );
            }
            const useOakPng = world.id === "hemgarden" && !isBlossom;
            const useBlossomPng = world.id === "hemgarden" && isBlossom;
            if (useBlossomPng) {
              const visualWidth = BLOSSOM_VISUAL_SIZE;
              const visualHeight = visualWidth / BLOSSOM_ASPECT;
              const visualLeft = item.x + item.width / 2 - visualWidth / 2;
              const visualTop = item.y + item.height - visualHeight;
              return (
                <div
                  key={item.id}
                  style={{
                    left: `${(visualLeft / world.width) * 100}%`,
                    top: `${(visualTop / world.height) * 100}%`,
                    width: `${(visualWidth / world.width) * 100}%`,
                    height: `${(visualHeight / world.height) * 100}%`,
                  }}
                  className="absolute z-10 pointer-events-none"
                >
                  <Image
                    src="/assets/hemgarden/tree_blossom.png"
                    alt={item.label || "Körsbärsträd"}
                    fill
                    unoptimized
                    sizes="126px"
                    draggable={false}
                    className="object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              );
            }
            if (useOakPng) {
              if (HEMGARDEN_HIDDEN_OAKS.has(item.id)) {
                return null;
              }
              const visual = OAK_VISUAL_BY_ID[item.id] ?? {
                scale: 1,
                offsetX: 0,
                offsetY: 0,
              };
              const visualWidth = OAK_BASE_WIDTH * visual.scale;
              const visualHeight = visualWidth / OAK_ASPECT;
              const visualLeft =
                item.x + item.width / 2 - visualWidth / 2 + visual.offsetX;
              const visualTop =
                item.y + item.height - visualHeight + visual.offsetY;
              return (
                <div
                  key={item.id}
                  style={{
                    left: `${(visualLeft / world.width) * 100}%`,
                    top: `${(visualTop / world.height) * 100}%`,
                    width: `${(visualWidth / world.width) * 100}%`,
                    height: `${(visualHeight / world.height) * 100}%`,
                  }}
                  className="absolute z-10 pointer-events-none"
                >
                  <Image
                    src="/assets/hemgarden/tree_oak.png"
                    alt="Ek"
                    fill
                    unoptimized
                    sizes="130px"
                    draggable={false}
                    className="object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              );
            }
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
            if (world.id === "hemgarden") {
              return null;
            }
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
            const isWordHall = world.id === "ordhuset_interior";
            return (
              <div
                key={item.id}
                style={{ left, top, width, height }}
                className="absolute z-10 bg-emerald-950 border-4 border-amber-900 rounded-md shadow-lg p-1.5 flex flex-col justify-between pointer-events-none"
              >
                <div className="flex justify-between items-center text-yellow-200 text-xs font-mono font-bold px-2">
                  {isWordHall ? (
                    <>
                      <span>Aa Bb Cc</span>
                      <span>📖 ✨</span>
                    </>
                  ) : (
                    <>
                      <span>✨ 1 + 2 = 3</span>
                      <span>2 + 2 = 4 ✨</span>
                    </>
                  )}
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
                  {item.isLocked
                    ? "🔒"
                    : (item.id === "ord_station_pedestal_1" && ordLevel1Complete) ||
                        (item.id === "ord_station_pedestal_2" && ordLevel2Complete) ||
                        (item.id === "ord_station_pedestal_3" && ordLevel3Complete) ||
                        (item.id === "station_pedestal_1" && mathLevel1Complete) ||
                        (item.id === "station_pedestal_2" && mathLevel2Complete) ||
                        (item.id === "station_pedestal_3" && mathLevel3Complete)
                      ? "⭐"
                      : "📖"}
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
          .map((portal) =>
            world.id === "hemgarden" ? (
              <HemgardenPortalVisual
                key={portal.id}
                portal={portal}
                world={world}
              />
            ) : (
              <LegacyPortalVisual
                key={portal.id}
                portal={portal}
                world={world}
              />
            )
          )}

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

function LegacyPortalVisual({
  portal,
  world,
}: {
  portal: Interactable;
  world: WorldConfig;
}) {
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
      style={{ left, top, width: "72px", height: "72px" }}
      className="absolute z-10 flex flex-col items-center justify-center pointer-events-none select-none filter drop-shadow-lg"
    >
      <div className="absolute inset-0 rounded-full border-4 border-stone-600/90 bg-stone-800/40 pointer-events-none" />
      <div
        className={`w-14 h-14 rounded-full border-4 ${ringClasses} shadow-xl animate-spin flex items-center justify-center backdrop-blur-xs`}
        style={{ animationDuration: "6s" }}
      >
        <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/70" />
      </div>
      <div className="absolute text-xl animate-pulse drop-shadow">
        {isBlue ? "🌌" : isGreen ? "🍃" : "✨"}
      </div>
      <div className="absolute -bottom-6 px-2.5 py-0.5 bg-amber-950/90 rounded-md text-[10px] sm:text-xs font-black text-amber-200 whitespace-nowrap shadow-md border border-amber-700">
        {portal.label}
      </div>
    </div>
  );
}

const PORTAL_STONE_BLOCKS: { x: number; y: number; tone: "lit" | "mid" | "shade" }[] = [
  { x: 32, y: 4, tone: "lit" },
  { x: 42, y: 6, tone: "lit" },
  { x: 50, y: 12, tone: "lit" },
  { x: 56, y: 20, tone: "mid" },
  { x: 58, y: 30, tone: "mid" },
  { x: 56, y: 40, tone: "shade" },
  { x: 50, y: 50, tone: "shade" },
  { x: 42, y: 56, tone: "shade" },
  { x: 32, y: 58, tone: "shade" },
  { x: 22, y: 56, tone: "shade" },
  { x: 14, y: 50, tone: "mid" },
  { x: 8, y: 40, tone: "mid" },
  { x: 6, y: 30, tone: "mid" },
  { x: 8, y: 20, tone: "lit" },
  { x: 14, y: 12, tone: "lit" },
  { x: 22, y: 6, tone: "lit" },
];

const PORTAL_SPARKS: { x: number; y: number; delay: string }[] = [
  { x: 6, y: 10, delay: "0s" },
  { x: 62, y: 16, delay: "1.1s" },
  { x: 68, y: 40, delay: "0.4s" },
  { x: 58, y: 64, delay: "1.8s" },
  { x: 8, y: 58, delay: "2.4s" },
  { x: 0, y: 32, delay: "0.8s" },
];

function HemgardenPortalVisual({
  portal,
  world,
}: {
  portal: Interactable;
  world: WorldConfig;
}) {
  const left = `${((portal.x - 36) / world.width) * 100}%`;
  const top = `${((portal.y - 36) / world.height) * 100}%`;
  const isBlue = portal.portalColor === "blue";
  const gid = portal.id;
  const glow = isBlue ? "rgba(56, 189, 248, 0.42)" : "rgba(52, 211, 153, 0.42)";
  const energyDeep = isBlue ? "#0369a1" : "#047857";
  const energyMid = isBlue ? "#0ea5e9" : "#10b981";
  const energyBright = isBlue ? "#7dd3fc" : "#6ee7b7";
  const energyCore = isBlue ? "#e0f2fe" : "#ecfdf5";
  const spark = isBlue ? "#bae6fd" : "#a7f3d0";

  return (
    <div
      style={{ left, top, width: "72px", height: "72px" }}
      className="absolute z-10 pointer-events-none select-none"
    >
      <div
        className="absolute -inset-2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          animation: "hemgarden-portal-pulse 3.6s ease-in-out infinite",
        }}
      />

      <svg
        className="absolute inset-0"
        viewBox="0 0 72 72"
        aria-hidden
        style={{ imageRendering: "pixelated", overflow: "visible" }}
      >
        <defs>
          <radialGradient id={`${gid}-energy`} cx="46%" cy="40%" r="58%">
            <stop offset="0%" stopColor={energyCore} />
            <stop offset="28%" stopColor={energyBright} />
            <stop offset="62%" stopColor={energyMid} />
            <stop offset="100%" stopColor={energyDeep} />
          </radialGradient>
          <clipPath id={`${gid}-well`}>
            <circle cx="36" cy="36" r="21" />
          </clipPath>
        </defs>

        {PORTAL_STONE_BLOCKS.map((b, i) => (
          <rect
            key={`stone-${i}`}
            x={b.x}
            y={b.y}
            width="8"
            height="8"
            fill={
              b.tone === "lit" ? "#c4b8a4" : b.tone === "shade" ? "#3f3a34" : "#7a7268"
            }
          />
        ))}
        <rect x="28" y="2" width="4" height="4" fill="#ddd4c4" />
        <rect x="48" y="10" width="3" height="3" fill="#a89f90" />
        <rect x="60" y="34" width="3" height="4" fill="#2a2622" />
        <rect x="34" y="62" width="5" height="3" fill="#2a2622" />
        <rect x="10" y="48" width="3" height="3" fill="#5c564e" />
        <rect x="12" y="16" width="3" height="3" fill="#ddd4c4" />

        <circle cx="36" cy="36" r="22" fill="#1a1814" />
        <circle cx="36" cy="36" r="21" fill={`url(#${gid}-energy)`} />

        <g clipPath={`url(#${gid}-well)`}>
          <g
            style={{
              transformOrigin: "36px 36px",
              animation: "hemgarden-portal-spin 18s linear infinite",
            }}
          >
            <ellipse
              cx="36"
              cy="36"
              rx="18"
              ry="8"
              fill="none"
              stroke={energyBright}
              strokeWidth="2"
              opacity="0.55"
            />
            <ellipse
              cx="36"
              cy="36"
              rx="8"
              ry="17"
              fill="none"
              stroke={energyMid}
              strokeWidth="2"
              opacity="0.5"
            />
            <path
              d="M36 18 C48 22 54 30 54 36 C54 48 44 54 36 54 C24 54 18 44 18 36"
              fill="none"
              stroke={energyCore}
              strokeWidth="1.5"
              opacity="0.45"
            />
          </g>
          <g
            style={{
              transformOrigin: "36px 36px",
              animation: "hemgarden-portal-spin-rev 26s linear infinite",
            }}
          >
            <ellipse
              cx="36"
              cy="36"
              rx="14"
              ry="6"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
              opacity="0.35"
            />
            <circle
              cx="36"
              cy="36"
              r="12"
              fill="none"
              stroke={energyBright}
              strokeWidth="1"
              strokeDasharray="3 5"
              opacity="0.7"
            />
          </g>
          <circle
            cx="36"
            cy="34"
            r="6"
            fill={energyCore}
            style={{
              transformOrigin: "36px 34px",
              animation: "hemgarden-portal-core 2.8s ease-in-out infinite",
            }}
          />
        </g>

        <circle cx="36" cy="36" r="21.5" fill="none" stroke="#2a2622" strokeWidth="2" />
        <circle cx="36" cy="36" r="23.5" fill="none" stroke="#8a8278" strokeWidth="1" />
      </svg>

      {PORTAL_SPARKS.map((s, i) => (
        <div
          key={`spark-${i}`}
          className="absolute"
          style={{
            left: s.x,
            top: s.y,
            width: 3,
            height: 3,
            backgroundColor: spark,
            imageRendering: "pixelated",
            animation: `hemgarden-portal-spark ${2.8 + i * 0.25}s ease-in-out infinite`,
            animationDelay: s.delay,
          }}
        />
      ))}

      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-amber-950/90 rounded-md text-[10px] sm:text-xs font-black text-amber-200 whitespace-nowrap shadow-md border border-amber-700">
        {portal.label}
      </div>
    </div>
  );
}

function HemgardenBushes({ world }: { world: WorldConfig }) {
  return (
    <>
      {HEMGARDEN_BUSHES.map((bush, i) => {
        const frame = BUSH_FRAMES[bush.frame];
        const visualWidth = bush.width;
        const visualHeight = visualWidth * (frame.h / frame.w);
        const visualLeft = bush.x - visualWidth / 2;
        const visualTop = bush.y - visualHeight;
        return (
          <div
            key={`bush-${i}`}
            className="absolute z-[8] pointer-events-none"
            style={{
              left: `${(visualLeft / world.width) * 100}%`,
              top: `${(visualTop / world.height) * 100}%`,
              width: `${(visualWidth / world.width) * 100}%`,
              height: `${(visualHeight / world.height) * 100}%`,
              backgroundImage: `url(${BUSH_SHEET.src})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${(BUSH_SHEET.w / frame.w) * 100}% ${(BUSH_SHEET.h / frame.h) * 100}%`,
              backgroundPosition: `${(frame.x / (BUSH_SHEET.w - frame.w)) * 100}% ${(frame.y / (BUSH_SHEET.h - frame.h)) * 100}%`,
              imageRendering: "pixelated",
              mixBlendMode: "multiply",
            }}
            aria-hidden
          />
        );
      })}
    </>
  );
}

function HemgardenPines({ world }: { world: WorldConfig }) {
  return (
    <>
      {HEMGARDEN_PINES.map((pine, i) => {
        const visualWidth = pine.width;
        const visualHeight = visualWidth / PINE_ASPECT;
        const visualLeft = pine.x - visualWidth / 2;
        const visualTop = pine.y - visualHeight;
        return (
          <div
            key={`pine-${i}`}
            className="absolute z-[9] pointer-events-none"
            style={{
              left: `${(visualLeft / world.width) * 100}%`,
              top: `${(visualTop / world.height) * 100}%`,
              width: `${(visualWidth / world.width) * 100}%`,
              height: `${(visualHeight / world.height) * 100}%`,
            }}
          >
            <Image
              src="/assets/hemgarden/tree.pine.png"
              alt="Tall"
              fill
              unoptimized
              sizes="120px"
              draggable={false}
              className="object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        );
      })}
    </>
  );
}

function HemgardenGround() {
  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        backgroundColor: "#3d8a42",
        backgroundImage: `url(${HEMGARDEN_GRASS_SRC})`,
        backgroundRepeat: "repeat",
        backgroundSize: `${HEMGARDEN_GRASS_TILE_W}px ${HEMGARDEN_GRASS_TILE_H}px`,
        imageRendering: "pixelated",
      }}
    />
  );
}

function HemgardenDirtTrail({ world }: { world: WorldConfig }) {
  const houseToCross =
    "M 197 226 C 204 258 190 298 197 332 C 290 340 470 324 575 332";
  const gardenSpur = "M 418 248 C 411 278 425 308 418 332";
  const portalSpine =
    "M 572 180 C 564 230 580 290 572 332 C 564 378 580 422 572 450";

  const dirtOut = [
    { x: 174, y: 238, w: 5, h: 4 },
    { x: 216, y: 258, w: 4, h: 6 },
    { x: 172, y: 286, w: 6, h: 4 },
    { x: 214, y: 312, w: 5, h: 5 },
    { x: 226, y: 348, w: 7, h: 4 },
    { x: 268, y: 308, w: 5, h: 5 },
    { x: 312, y: 350, w: 6, h: 4 },
    { x: 358, y: 308, w: 5, h: 5 },
    { x: 402, y: 350, w: 5, h: 4 },
    { x: 396, y: 238, w: 5, h: 5 },
    { x: 434, y: 266, w: 4, h: 6 },
    { x: 398, y: 294, w: 5, h: 4 },
    { x: 452, y: 308, w: 6, h: 5 },
    { x: 498, y: 350, w: 5, h: 4 },
    { x: 538, y: 308, w: 5, h: 5 },
    { x: 548, y: 186, w: 5, h: 5 },
    { x: 592, y: 214, w: 4, h: 6 },
    { x: 548, y: 256, w: 5, h: 4 },
    { x: 594, y: 292, w: 5, h: 5 },
    { x: 548, y: 348, w: 6, h: 4 },
    { x: 594, y: 382, w: 4, h: 5 },
    { x: 548, y: 418, w: 5, h: 5 },
    { x: 590, y: 438, w: 5, h: 4 },
  ];

  const grassIn = [
    { x: 186, y: 244, w: 3, h: 3 },
    { x: 204, y: 274, w: 3, h: 2 },
    { x: 184, y: 304, w: 4, h: 3 },
    { x: 248, y: 338, w: 3, h: 3 },
    { x: 300, y: 318, w: 4, h: 2 },
    { x: 372, y: 340, w: 3, h: 3 },
    { x: 430, y: 318, w: 3, h: 2 },
    { x: 480, y: 338, w: 4, h: 3 },
    { x: 408, y: 258, w: 3, h: 3 },
    { x: 422, y: 288, w: 3, h: 2 },
    { x: 560, y: 198, w: 3, h: 3 },
    { x: 578, y: 236, w: 3, h: 2 },
    { x: 560, y: 278, w: 4, h: 3 },
    { x: 578, y: 356, w: 3, h: 3 },
    { x: 560, y: 400, w: 3, h: 2 },
    { x: 576, y: 430, w: 4, h: 3 },
  ];

  const stones = [
    { x: 188, y: 252, w: 3, h: 2 },
    { x: 206, y: 292, w: 2, h: 2 },
    { x: 192, y: 324, w: 3, h: 2 },
    { x: 244, y: 328, w: 4, h: 2 },
    { x: 286, y: 338, w: 2, h: 2 },
    { x: 334, y: 322, w: 3, h: 2 },
    { x: 378, y: 336, w: 2, h: 2 },
    { x: 428, y: 326, w: 3, h: 2 },
    { x: 476, y: 338, w: 2, h: 2 },
    { x: 522, y: 324, w: 3, h: 2 },
    { x: 410, y: 262, w: 2, h: 2 },
    { x: 424, y: 296, w: 3, h: 2 },
    { x: 564, y: 196, w: 3, h: 2 },
    { x: 580, y: 228, w: 2, h: 2 },
    { x: 562, y: 268, w: 3, h: 2 },
    { x: 578, y: 308, w: 2, h: 2 },
    { x: 562, y: 362, w: 3, h: 2 },
    { x: 580, y: 404, w: 2, h: 2 },
    { x: 566, y: 436, w: 3, h: 2 },
  ];

  return (
    <svg
      className="absolute inset-0 z-[2] pointer-events-none"
      viewBox={`0 0 ${world.width} ${world.height}`}
      preserveAspectRatio="none"
      aria-hidden
      style={{ imageRendering: "pixelated" }}
    >
      <defs>
        <pattern
          id="hemgarden-path-fill"
          patternUnits="userSpaceOnUse"
          width="64"
          height="48"
        >
          <rect width="64" height="48" fill="#d6b484" />
          <rect x="3" y="6" width="8" height="4" fill="#c49a5c" />
          <rect x="22" y="2" width="6" height="3" fill="#e8d4a8" />
          <rect x="40" y="10" width="9" height="4" fill="#c49a5c" />
          <rect x="8" y="20" width="7" height="3" fill="#e8d4a8" />
          <rect x="28" y="18" width="10" height="5" fill="#b5894e" />
          <rect x="50" y="22" width="6" height="3" fill="#e8d4a8" />
          <rect x="14" y="32" width="8" height="4" fill="#c49a5c" />
          <rect x="36" y="34" width="7" height="3" fill="#e8d4a8" />
          <rect x="52" y="38" width="8" height="4" fill="#b5894e" />
          <rect x="2" y="40" width="5" height="3" fill="#c49a5c" />
          <rect x="18" y="12" width="2" height="2" fill="#8d8880" />
          <rect x="18" y="11" width="1" height="1" fill="#d8d4cc" />
          <rect x="44" y="28" width="3" height="2" fill="#7a746c" />
          <rect x="44" y="27" width="2" height="1" fill="#cfc9c0" />
          <rect x="58" y="8" width="2" height="2" fill="#8d8880" />
          <rect x="6" y="28" width="2" height="2" fill="#6f6a64" />
          <rect x="32" y="42" width="3" height="2" fill="#8d8880" />
          <rect x="32" y="41" width="2" height="1" fill="#d8d4cc" />
        </pattern>
        <mask
          id="hemgarden-path-mask"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={world.width}
          height={world.height}
        >
          <rect width={world.width} height={world.height} fill="black" />
          <g
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={houseToCross} strokeWidth="46" />
            <path d={gardenSpur} strokeWidth="36" />
            <path d={portalSpine} strokeWidth="44" />
          </g>
          <circle cx="197" cy="226" r="16" fill="white" />
          <circle cx="418" cy="248" r="14" fill="white" />
          <circle cx="572" cy="180" r="16" fill="white" />
          <circle cx="572" cy="450" r="16" fill="white" />
          <circle cx="197" cy="332" r="22" fill="white" />
          <circle cx="418" cy="332" r="20" fill="white" />
          <circle cx="572" cy="332" r="24" fill="white" />
          {dirtOut.map((j, i) => (
            <rect
              key={`out-${i}`}
              x={j.x}
              y={j.y}
              width={j.w}
              height={j.h}
              fill="white"
            />
          ))}
          {grassIn.map((j, i) => (
            <rect
              key={`in-${i}`}
              x={j.x}
              y={j.y}
              width={j.w}
              height={j.h}
              fill="black"
            />
          ))}
        </mask>
      </defs>
      <rect
        width={world.width}
        height={world.height}
        fill="url(#hemgarden-path-fill)"
        mask="url(#hemgarden-path-mask)"
      />
      {stones.map((s, i) => (
        <g key={`st-${i}`} mask="url(#hemgarden-path-mask)">
          <rect x={s.x} y={s.y + 1} width={s.w} height={s.h} fill="#5c5852" />
          <rect x={s.x} y={s.y} width={s.w} height={s.h} fill="#9a958c" />
          <rect
            x={s.x}
            y={s.y}
            width={Math.max(1, s.w - 1)}
            height="1"
            fill="#d8d4cc"
          />
        </g>
      ))}
    </svg>
  );
}

function HemgardenStonePath({
  path,
  world,
}: {
  path: PathRect;
  world: WorldConfig;
}) {
  return (
    <div
      className="absolute z-[2] pointer-events-none"
      style={{
        left: `${(path.x / world.width) * 100}%`,
        top: `${(path.y / world.height) * 100}%`,
        width: `${(path.width / world.width) * 100}%`,
        height: `${(path.height / world.height) * 100}%`,
        borderRadius: 4,
        backgroundColor: "#9aa4ae",
        backgroundImage:
          "repeating-linear-gradient(90deg, rgba(70,74,82,0.2) 0 5px, transparent 5px 12px)",
        imageRendering: "pixelated",
      }}
    />
  );
}

function MattelandetPaths({
  world,
  spine = MATTELAND_PATH_SPINE,
  cobbles = MATTELAND_COBBLES,
  nubs = MATTELAND_PATH_GRASS_NUBS,
}: {
  world: WorldConfig;
  spine?: string;
  cobbles?: MattelandCobble[];
  nubs?: { x: number; y: number; w: number; h: number }[];
}) {
  return (
    <svg
      className="absolute inset-0 z-[2] pointer-events-none"
      viewBox={`0 0 ${world.width} ${world.height}`}
      preserveAspectRatio="none"
      aria-hidden
      style={{ imageRendering: "pixelated" }}
    >
      <path
        d={spine}
        fill="none"
        stroke="#5c5348"
        strokeWidth="46"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={spine}
        fill="none"
        stroke="#8a7c6a"
        strokeWidth="38"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {cobbles.map((s, i) => (
        <rect
          key={`cobble-${i}`}
          x={s.x}
          y={s.y}
          width={s.w}
          height={s.h}
          rx={s.r}
          ry={s.r}
          fill={s.fill}
        />
      ))}
      {nubs.map((n, i) => (
        <rect
          key={`nub-${i}`}
          x={n.x}
          y={n.y}
          width={n.w}
          height={n.h}
          rx={1}
          fill="#3d8a42"
        />
      ))}
    </svg>
  );
}

function OrdhusetInterior() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#6b4428",
          backgroundImage:
            "repeating-linear-gradient(90deg, #7a5230 0 28px, #6b4428 28px 30px, #8a5c38 30px 56px, #6b4428 56px 58px)",
          imageRendering: "pixelated",
        }}
      />
      <div
        className="absolute left-0 right-0 top-0"
        style={{
          height: "16%",
          background: "linear-gradient(#3d2414, #5c3a22)",
          boxShadow: "inset 0 -3px 0 #2a1810",
        }}
      />
    </div>
  );
}

function PlayerHomeInterior() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: "#b07a45",
          backgroundImage:
            "repeating-linear-gradient(180deg, #c08952 0 7px, #a86c38 7px 8px, #b57c48 8px 15px, #9a6232 15px 16px)",
          imageRendering: "pixelated",
        }}
      />
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 48% 42% at 72% 18%, rgba(255,170,70,0.28), transparent 62%), radial-gradient(ellipse 40% 36% at 50% 8%, rgba(255,236,190,0.22), transparent 70%), radial-gradient(ellipse 55% 50% at 50% 58%, rgba(80,40,16,0.12), transparent 72%)",
        }}
      />
      <div
        className="absolute left-0 right-0 top-0 z-[3]"
        style={{
          height: "12.4%",
          background:
            "linear-gradient(#6a4428 0 10%, #efe3c8 10% 78%, #5c3a22 78% 88%, #8a5a34 88% 100%)",
          boxShadow: "inset 0 -3px 0 #3d2414",
          imageRendering: "pixelated",
        }}
      />
      <div
        className="absolute left-0 top-0 bottom-0 z-[3]"
        style={{
          width: "3.6%",
          background:
            "linear-gradient(90deg, #4a2e1a 0 28%, #7a4e2e 28% 72%, #5c3a22 72%)",
          imageRendering: "pixelated",
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 z-[3]"
        style={{
          width: "3.6%",
          background:
            "linear-gradient(90deg, #5c3a22 0 28%, #7a4e2e 28% 72%, #4a2e1a 72%)",
          imageRendering: "pixelated",
        }}
      />
      <div
        className="absolute left-0 bottom-0 z-[3]"
        style={{
          width: "41%",
          height: "7.2%",
          background:
            "linear-gradient(#8a5a34 0 18%, #5c3a22 18% 38%, #7a4e2e 38%)",
          imageRendering: "pixelated",
        }}
      />
      <div
        className="absolute right-0 bottom-0 z-[3]"
        style={{
          width: "41%",
          height: "7.2%",
          background:
            "linear-gradient(#8a5a34 0 18%, #5c3a22 18% 38%, #7a4e2e 38%)",
          imageRendering: "pixelated",
        }}
      />
      <div
        className="absolute z-[3]"
        style={{
          left: "41%",
          width: "18%",
          bottom: 0,
          height: "4.4%",
          background: "#4e311c",
          boxShadow: "inset 0 3px 0 #2e1a10",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}

function PlayerHomeProp({
  item,
  left,
  top,
  width,
  height,
}: {
  item: SceneryItem;
  left: string;
  top: string;
  width: string;
  height: string;
}) {
  const box = { left, top, width, height, imageRendering: "pixelated" as const };

  if (item.type === "bed") {
    return (
      <div className="absolute z-10 pointer-events-none" style={box}>
        <div className="absolute inset-0" style={{ background: "#6b3e22", border: "3px solid #3a2112" }} />
        <div className="absolute left-[8%] right-[8%] top-0 h-[20%]" style={{ background: "#563218" }} />
        <div
          className="absolute left-[16%] top-[16%] h-[18%] w-[68%]"
          style={{ background: "#f3eadc", border: "2px solid #d8ccb8" }}
        />
        <div className="absolute bottom-[8%] left-[8%] right-[8%] top-[34%]" style={{ background: "#c45b45" }} />
        <div className="absolute left-[8%] right-[8%] top-[34%] h-[12%]" style={{ background: "#efe4d2" }} />
        <div className="absolute bottom-0 left-[6%] right-[6%] h-[8%]" style={{ background: "#4a2c16" }} />
      </div>
    );
  }

  if (item.type === "fireplace") {
    return (
      <div className="absolute z-10 pointer-events-none overflow-hidden" style={box}>
        <div className="absolute inset-0" style={{ background: "#6d6a66", border: "3px solid #3a3734" }} />
        <div className="absolute left-[6%] right-[6%] top-0 h-[22%]" style={{ background: "#6b4326" }} />
        <div className="absolute left-[10%] top-[8%] h-[10%] w-[10%]" style={{ background: "#d8c4a0" }} />
        <div className="absolute right-[12%] top-[6%] h-[12%] w-[8%]" style={{ background: "#f4e0a8" }} />
        <div
          className="absolute left-[18%] right-[18%] top-[30%] bottom-[10%]"
          style={{ background: "#1a120e", border: "2px solid #2e2824" }}
        />
        <div
          className="absolute bottom-[14%] left-1/2 h-[48%] w-[34%] origin-bottom"
          style={{
            background: "linear-gradient(to top, #e85a18, #ffb347 55%, #ffe08a)",
            clipPath: "polygon(50% 0, 82% 38%, 70% 100%, 30% 100%, 18% 38%)",
            animation: "cottage-fire 0.55s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-[14%] left-[42%] h-[36%] w-[22%] origin-bottom"
          style={{
            background: "linear-gradient(to top, #ff7a20, #ffd36a)",
            clipPath: "polygon(50% 0, 88% 100%, 12% 100%)",
            animation: "cottage-fire 0.4s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 40% 36% at 50% 62%, rgba(255,140,40,0.45), transparent 70%)",
            animation: "cottage-glow 1.4s ease-in-out infinite",
          }}
        />
      </div>
    );
  }

  if (item.type === "table") {
    return (
      <div className="absolute z-10 pointer-events-none" style={box}>
        <div className="absolute inset-0" style={{ background: "#8b5a32", border: "3px solid #4a2e18" }} />
        <div className="absolute left-[12%] right-[12%] top-[42%] h-[10%]" style={{ background: "#6a4022" }} />
        <div
          className="absolute left-[18%] top-[10%] h-[28%] w-[28%]"
          style={{ background: "#f0d48a", border: "2px solid #c9a24e", borderRadius: 2 }}
        />
        <div className="absolute right-[16%] top-[14%] h-[22%] w-[22%]" style={{ background: "#3f8a46", borderRadius: 4 }} />
      </div>
    );
  }

  if (item.type === "bookshelf") {
    return (
      <div className="absolute z-10 pointer-events-none overflow-hidden" style={box}>
        <div className="absolute inset-0" style={{ background: "#6d4024", border: "3px solid #3b2212" }} />
        <div className="absolute left-[10%] right-[10%] top-[8%] h-[24%]" style={{ background: "#4a2a14" }} />
        <div className="absolute left-[12%] top-[12%] h-[16%] w-[14%]" style={{ background: "#b33a32" }} />
        <div className="absolute left-[30%] top-[12%] h-[16%] w-[12%]" style={{ background: "#2f6e48" }} />
        <div className="absolute left-[46%] top-[12%] h-[16%] w-[16%]" style={{ background: "#355f9a" }} />
        <div className="absolute left-[66%] top-[12%] h-[16%] w-[12%]" style={{ background: "#c47a28" }} />
        <div className="absolute left-[10%] right-[10%] top-[38%] h-[24%]" style={{ background: "#4a2a14" }} />
        <div className="absolute left-[12%] top-[42%] h-[16%] w-[16%]" style={{ background: "#7a3ea0" }} />
        <div className="absolute left-[32%] top-[42%] h-[16%] w-[12%]" style={{ background: "#c44a3a" }} />
        <div className="absolute left-[48%] top-[42%] h-[16%] w-[14%]" style={{ background: "#2f7a6a" }} />
        <div className="absolute left-[66%] top-[42%] h-[16%] w-[16%]" style={{ background: "#d8c48a" }} />
        <div className="absolute left-[10%] right-[10%] top-[68%] h-[22%]" style={{ background: "#4a2a14" }} />
        <div className="absolute left-[14%] top-[72%] h-[14%] w-[18%]" style={{ background: "#3a6fb0" }} />
        <div className="absolute left-[36%] top-[72%] h-[14%] w-[12%]" style={{ background: "#b85c28" }} />
        <div className="absolute left-[52%] top-[72%] h-[14%] w-[14%]" style={{ background: "#4a8a3a" }} />
        <div className="absolute right-[10%] top-[-4%] h-[14%] w-[22%]" style={{ background: "#3f8a46", borderRadius: 6 }} />
      </div>
    );
  }

  if (item.type === "rug") {
    return (
      <div className="absolute z-[5] pointer-events-none" style={box}>
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, #d9a24a 0 12%, #c44a32 12% 28%, #e07048 28% 62%, #a83222 62% 78%, #c85a3a 78%)",
            boxShadow: "inset 0 0 0 4px #e8c478, 0 4px 0 rgba(60,30,10,0.25)",
          }}
        />
      </div>
    );
  }

  if (item.customIcon === "home_window") {
    return (
      <div className="absolute z-[12] pointer-events-none overflow-hidden" style={box}>
        <div className="absolute inset-0" style={{ background: "#6b4326", border: "3px solid #3d2414" }} />
        <div
          className="absolute left-[10%] right-[10%] top-[10%] bottom-[22%]"
          style={{
            background: "linear-gradient(#7ec8ef 0 38%, #b7e3a2 38% 72%, #6aa85a 72%)",
            border: "2px solid #4a2e18",
          }}
        />
        <div className="absolute left-1/2 top-[10%] bottom-[22%] w-[3px] -translate-x-1/2" style={{ background: "#4a2e18" }} />
        <div className="absolute left-[10%] right-[10%] top-[38%] h-[3px]" style={{ background: "#4a2e18" }} />
        <div className="absolute left-0 top-[12%] bottom-[24%] w-[12%]" style={{ background: "#efe6d4" }} />
        <div className="absolute right-0 top-[12%] bottom-[24%] w-[12%]" style={{ background: "#efe6d4" }} />
        <div className="absolute bottom-0 left-0 right-0 h-[20%]" style={{ background: "#8a5a32" }} />
        <div className="absolute bottom-[6%] left-[16%] h-[12%] w-[10%]" style={{ background: "#3f8a46" }} />
        <div className="absolute bottom-[6%] right-[16%] h-[12%] w-[10%]" style={{ background: "#3f8a46" }} />
      </div>
    );
  }

  if (item.customIcon === "home_art") {
    return (
      <div className="absolute z-[12] pointer-events-none" style={box}>
        <div className="absolute inset-0" style={{ background: "#6b4326", border: "3px solid #3d2414" }} />
        <div
          className="absolute inset-[18%]"
          style={{ background: "linear-gradient(#8ec4e8 0 46%, #8a9a72 46%)" }}
        />
      </div>
    );
  }

  if (item.customIcon === "home_chest") {
    return (
      <div className="absolute z-10 pointer-events-none" style={box}>
        <div className="absolute inset-0" style={{ background: "#7a4c28", border: "3px solid #3d2414" }} />
        <div className="absolute left-[8%] right-[8%] top-[18%] h-[28%]" style={{ background: "#3f7a48" }} />
        <div className="absolute left-1/2 top-[48%] h-[22%] w-[12%] -translate-x-1/2" style={{ background: "#d4b45a" }} />
      </div>
    );
  }

  if (item.customIcon === "home_plant") {
    return (
      <div className="absolute z-10 pointer-events-none" style={box}>
        <div className="absolute bottom-0 left-[22%] right-[22%] h-[28%]" style={{ background: "#b45a32", border: "2px solid #7a3418" }} />
        <div className="absolute left-[18%] top-[8%] h-[62%] w-[64%] rounded-full" style={{ background: "#3f8a46" }} />
        <div className="absolute left-[8%] top-[22%] h-[36%] w-[40%] rounded-full" style={{ background: "#2f6e38" }} />
      </div>
    );
  }

  if (item.customIcon === "home_lamp") {
    return (
      <div className="absolute z-10 pointer-events-none" style={box}>
        <div className="absolute bottom-0 left-[42%] right-[42%] h-[48%]" style={{ background: "#5a3a22" }} />
        <div
          className="absolute left-[18%] top-[4%] h-[42%] w-[64%]"
          style={{
            background: "#f3d27a",
            border: "2px solid #c9a24e",
            boxShadow: "0 0 10px rgba(255,200,90,0.55)",
          }}
        />
      </div>
    );
  }

  if (item.customIcon === "home_side_table") {
    return (
      <div className="absolute z-10 pointer-events-none" style={box}>
        <div className="absolute inset-0" style={{ background: "#8b5a32", border: "3px solid #4a2e18" }} />
        <div className="absolute left-[10%] top-[14%] h-[42%] w-[22%]" style={{ background: "#f0d48a", border: "2px solid #c9a24e" }} />
        <div className="absolute left-[42%] top-[22%] h-[28%] w-[18%]" style={{ background: "#efe6d4", borderRadius: 6 }} />
        <div className="absolute right-[12%] top-[18%] h-[36%] w-[20%]" style={{ background: "#3f8a46", borderRadius: 4 }} />
      </div>
    );
  }

  if (item.customIcon === "home_doormat") {
    return (
      <div className="absolute z-[6] pointer-events-none" style={box}>
        <div
          className="absolute inset-0"
          style={{
            background: "#c9a06a",
            border: "3px solid #8a6840",
            boxShadow: "inset 0 0 0 3px #e2c48a",
          }}
        />
      </div>
    );
  }

  return null;
}
