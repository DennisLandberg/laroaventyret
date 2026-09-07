export type WorldId = "hemgarden" | "mattelandet" | "ordlandet";

export type Direction = "up" | "down" | "left" | "right";

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Interactable {
  id: string;
  type: "portal" | "building" | "sign";
  x: number;
  y: number;
  radius: number;
  label: string;
  prompt: string;
  portalColor?: "blue" | "green" | "amber";
  targetWorld?: WorldId;
  targetSpawn?: Position;
  action?: "teleport" | "start_mattemagi" | "info";
  infoMessage?: string;
}

export interface SceneryItem {
  id: string;
  type: "tree" | "bush" | "flower" | "rock" | "house" | "math_house" | "sign" | "deco";
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  customIcon?: string;
  color?: string;
}

export interface PathRect {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: "dirt" | "stone" | "sand";
}

export interface WorldConfig {
  id: WorldId;
  name: string;
  subtitle: string;
  icon: string;
  width: number;
  height: number;
  spawnPosition: Position;
  groundBgClass: string;
  paths: PathRect[];
  scenery: SceneryItem[];
  obstacles: Obstacle[];
  interactables: Interactable[];
}
