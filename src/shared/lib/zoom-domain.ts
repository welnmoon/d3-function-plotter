import type { Domain } from "../../entities/chart/model/types";

export const zoomDomain = (domain: Domain, zoomFactor: number) => {
  const center = (domain[0] + domain[1]) / 2; // 10, 30 = 20
  const span = domain[1] - domain[0];
  const newSpan = span / zoomFactor; // 20 * 1.5 = 30
  const newDomain: Domain = [center - newSpan / 2, center + newSpan / 2]; // 5, 35

  return newDomain;
};
