import { WorldConfig, WorldId } from "./types";

export const WORLDS: Record<WorldId, WorldConfig> = {
  hemgarden: {
    id: "hemgarden",
    name: "Hemgården",
    subtitle: "Ditt trygga hem och utgångspunkt för alla äventyr",
    icon: "🏡",
    width: 800,
    height: 600,
    spawnPosition: { x: 250, y: 300 },
    groundBgClass: "bg-emerald-600",
    paths: [
      // From house down to central crossroads
      { x: 190, y: 210, width: 44, height: 110, type: "dirt" },
      // Main horizontal path across the farm
      { x: 190, y: 300, width: 400, height: 44, type: "dirt" },
      // Path branching up to Mattelandet portal
      { x: 550, y: 170, width: 44, height: 150, type: "dirt" },
      { x: 550, y: 170, width: 80, height: 44, type: "dirt" },
      // Path branching down to Ordlandet portal
      { x: 550, y: 320, width: 44, height: 130, type: "dirt" },
      { x: 550, y: 430, width: 80, height: 44, type: "dirt" },
    ],
    scenery: [
      // Player's Cottage
      {
        id: "player_house",
        type: "house",
        x: 130,
        y: 110,
        width: 140,
        height: 110,
        label: "Ditt Hus",
      },
      // Signpost at the crossroads
      {
        id: "crossroads_sign",
        type: "sign",
        x: 440,
        y: 260,
        width: 32,
        height: 32,
        label: "Vägvisare",
        customIcon: "🪧",
      },
      // Decorative trees along top edge
      { id: "tree_t1", type: "tree", x: 40, y: 40, width: 50, height: 60 },
      { id: "tree_t2", type: "tree", x: 340, y: 40, width: 50, height: 60 },
      { id: "tree_t3", type: "tree", x: 420, y: 45, width: 50, height: 60 },
      { id: "tree_t4", type: "tree", x: 500, y: 40, width: 50, height: 60 },

      // Trees along left edge
      { id: "tree_l1", type: "tree", x: 40, y: 220, width: 50, height: 60 },
      { id: "tree_l2", type: "tree", x: 40, y: 350, width: 50, height: 60 },
      { id: "tree_l3", type: "tree", x: 40, y: 480, width: 50, height: 60 },

      // Trees along bottom edge
      { id: "tree_b1", type: "tree", x: 160, y: 500, width: 50, height: 60 },
      { id: "tree_b2", type: "tree", x: 280, y: 500, width: 50, height: 60 },
      { id: "tree_b3", type: "tree", x: 400, y: 500, width: 50, height: 60 },

      // Bushes and flowers near house
      { id: "bush_1", type: "bush", x: 90, y: 150, width: 34, height: 34 },
      { id: "bush_2", type: "bush", x: 280, y: 160, width: 34, height: 34 },
      { id: "flower_1", type: "flower", x: 190, y: 370, width: 24, height: 24, customIcon: "🌻" },
      { id: "flower_2", type: "flower", x: 230, y: 380, width: 24, height: 24, customIcon: "🌷" },
      { id: "flower_3", type: "flower", x: 330, y: 260, width: 24, height: 24, customIcon: "🌼" },
      { id: "flower_4", type: "flower", x: 480, y: 370, width: 24, height: 24, customIcon: "🌸" },
    ],
    obstacles: [
      // Player house collision box
      { x: 130, y: 110, width: 140, height: 95 },
      // Top tree border
      { x: 40, y: 40, width: 50, height: 50 },
      { x: 340, y: 40, width: 50, height: 50 },
      { x: 420, y: 45, width: 50, height: 50 },
      { x: 500, y: 40, width: 50, height: 50 },
      // Left trees
      { x: 40, y: 220, width: 50, height: 50 },
      { x: 40, y: 350, width: 50, height: 50 },
      { x: 40, y: 480, width: 50, height: 50 },
      // Bottom trees
      { x: 160, y: 500, width: 50, height: 50 },
      { x: 280, y: 500, width: 50, height: 50 },
      { x: 400, y: 500, width: 50, height: 50 },
    ],
    interactables: [
      // Blue Portal: Mattelandet
      {
        id: "portal_mattelandet",
        type: "portal",
        x: 670,
        y: 170,
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
        y: 450,
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
        x: 440,
        y: 260,
        radius: 45,
        label: "Vägvisare",
        prompt: "Vägvisare: ⬅️ Hemmet | Mattelandet ↗️ | Ordlandet ↘️",
        action: "info",
        infoMessage: "Vägvisare: ⬅️ Hemmet | Mattelandet ↗️ | Ordlandet ↘️",
      },
    ],
  },

  mattelandet: {
    id: "mattelandet",
    name: "Mattelandet",
    subtitle: "En förtrollad värld fylld med siffror och mattemagi",
    icon: "🪄",
    width: 800,
    height: 600,
    spawnPosition: { x: 210, y: 300 },
    groundBgClass: "bg-teal-700",
    paths: [
      // Path from portal straight to the Math House
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
        targetSpawn: { x: 590, y: 170 },
        action: "teleport",
      },
      // Entrance to Mattehuset (Starts Mattemagi)
      {
        id: "math_house_door",
        type: "building",
        x: 615,
        y: 305,
        radius: 65,
        label: "Mattehuset",
        prompt: "Tryck E för att spela Mattemagi",
        action: "start_mattemagi",
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
        targetSpawn: { x: 590, y: 450 },
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
