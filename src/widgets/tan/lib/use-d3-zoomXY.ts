import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { Domain, Point } from "../../../entities/chart/model/types";
import {
  INNER_HEIGHT,
  INNER_WIDTH,
  xDOMAIN,
  yDOMAIN,
} from "../../../entities/chart/model/const";
import { tanData } from "../../../entities/chart/model/data";
import { parseDomain, serializeDomain } from "../../../shared/lib/domain-url";

export const useD3ZoomXY = () => {
  const tanSvgRef = useRef<SVGSVGElement | null>(null);
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

  const lastTransformRef = useRef(d3.zoomIdentity);

  // --------------- state ------------------
  const [xDomain, setXDomain] = useState<Domain>(xDOMAIN);
  const [yDomain, setYDomain] = useState<Domain>(yDOMAIN);

  //--------------------------------------//
  // --------- helpers ----------------- //
  //------------------------------------//

  // const zoomBy = (axis: "x" | "y" | "both", zoomFactor: number) => {
  //   const svgNode = tanSvgRef.current;
  //   const zoom = zoomBehaviorRef.current;
  //   if (!svgNode || !zoom) return;

  //   const svg = d3.select(svgNode);
  //   const t = d3.zoomTransform(svgNode);
  //   const nextK = t.k * zoomFactor;

  //   if (axis === "both") {
  //     svg.call(zoom.scaleBy as any, zoomFactor);
  //     return;
  //   }

  //   if (axis === "x") {
  //     const clampedK = Math.max(0.5, Math.min(10, nextK));
  //     const nextY = t.y * (clampedK / t.k);
  //     const nextT = d3.zoomIdentity.translate(t.x, nextY).scale(clampedK);
  //     svg.call(zoom.transform as any, nextT);
  //     return;
  //   }

  //   if (axis === "y") {
  //     const clampedK = Math.max(0.5, Math.min(10, nextK));
  //     const nextX = t.x * (clampedK / t.k);
  //     const nextT = d3.zoomIdentity.translate(nextX, t.y).scale(clampedK);
  //     svg.call(zoom.transform as any, nextT);
  //     return;
  //   }
  // };

  const panBy = (dir: "left" | "right") => {
    const svg = tanSvgRef.current;
    const zoom = zoomBehaviorRef.current;
    if (!svg || !zoom) return;

    const stepPx = INNER_WIDTH * 0.1;
    const dx = dir === "left" ? stepPx : -stepPx;
    d3.select(svg).call(zoom.translateBy as any, dx, 0);
  };

  const zoomDomain = (domain: Domain, zoomFactor: number) => {
    const center = (domain[0] + domain[1]) / 2; // 10, 30 = 20
    const span = domain[1] - domain[0];
    const newSpan = span / zoomFactor; // 20 * 1.5 = 30
    const newDomain: Domain = [center - newSpan / 2, center + newSpan / 2]; // 5, 35

    return newDomain;
  };

  const zoomBoth = (zoomFactor: number) => {
    setXDomain((d) => zoomDomain(d, zoomFactor));
    setYDomain((d) => zoomDomain(d, zoomFactor));
  };

  const zoomX = (factor: number) => {
    setXDomain((d) => zoomDomain(d, factor));
  };

  const zoomY = (factor: number) => {
    setYDomain((d) => zoomDomain(d, factor));
  };

  const reset = () => {
    setXDomain(xDOMAIN);
    setYDomain(yDOMAIN);

    const svg = tanSvgRef.current;
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
    const yFromUrl = parseDomain(params.get("y"));

    const startX = xFromUrl ?? xDOMAIN;
    const startY = yFromUrl ?? yDOMAIN;

    setXDomain(startX);
    setYDomain(startY);
    const node = tanSvgRef.current;
    if (!node) return;
    const svg = d3.select(node);
    svg.selectAll("*").remove();

    const mainGroup = svg
      .append("g")
      .attr("transform", `translate(30, 20)`)
      .attr("class", "main-tan");
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

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .filter((event) => event.type !== "wheel")
      .scaleExtent([1, 1])
      .on("zoom", (event) => {
        // const baseX = xDOMAIN;
        // const baseY = yDOMAIN;
        // const baseXScale = d3
        //   .scaleLinear()
        //   .domain(baseX)
        //   .range([0, INNER_WIDTH]);
        // const baseYScale = d3
        //   .scaleLinear()
        //   .domain(baseY)
        //   .range([INNER_HEIGHT, 0]);

        // const nextXDomain = event.transform
        //   .rescaleX(baseXScale)
        //   .domain() as Domain;
        // const nextYDomain = event.transform
        //   .rescaleY(baseYScale)
        //   .domain() as Domain;
        const prev = lastTransformRef.current;
        const current = event.transform;

        const xDiffPx = current.x - prev.x;
        const yDiffPx = current.y - prev.y;

        lastTransformRef.current = current;

        const xScale = d3.scaleLinear().domain(xDomain).range([0, INNER_WIDTH]);
        const yScale = d3
          .scaleLinear()
          .domain(yDomain)
          .range([INNER_HEIGHT, 0]);
        console.log("x diff px: ", xDiffPx);

        const dX = xScale.invert(0) - xScale.invert(xDiffPx);
        console.log("delta x: ", dX);
        const dY = yScale.invert(0) - yScale.invert(yDiffPx);

        setXDomain(([a, b]) => [a + dX, b + dX]);
        setYDomain(([a, b]) => [a + dY, b + dY]);
      });

    // xAxisGroup
    //   .append("rect")
    //   .attr("class", "x-wheel-zone")
    //   .attr("x", 0)
    //   .attr("y", -20)
    //   .attr("width", INNER_WIDTH)
    //   .attr("height", 40)
    //   .attr("fill", "transparent")
    //   .style("cursor", "ns-resize");

    // xAxisGroup.select<SVGRectElement>(".x-wheel-zone").on("wheel", (event) => {
    //   event.preventDefault();

    //   const factor = event.deltaY < 0 ? 0.9 : 1.1;

    //   setXDomain((prev) => {
    //     const mid = (prev[0] + prev[1]) / 2;
    //     const span = (prev[1] - prev[0]) * factor;
    //     return [mid - span / 2, mid + span / 2];
    //   });
    // });

    svg.call(zoom);
    xAxisGroupRef.current = xAxisGroup;
    yAxisGroupRef.current = yAxisGroup;
    plotGroupRef.current = plotGroup;
    zoomBehaviorRef.current = zoom;
  }, []);

  //--------------------------------------//
  // --------- update effect ----------- //
  //------------------------------------//

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    params.set("x", serializeDomain(xDomain));
    params.set("y", serializeDomain(yDomain));

    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", nextUrl);
    if (
      !xAxisGroupRef.current ||
      !yAxisGroupRef.current ||
      !plotGroupRef.current
    )
      return;

    const xScale = d3.scaleLinear().domain(xDomain).range([0, INNER_WIDTH]);
    const yScale = d3.scaleLinear().domain(yDomain).range([INNER_HEIGHT, 0]);

    const line = d3
      .line<Point>()
      .defined((d) => Number.isFinite(d.y) && Math.abs(d.y) < yDomain[1])
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    xAxisGroupRef.current
      .call(d3.axisBottom(xScale))
      .attr("transform", `translate(0,${INNER_HEIGHT / 2})`);
    yAxisGroupRef.current.call(d3.axisLeft(yScale));

    plotGroupRef.current
      .selectAll("path")
      .data([tanData(xDomain, INNER_WIDTH, 2)])
      .join("path")
      .attr("class", "plot-line tan")
      .attr("fill", "none")
      .attr("d", line);
  }, [xDomain, yDomain]);

  return { panBy, tanSvgRef, reset, zoomBoth, zoomX, zoomY };
};
