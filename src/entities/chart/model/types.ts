export type Point = { x: number; y: number };

type PanDir = "left" | "right";
type ZoomDir = "in" | "out";

export type Action =
  | { type: "pan"; dir: PanDir }
  | { type: "zoom"; dir: ZoomDir };

export type Domain = [number, number];

export type Variant = "sin" | "tan";
