import { WorldConfig, WorldId } from "./types";

export const WORLDS: Record<WorldId, WorldConfig> = {
  hemgarden: {
    id: "hemgarden",
    name: "Hemgården",
    subtitle: "Ditt mysiga hem och utgångspunkt för alla äventyr",
    icon: "🏡",
    width: 800,
    height: 600,
    spawnPosition: { x: 210, y: 270 },
    groundBgClass: "bg-emerald-600",
    paths: [
      // From house down to central crossroads
      { x: 175, y: 220, width: 44, height: 100, type: "dirt" },
      // Main horizontal trail across the farm
      { x: 175, y: 310, width: 410, height: 44, type: "dirt" },
      // Path branching into the garden gate
      { x: 400, y: 240, width: 36, height: 80, type: "dirt" },
      // Path branching up to Mattelandet portal (with stone circle approach)
      { x: 550, y: 165, width: 44, height: 155, type: "dirt" },
      { x: 550, y: 165, width: 90, height: 44, type: "stone" },
      // Path branching down to Ordlandet portal (with stone circle approach)
      { x: 550, y: 310, width: 44, height: 145, type: "dirt" },
      { x: 550, y: 425, width: 90, height: 44, type: "stone" },
    ],
    scenery: [
      // Player's Cozy Cottage
      {
        id: "player_house",
        type: "house",
        x: 120,
        y: 100,
        width: 150,
        height: 125,
        label: "Ditt Hus",
      },
      // Mailbox next to house
      {
        id: "house_mailbox",
        type: "mailbox",
        x: 285,
        y: 220,
        width: 28,
        height: 36,
        label: "Brevlåda",
        customIcon: "📮",
      },
      // Water well near the garden
      {
        id: "garden_well",
        type: "well",
        x: 285,
        y: 145,
        width: 38,
        height: 42,
        label: "Brunn",
        customIcon: "🪵",
      },

      // Fenced Garden - Top fence
      { id: "fence_t", type: "fence", x: 340, y: 110, width: 175, height: 16 },
      // Fenced Garden - Left fence
      { id: "fence_l", type: "fence", x: 340, y: 124, width: 16, height: 115 },
      // Fenced Garden - Right fence
      { id: "fence_r", type: "fence", x: 499, y: 124, width: 16, height: 115 },
      // Fenced Garden - Bottom left fence (leaves a gate opening in the middle!)
      { id: "fence_bl", type: "fence", x: 340, y: 235, width: 55, height: 16 },
      // Fenced Garden - Bottom right fence
      { id: "fence_br", type: "fence", x: 440, y: 235, width: 75, height: 16 },

      // Inside Garden: Tilled Vegetable plots (visual placeholders for future farming)
      {
        id: "veggie_patch_1",
        type: "garden_bed",
        x: 368,
        y: 138,
        width: 52,
        height: 80,
        label: "Morotsland",
        customIcon: "🥕",
      },
      {
        id: "veggie_patch_2",
        type: "garden_bed",
        x: 432,
        y: 138,
        width: 52,
        height: 80,
        label: "Grönsaksland",
        customIcon: "🌱",
      },

      // Crossroads Signpost
      {
        id: "crossroads_sign",
        type: "sign",
        x: 450,
        y: 365,
        width: 32,
        height: 32,
        label: "Vägvisare",
        customIcon: "🪧",
      },

      // Rune Stones framing portals
      { id: "rune_m1", type: "rock", x: 635, y: 115, width: 28, height: 35, customIcon: "🪨" },
      { id: "rune_m2", type: "rock", x: 635, y: 215, width: 28, height: 35, customIcon: "🪨" },
      { id: "rune_o1", type: "rock", x: 635, y: 395, width: 28, height: 35, customIcon: "🪨" },
      { id: "rune_o2", type: "rock", x: 635, y: 495, width: 28, height: 35, customIcon: "🪨" },

      // Natural perimeter tree border
      { id: "tree_t1", type: "tree", x: 35, y: 40, width: 55, height: 65 },
      // Charming Pink Flowering Blossom Tree! 🌸
      { id: "tree_blossom", type: "tree", color: "pink", x: 535, y: 40, width: 65, height: 75, label: "Körsbärsträd" },
      { id: "tree_t3", type: "tree", x: 650, y: 40, width: 55, height: 65 },

      // Left edge trees & mini lilypad pond
      { id: "tree_l1", type: "tree", x: 35, y: 200, width: 55, height: 65 },
      { id: "tree_l2", type: "tree", x: 35, y: 330, width: 55, height: 65 },
      { id: "mini_pond", type: "deco", x: 50, y: 420, width: 60, height: 45, customIcon: "pond" },
      { id: "tree_l3", type: "tree", x: 35, y: 490, width: 55, height: 65 },

      // Bottom edge trees & bushes
      { id: "tree_b1", type: "tree", x: 150, y: 500, width: 55, height: 65 },
      { id: "tree_b2", type: "tree", x: 280, y: 500, width: 55, height: 65 },
      { id: "tree_b3", type: "tree", x: 410, y: 500, width: 55, height: 65 },
      { id: "tree_b4", type: "tree", x: 540, y: 500, width: 55, height: 65 },

      // Bushes and flowers around cottage and garden
      { id: "bush_1", type: "bush", x: 80, y: 130, width: 34, height: 34 },
      { id: "barrel_porch", type: "deco", x: 95, y: 195, width: 22, height: 26, customIcon: "barrel" },
      { id: "flower_1", type: "flower", x: 180, y: 375, width: 24, height: 24, customIcon: "🌻" },
      { id: "flower_2", type: "flower", x: 220, y: 385, width: 24, height: 24, customIcon: "🌷" },
      { id: "flower_3", type: "flower", x: 325, y: 260, width: 24, height: 24, customIcon: "🌼" },
      { id: "flower_4", type: "flower", x: 490, y: 265, width: 24, height: 24, customIcon: "🌸" },
      { id: "flower_5", type: "flower", x: 270, y: 375, width: 24, height: 24, customIcon: "🌼" },

      // Cozy Wooden Bench near garden
      { id: "garden_bench", type: "deco", x: 450, y: 308, width: 34, height: 22, customIcon: "bench" },
      // Rustic Lantern Post near crossroads
      { id: "lantern_crossroads", type: "deco", x: 495, y: 355, width: 20, height: 38, customIcon: "lantern" },
    ],
    obstacles: [
      // Player house collision box
      { x: 120, y: 100, width: 150, height: 105 },
      // Water well collision
      { x: 285, y: 145, width: 38, height: 42 },
      // Mini-pond collision
      { x: 50, y: 420, width: 60, height: 45 },
      // Garden Fences
      { x: 340, y: 110, width: 175, height: 16 },
      { x: 340, y: 124, width: 16, height: 115 },
      { x: 499, y: 124, width: 16, height: 115 },
      { x: 340, y: 235, width: 55, height: 16 },
      { x: 440, y: 235, width: 75, height: 16 },
      // Top trees
      { x: 35, y: 40, width: 55, height: 55 },
      { x: 550, y: 40, width: 55, height: 55 },
      { x: 650, y: 40, width: 55, height: 55 },
      // Left trees
      { x: 35, y: 200, width: 55, height: 55 },
      { x: 35, y: 340, width: 55, height: 55 },
      { x: 35, y: 480, width: 55, height: 55 },
      // Bottom trees
      { x: 150, y: 500, width: 55, height: 55 },
      { x: 280, y: 500, width: 55, height: 55 },
      { x: 410, y: 500, width: 55, height: 55 },
      { x: 540, y: 500, width: 55, height: 55 },
    ],
    interactables: [
      // Enter Player Home Door
      {
        id: "door_player_home",
        type: "building",
        x: 195,
        y: 225,
        radius: 55,
        label: "Ditt Hus",
        prompt: "Tryck E för att gå in",
        targetWorld: "player_home",
        targetSpawn: { x: 300, y: 400 },
        action: "teleport",
      },
      // Blue Portal: Mattelandet
      {
        id: "portal_mattelandet",
        type: "portal",
        x: 670,
        y: 165,
        radius: 60,
        label: "Mattelandet",
        prompt: "Tryck E för att gå till Mattelandet",
        portalColor: "blue",
        targetWorld: "mattelandet",
        targetSpawn: { x: 210, y: 300 },
        action: "teleport",
      },
      // Green Portal: Ordlandet
      {
        id: "portal_ordlandet",
        type: "portal",
        x: 670,
        y: 445,
        radius: 60,
        label: "Ordlandet",
        prompt: "Tryck E för att gå till Ordlandet",
        portalColor: "green",
        targetWorld: "ordlandet",
        targetSpawn: { x: 210, y: 300 },
        action: "teleport",
      },
      // Crossroads sign
      {
        id: "sign_crossroads",
        type: "sign",
        x: 450,
        y: 365,
        radius: 45,
        label: "Vägvisare",
        prompt: "Vägvisare: ⬅️ Hemmet | Mattelandet ↗️ | Ordlandet ↘️",
        action: "info",
        infoMessage: "Vägvisare: ⬅️ Hemmet & Trädgården | Mattelandet ↗️ | Ordlandet ↘️",
      },
    ],
  },

  player_home: {
    id: "player_home",
    name: "Ditt Hem",
    subtitle: "Ett varmt, tryggt och ombonat krypin",
    icon: "🏡",
    width: 600,
    height: 500,
    spawnPosition: { x: 300, y: 390 },
    groundBgClass: "bg-amber-800",
    paths: [],
    scenery: [
      {
        id: "home_bed",
        type: "bed",
        x: 60,
        y: 65,
        width: 85,
        height: 120,
        label: "Mysig Säng",
      },
      {
        id: "home_fireplace",
        type: "fireplace",
        x: 410,
        y: 55,
        width: 110,
        height: 85,
        label: "Öppen Spis",
      },
      {
        id: "home_table",
        type: "table",
        x: 150,
        y: 138,
        width: 38,
        height: 42,
        label: "Sängbord",
      },
      {
        id: "home_rug",
        type: "rug",
        x: 186,
        y: 188,
        width: 228,
        height: 152,
        label: "Ullmatta",
      },
      {
        id: "home_bookshelf",
        type: "bookshelf",
        x: 24,
        y: 318,
        width: 52,
        height: 100,
        label: "Bokhylla",
      },
      {
        id: "home_window",
        type: "deco",
        x: 226,
        y: 8,
        width: 148,
        height: 54,
        customIcon: "home_window",
      },
      {
        id: "home_art",
        type: "deco",
        x: 28,
        y: 28,
        width: 34,
        height: 28,
        customIcon: "home_art",
      },
      {
        id: "home_chest",
        type: "deco",
        x: 248,
        y: 62,
        width: 104,
        height: 26,
        customIcon: "home_chest",
      },
      {
        id: "home_plant_bed",
        type: "deco",
        x: 48,
        y: 188,
        width: 28,
        height: 34,
        customIcon: "home_plant",
      },
      {
        id: "home_plant_shelf",
        type: "deco",
        x: 82,
        y: 372,
        width: 30,
        height: 38,
        customIcon: "home_plant",
      },
      {
        id: "home_plant_hearth",
        type: "deco",
        x: 528,
        y: 128,
        width: 28,
        height: 36,
        customIcon: "home_plant",
      },
      {
        id: "home_plant_corner",
        type: "deco",
        x: 528,
        y: 348,
        width: 34,
        height: 42,
        customIcon: "home_plant",
      },
      {
        id: "home_lamp",
        type: "deco",
        x: 498,
        y: 228,
        width: 26,
        height: 40,
        customIcon: "home_lamp",
      },
      {
        id: "home_side_table",
        type: "deco",
        x: 430,
        y: 348,
        width: 70,
        height: 36,
        customIcon: "home_side_table",
      },
      {
        id: "home_doormat",
        type: "deco",
        x: 268,
        y: 446,
        width: 64,
        height: 22,
        customIcon: "home_doormat",
      },
    ],
    obstacles: [
      { x: 60, y: 65, width: 85, height: 110 },
      { x: 410, y: 55, width: 110, height: 85 },
      { x: 150, y: 140, width: 36, height: 38 },
      { x: 24, y: 318, width: 52, height: 100 },
    ],
    interactables: [
      // Exit Door to Hemgården
      {
        id: "exit_player_home",
        type: "building",
        x: 300,
        y: 440,
        radius: 60,
        label: "Utgång",
        prompt: "Tryck E för att gå ut",
        targetWorld: "hemgarden",
        targetSpawn: { x: 195, y: 255 },
        action: "teleport",
      },
    ],
  },

  mattelandet: {
    id: "mattelandet",
    name: "Mattelandet",
    subtitle: "En förtrollad värld fylld med siffror och magiska formler",
    icon: "🪄",
    width: 800,
    height: 600,
    spawnPosition: { x: 210, y: 300 },
    groundBgClass: "bg-teal-700",
    paths: [
      // Path from portal straight to Mattehuset
      { x: 130, y: 280, width: 440, height: 44, type: "stone" },
    ],
    scenery: [
      // Math House ("Mattehuset")
      {
        id: "math_house",
        type: "math_house",
        x: 540,
        y: 190,
        width: 150,
        height: 130,
        label: "Mattehuset",
      },
      // Magical trees and crystals
      { id: "m_tree_1", type: "tree", x: 40, y: 50, width: 50, height: 60, color: "emerald" },
      { id: "m_tree_2", type: "tree", x: 150, y: 60, width: 50, height: 60, color: "emerald" },
      { id: "m_tree_3", type: "tree", x: 300, y: 70, width: 50, height: 60, color: "emerald" },
      { id: "m_tree_4", type: "tree", x: 670, y: 60, width: 50, height: 60, color: "emerald" },
      { id: "m_tree_5", type: "tree", x: 60, y: 480, width: 50, height: 60, color: "emerald" },
      { id: "m_tree_6", type: "tree", x: 250, y: 490, width: 50, height: 60, color: "emerald" },
      { id: "m_tree_7", type: "tree", x: 450, y: 480, width: 50, height: 60, color: "emerald" },
      { id: "m_tree_8", type: "tree", x: 650, y: 490, width: 50, height: 60, color: "emerald" },

      // Magic sparkles and numbers in scenery
      { id: "crystal_1", type: "deco", x: 300, y: 220, width: 30, height: 30, customIcon: "💎" },
      { id: "crystal_2", type: "deco", x: 420, y: 360, width: 30, height: 30, customIcon: "✨" },
      { id: "number_1", type: "deco", x: 230, y: 220, width: 30, height: 30, customIcon: "🔢" },
    ],
    obstacles: [
      // Math house collision
      { x: 540, y: 190, width: 150, height: 110 },
      // Trees
      { x: 40, y: 50, width: 50, height: 50 },
      { x: 150, y: 60, width: 50, height: 50 },
      { x: 300, y: 70, width: 50, height: 50 },
      { x: 670, y: 60, width: 50, height: 50 },
      { x: 60, y: 480, width: 50, height: 50 },
      { x: 250, y: 490, width: 50, height: 50 },
      { x: 450, y: 480, width: 50, height: 50 },
      { x: 650, y: 490, width: 50, height: 50 },
    ],
    interactables: [
      // Portal back to Hemgården
      {
        id: "portal_to_home_from_math",
        type: "portal",
        x: 130,
        y: 300,
        radius: 60,
        label: "Hemgården",
        prompt: "Tryck E för att gå hem till Hemgården",
        portalColor: "amber",
        targetWorld: "hemgarden",
        targetSpawn: { x: 590, y: 165 },
        action: "teleport",
      },
      // Door into Mattehuset Interior
      {
        id: "math_house_door",
        type: "building",
        x: 615,
        y: 305,
        radius: 65,
        label: "Mattehuset",
        prompt: "Tryck E för att gå in i Mattehuset",
        targetWorld: "mattehuset_interior",
        targetSpawn: { x: 300, y: 410 },
        action: "teleport",
      },
    ],
  },

  mattehuset_interior: {
    id: "mattehuset_interior",
    name: "Mattehuset",
    subtitle: "Magins och siffrornas hemliga sal",
    icon: "🪄",
    width: 600,
    height: 500,
    spawnPosition: { x: 300, y: 410 },
    groundBgClass: "bg-indigo-950",
    paths: [],
    scenery: [
      // Large Chalkboard with math runes on north wall
      {
        id: "math_chalkboard",
        type: "chalkboard",
        x: 170,
        y: 50,
        width: 260,
        height: 75,
        label: "Magisk Räknetavla",
      },
      // Spellbook shelves flanking north wall
      {
        id: "spell_shelf_l",
        type: "bookshelf",
        x: 60,
        y: 55,
        width: 60,
        height: 95,
        label: "Trollformler",
      },
      {
        id: "spell_shelf_r",
        type: "bookshelf",
        x: 480,
        y: 55,
        width: 60,
        height: 95,
        label: "Magiska böcker",
      },

      // 3 Math Level Stations (Pedestals)
      // Level 1: Addition (Unlocked)
      {
        id: "station_pedestal_1",
        type: "pedestal",
        x: 105,
        y: 200,
        width: 90,
        height: 90,
        label: "Nivå 1: Addition",
        stationLevel: 1,
        isLocked: false,
      },
      // Level 2: Subtraktion (Locked)
      {
        id: "station_pedestal_2",
        type: "pedestal",
        x: 255,
        y: 200,
        width: 90,
        height: 90,
        label: "Nivå 2: Subtraktion",
        stationLevel: 2,
        isLocked: true,
      },
      // Level 3: Blandad matte (Locked)
      {
        id: "station_pedestal_3",
        type: "pedestal",
        x: 405,
        y: 200,
        width: 90,
        height: 90,
        label: "Nivå 3: Blandad matte",
        stationLevel: 3,
        isLocked: true,
      },

      // Center magical carpet
      {
        id: "math_carpet",
        type: "rug",
        x: 190,
        y: 310,
        width: 220,
        height: 85,
        label: "Magi-matta",
        customIcon: "✨",
      },
      // Exit doormat
      {
        id: "matte_doormat",
        type: "deco",
        x: 275,
        y: 445,
        width: 50,
        height: 25,
        customIcon: "🚪",
      },
    ],
    obstacles: [
      // North wall shelves and chalkboard
      { x: 60, y: 55, width: 60, height: 95 },
      { x: 170, y: 50, width: 260, height: 75 },
      { x: 480, y: 55, width: 60, height: 95 },
      // Pedestals collision
      { x: 105, y: 200, width: 90, height: 70 },
      { x: 255, y: 200, width: 90, height: 70 },
      { x: 405, y: 200, width: 90, height: 70 },
    ],
    interactables: [
      // Level 1: Addition (Launches Mattemagi)
      {
        id: "station_addition",
        type: "building",
        x: 150,
        y: 255,
        radius: 65,
        label: "Nivå 1: Addition",
        prompt: "Tryck E för att spela Addition",
        action: "start_mattemagi",
      },
      // Level 2: Subtraktion (Locked message)
      {
        id: "station_subtraction",
        type: "building",
        x: 300,
        y: 255,
        radius: 65,
        label: "Nivå 2: Subtraktion (Låst)",
        prompt: "Klara tidigare nivåer för att låsa upp denna!",
        action: "info",
        infoMessage: "Klara tidigare nivåer för att låsa upp denna! 🔒",
      },
      // Level 3: Blandad matte (Locked message)
      {
        id: "station_mixed",
        type: "building",
        x: 450,
        y: 255,
        radius: 65,
        label: "Nivå 3: Blandad matte (Låst)",
        prompt: "Klara tidigare nivåer för att låsa upp denna!",
        action: "info",
        infoMessage: "Klara tidigare nivåer för att låsa upp denna! 🔒",
      },
      // Exit Door to Mattelandet
      {
        id: "exit_mattehuset",
        type: "building",
        x: 300,
        y: 445,
        radius: 60,
        label: "Utgång",
        prompt: "Tryck E för att gå ut",
        targetWorld: "mattelandet",
        targetSpawn: { x: 615, y: 350 },
        action: "teleport",
      },
    ],
  },

  ordlandet: {
    id: "ordlandet",
    name: "Ordlandet",
    subtitle: "Bokstävernas och sagornas lummiga skog",
    icon: "🌲",
    width: 800,
    height: 600,
    spawnPosition: { x: 210, y: 300 },
    groundBgClass: "bg-green-800",
    paths: [
      // Path from portal to the construction site
      { x: 130, y: 280, width: 360, height: 44, type: "sand" },
    ],
    scenery: [
      // Construction sign & barricade
      {
        id: "ord_sign",
        type: "sign",
        x: 480,
        y: 260,
        width: 50,
        height: 50,
        label: "Byggarbetsplats",
        customIcon: "🚧",
      },
      // Forest trees
      { id: "o_tree_1", type: "tree", x: 40, y: 50, width: 50, height: 60 },
      { id: "o_tree_2", type: "tree", x: 200, y: 60, width: 50, height: 60 },
      { id: "o_tree_3", type: "tree", x: 380, y: 50, width: 50, height: 60 },
      { id: "o_tree_4", type: "tree", x: 560, y: 60, width: 50, height: 60 },
      { id: "o_tree_5", type: "tree", x: 700, y: 160, width: 50, height: 60 },
      { id: "o_tree_6", type: "tree", x: 700, y: 340, width: 50, height: 60 },
      { id: "o_tree_7", type: "tree", x: 80, y: 480, width: 50, height: 60 },
      { id: "o_tree_8", type: "tree", x: 300, y: 490, width: 50, height: 60 },
      { id: "o_tree_9", type: "tree", x: 520, y: 480, width: 50, height: 60 },

      // Books and letter sparkles
      { id: "book_1", type: "deco", x: 320, y: 220, width: 28, height: 28, customIcon: "📖" },
      { id: "book_2", type: "deco", x: 420, y: 360, width: 28, height: 28, customIcon: "🔤" },
    ],
    obstacles: [
      // Construction sign obstacle
      { x: 480, y: 260, width: 50, height: 50 },
      // Trees
      { x: 40, y: 50, width: 50, height: 50 },
      { x: 200, y: 60, width: 50, height: 50 },
      { x: 380, y: 50, width: 50, height: 50 },
      { x: 560, y: 60, width: 50, height: 50 },
      { x: 700, y: 160, width: 50, height: 50 },
      { x: 700, y: 340, width: 50, height: 50 },
      { x: 80, y: 480, width: 50, height: 50 },
      { x: 300, y: 490, width: 50, height: 50 },
      { x: 520, y: 480, width: 50, height: 50 },
    ],
    interactables: [
      // Portal back to Hemgården
      {
        id: "portal_to_home_from_ord",
        type: "portal",
        x: 130,
        y: 300,
        radius: 60,
        label: "Hemgården",
        prompt: "Tryck E för att gå hem till Hemgården",
        portalColor: "amber",
        targetWorld: "hemgarden",
        targetSpawn: { x: 590, y: 445 },
        action: "teleport",
      },
      // Construction notice
      {
        id: "ord_construction_interact",
        type: "sign",
        x: 480,
        y: 280,
        radius: 60,
        label: "Ordlandet",
        prompt: "Ordlandet byggs just nu! Kom tillbaka snart 🚧",
        action: "info",
        infoMessage: "Byggarbetare håller på att plantera ordträd och bokstavsstigar! Denna värld öppnar i nästa uppdatering. 🚧📖",
      },
    ],
  },
};
