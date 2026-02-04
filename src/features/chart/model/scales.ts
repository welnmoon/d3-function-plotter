import type { Domain } from "./types";

export const zoomDomain = (domain: Domain, zoom: number): Domain => {
  const center = (domain[0] + domain[1]) / 2;
  const span = domain[1] - domain[0];
  const newSpan = span / zoom;
  const newDomain = [center - newSpan / 2, center + newSpan / 2];
  return newDomain as Domain;
};
