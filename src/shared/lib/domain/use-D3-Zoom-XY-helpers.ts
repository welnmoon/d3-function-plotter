import {
  INNER_HEIGHT,
  INNER_WIDTH,
  MAX_SPAN_TAN,
  MIN_SPAN_TAN,
  xDOMAIN,
  yDOMAIN,
} from "../../../entities/chart/model/const";
import type { Domain } from "../../../entities/chart/model/types";
import * as d3 from "d3";
import { zoomDomain } from "./zoom-domain";

interface Params {
  setIsZooming: (value: React.SetStateAction<boolean>) => void;
  setXDomain: React.Dispatch<React.SetStateAction<Domain>>;
  setYDomain: React.Dispatch<React.SetStateAction<Domain>>;
  lastTransformRef: React.RefObject<d3.ZoomTransform>;
  SvgRef: React.RefObject<SVGSVGElement | null>;
  zoomBehaviorRef: React.RefObject<d3.ZoomBehavior<
    SVGSVGElement,
    unknown
  > | null>;
}

export const useD3ZoomXYHelpers = ({
  setIsZooming,
  setXDomain,
  setYDomain,
  lastTransformRef,
  SvgRef,
  zoomBehaviorRef,
}: Params) => {
  const zoomBoth = (zoomFactor: number) => {
    setIsZooming(true);
    setXDomain((d) =>
      zoomDomain(d, zoomFactor, {
        minSpan: MIN_SPAN_TAN,
        maxSpan: MAX_SPAN_TAN,
      }),
    );
    setYDomain((d) =>
      zoomDomain(d, zoomFactor, {
        minSpan: MIN_SPAN_TAN,
        maxSpan: MAX_SPAN_TAN,
      }),
    );
  };

  const zoomX = (factor: number) => {
    setIsZooming(true);
    setXDomain((d) =>
      zoomDomain(d, factor, { minSpan: MIN_SPAN_TAN, maxSpan: MAX_SPAN_TAN }),
    );
  };

  const zoomY = (factor: number) => {
    setIsZooming(true);
    setYDomain((d) =>
      zoomDomain(d, factor, { minSpan: MIN_SPAN_TAN, maxSpan: MAX_SPAN_TAN }),
    );
  };

  const panBy = (dir: "left" | "right" | "up" | "down") => {
    const svg = SvgRef.current;
    const zoom = zoomBehaviorRef.current;
    if (!svg || !zoom) return;

    const stepX = INNER_WIDTH * 0.1;
    const stepY = INNER_HEIGHT * 0.1;

    let dx = 0;
    let dy = 0;

    if (dir === "left") dx = stepX;
    if (dir === "right") dx = -stepX;
    if (dir === "up") dy = stepY;
    if (dir === "down") dy = -stepY;

    d3.select(svg).call(zoom.translateBy as any, dx, dy);
  };

  const reset = () => {
    setXDomain(xDOMAIN);
    setYDomain(yDOMAIN);

    lastTransformRef.current = d3.zoomIdentity;

    const svg = SvgRef.current;
    const zoom = zoomBehaviorRef.current;
    if (!svg || !zoom) return;

    d3.select(svg).call(zoom.transform as any, d3.zoomIdentity);
  };

  return { reset, zoomX, zoomY, zoomBoth, panBy };
};
