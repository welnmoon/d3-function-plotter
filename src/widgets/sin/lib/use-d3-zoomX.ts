import { useEffect, useRef, useState } from "react";
import type { Domain, Point } from "../../../entities/chart/model/types";
import {
  INNER_HEIGHT,
  INNER_WIDTH,
  MAX_SPAN,
  MIN_SPAN,
  xDOMAIN,
  yDOMAIN,
} from "../../../entities/chart/model/const";
import * as d3 from "d3";
import { sinData } from "../../../entities/chart/model/data";
import { parseDomain, writeUrl } from "../../../shared/lib/domain-url";
import { zoomDomain } from "../../../shared/lib/zoom-domain";

export const useD3ZoomX = () => {
  // --------------- refs ------------------
  const sinSvgRef = useRef<SVGSVGElement | null>(null);
  const xAxisGroupRef = useRef<d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  > | null>(null);
  const yAxisGroupRef = useRef<d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  > | null>(null);
  const plotGroupRef = useRef<d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  > | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<
    SVGSVGElement,
    unknown
  > | null>(null);

  const xDomainRef = useRef<Domain>(xDOMAIN);

  const lastTransformRef = useRef(d3.zoomIdentity);
  const lastDomainForUrlRef = useRef<Domain>(xDOMAIN);

  // --------------- state ------------------

  const [xDomain, setXDomain] = useState<Domain>(xDOMAIN);
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    xDomainRef.current = xDomain;
  }, [xDomain]);

  useEffect(() => {
    if (!isZooming) return;
    writeUrl(lastDomainForUrlRef.current, yDOMAIN);
    setIsZooming(false);
  }, [xDomain]);

  //--------------------------------------//
  // --------- helpers ----------------- //
  //------------------------------------//

  const panBy = (dir: "left" | "right") => {
    const svg = sinSvgRef.current;
    const zoom = zoomBehaviorRef.current;
    if (!svg || !zoom) return;

    const stepPx = INNER_WIDTH * 0.1;
    const dx = dir === "left" ? stepPx : -stepPx;
    d3.select(svg).call(zoom.translateBy as any, dx, 0);
  };

  const zoomX = (factor: number) => {
    setXDomain((d) =>
      zoomDomain(d, factor, { minSpan: MIN_SPAN, maxSpan: MAX_SPAN }),
    );
    setIsZooming(true);
  };

  const reset = () => {
    setXDomain(xDOMAIN);
    lastTransformRef.current = d3.zoomIdentity;

    const svg = sinSvgRef.current;
    const zoom = zoomBehaviorRef.current;
    if (!svg || !zoom) return;

    d3.select(svg).call(zoom.transform as any, d3.zoomIdentity);
  };

  //--------------------------------------//
  // --------- init effect ------------- //
  //------------------------------------//
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const xFromUrl = parseDomain(params.get("x"));

    if (xFromUrl) setXDomain(xFromUrl);
    const node = sinSvgRef.current;
    if (!node) return;
    const svg = d3.select(node);
    svg.selectAll("*").remove();

    const mainGroup = svg
      .append("g")
      .attr("transform", `translate(30, 20)`)
      .attr("class", "main-sin");
    const xAxisGroup = mainGroup.append("g").attr("class", "x-axis");
    const yAxisGroup = mainGroup.append("g").attr("class", "y-axis");
    const plotGroup = mainGroup.append("g").attr("class", "plot");
    plotGroup
      .append("rect")
      .attr("class", "overlay")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", INNER_WIDTH)
      .attr("height", INNER_HEIGHT)
      .attr("fill", "transparent")
      .style("cursor", "grab");

    xDomainRef.current = xDomain;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .filter((event) => event?.type !== "wheel")
      .on("zoom", (event) => {
        const prev = lastTransformRef.current;
        const current = event.transform;

        const xDiffPx = current.x - prev.x;

        lastTransformRef.current = current;

        const xScale = d3
          .scaleLinear()
          .domain(xDomainRef.current)
          .range([0, INNER_WIDTH]);

        console.log("x diff px: ", xDiffPx);

        const dX = xScale.invert(0) - xScale.invert(xDiffPx);
        console.log("delta x: ", dX);

        setXDomain(([a, b]) => [a + dX, b + dX]);
      })
      .on("end", () => {
        writeUrl(lastDomainForUrlRef.current, yDOMAIN);
      });

    svg.call(zoom);
    xAxisGroupRef.current = xAxisGroup;
    yAxisGroupRef.current = yAxisGroup;
    plotGroupRef.current = plotGroup;
    zoomBehaviorRef.current = zoom;

    return () => {
      svg.on(".zoom", null);
    };
  }, []);

  //--------------------------------------//
  // --------- update effect ----------- //
  //------------------------------------//
  useEffect(() => {
    if (
      !xAxisGroupRef.current ||
      !yAxisGroupRef.current ||
      !plotGroupRef.current
    )
      return;
    const xScale = d3.scaleLinear().domain(xDomain).range([0, INNER_WIDTH]);
    const yScale = d3.scaleLinear().domain([-1, 1]).range([INNER_HEIGHT, 0]);

    const line = d3
      .line<Point>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    xAxisGroupRef.current
      .call(d3.axisBottom(xScale))
      .attr("transform", `translate(0,${INNER_HEIGHT / 2})`);
    yAxisGroupRef.current.call(d3.axisLeft(yScale));

    plotGroupRef.current
      .selectAll("path")
      .data([sinData(xDomain)])
      .join("path")
      .attr("class", "plot-line sin")
      .attr("fill", "none")
      .attr("d", line);

    lastDomainForUrlRef.current = xDomain;
  }, [xDomain]);

  return { panBy, zoomX, sinSvgRef, reset };
};
