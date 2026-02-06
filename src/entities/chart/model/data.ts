import * as d3 from "d3";
import type { Domain, Point } from "./types";
import { N } from "./const";

export const sinData = (xDomain: Domain): Point[] =>
  d3.range(N).map((i) => {
    const x = xDomain[0] + (i / (N - 1)) * (xDomain[1] - xDomain[0]);
    return { x, y: Math.sin(x) };
  });

export const tanData = (xDomain: Domain, widthPx: number, k = 2): Point[] => {
  const n = Math.max(300, Math.floor(widthPx * k));
  return d3.range(n).map((i) => {
    const t = i / (n - 1);
    const x = xDomain[0] + t * (xDomain[1] - xDomain[0]);
    return { x, y: Math.tan(x) };
  });
};
