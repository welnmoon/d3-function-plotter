import type { Domain } from "../../entities/chart/model/types";
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export const zoomDomain = (
  domain: Domain,
  zoomFactor: number,
  limits: { minSpan: number; maxSpan: number },
) => {
  const center = (domain[0] + domain[1]) / 2; // 10, 30 = 20
  const span = domain[1] - domain[0];
  let newSpan = span / zoomFactor; // 20 * 1.5 = 30
  if (limits) {
    newSpan = clamp(newSpan, limits.minSpan, limits.maxSpan);
  }
  const newDomain: Domain = [center - newSpan / 2, center + newSpan / 2]; // 5, 35

  return newDomain;
};
