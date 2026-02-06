import { useEffect, useRef, useState } from "react";
import type { Domain, Point } from "../../../entities/chart/model/types";
import {
  INNER_HEIGHT,
  INNER_WIDTH,
  xDOMAIN,
} from "../../../entities/chart/model/const";
import * as d3 from "d3";
import { sinData } from "../../../entities/chart/model/data";
import { parseDomain, serializeDomain } from "../../../shared/lib/domain-url";

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
  const xScaleRef = useRef<d3.ScaleLinear<number, number> | null>(null);
  const yScaleRef = useRef<d3.ScaleLinear<number, number> | null>(null);

  const xDomainRef = useRef<Domain>(xDOMAIN);
  const baseXDomainRef = useRef<Domain>(xDOMAIN);

  // --------------- state ------------------

  const [xDomain, setXDomain] = useState<Domain>(xDOMAIN);

  // ------------- zoom / pan -----------------

  const zoomBy = (zoomFactor: number) => {
    const svg = sinSvgRef.current;
    const zoom = zoomBehaviorRef.current;
    if (!svg || !zoom) return;
    console.log({ svg: !!svg, zoom: !!zoom });
    d3.select(svg).call(zoom.scaleBy as any, zoomFactor);
  };

  const panBy = (dir: "left" | "right") => {
    const svg = sinSvgRef.current;
    const zoom = zoomBehaviorRef.current;
    if (!svg || !zoom) return;

    const stepPx = INNER_WIDTH * 0.1;
    const dx = dir === "left" ? stepPx : -stepPx;
    console.log({ svg: !!svg, zoom: !!zoom });
    d3.select(svg).call(zoom.translateBy as any, dx, 0);
  };

  const reset = () => {
    setXDomain(xDOMAIN);
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
    baseXDomainRef.current = xDomain;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .on("zoom", (event) => {
        const base = baseXDomainRef.current;
        const baseScale = d3.scaleLinear().domain(base).range([0, INNER_WIDTH]);
        const nextDomain = event.transform
          .rescaleX(baseScale)
          .domain() as Domain;

        setXDomain(nextDomain);
      });

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

    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", nextUrl);
    if (
      !xAxisGroupRef.current ||
      !yAxisGroupRef.current ||
      !plotGroupRef.current
    )
      return;
    const xScale = d3.scaleLinear().domain(xDomain).range([0, INNER_WIDTH]);
    xScaleRef.current = xScale;
    const yScale = d3.scaleLinear().domain([-1, 1]).range([INNER_HEIGHT, 0]);
    yScaleRef.current = yScale;

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
  }, [xDomain]);

  return { panBy, zoomBy, sinSvgRef, reset };
};
