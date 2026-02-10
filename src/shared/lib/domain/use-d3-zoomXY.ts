import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { Domain, Variant } from "../../../entities/chart/model/types";
import { xDOMAIN, yDOMAIN } from "../../../entities/chart/model/const";
import { useChartD3Init } from "./use-chart-d3-init";
import { useChartD3Render } from "./use-chart-d3-render";
import { useD3ZoomXYHelpers } from "./use-D3-Zoom-XY-helpers";
import { writeUrl } from "../url/domain-url";

interface Params {
  variant: Variant;
}
export const useD3ZoomXY = ({ variant }: Params) => {
  const SvgRef = useRef<SVGSVGElement | null>(null);

  // --------------- ref -- domain ----------//
  const xDomainRef = useRef<Domain>(xDOMAIN);
  const yDomainRef = useRef<Domain>(yDOMAIN);

  const lastTransformRef = useRef(d3.zoomIdentity);
  const lastDomainForUrlRef = useRef<{ x: Domain; y: Domain }>({
    x: xDOMAIN,
    y: yDOMAIN,
  });

  // --------------- state ------------------
  const [xDomain, setXDomain] = useState<Domain>(xDOMAIN);
  const [yDomain, setYDomain] = useState<Domain>(yDOMAIN);

  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    xDomainRef.current = xDomain;
  }, [xDomain]);
  useEffect(() => {
    yDomainRef.current = yDomain;
  }, [yDomain]);

  // zooming - sync - effect
  useEffect(() => {
    if (!isZooming) return;

    writeUrl(xDomain, yDomain);
    setIsZooming(false);
  }, [xDomain, yDomain, isZooming]);

  const { plotGroupRef, xAxisGroupRef, yAxisGroupRef, zoomBehaviorRef } =
    useChartD3Init({
      setXDomain,
      setYDomain,
      lastDomainForUrlRef,
      lastTransformRef,
      SvgRef,
      xDomainRef,
      yDomainRef,
    });

  const { reset, zoomBoth, zoomX, zoomY, panBy } = useD3ZoomXYHelpers({
    lastTransformRef,
    setIsZooming,
    setXDomain,
    setYDomain,
    SvgRef,
    zoomBehaviorRef,
  });

  useChartD3Render({
    lastDomainForUrlRef,
    plotGroupRef,
    xAxisGroupRef,
    xDomain,
    yAxisGroupRef,
    yDomain,
    variant,
  });

  return { panBy, SvgRef, reset, zoomBoth, zoomX, zoomY };
};
