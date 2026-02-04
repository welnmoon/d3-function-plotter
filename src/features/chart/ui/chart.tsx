import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import type { Action, Domain, Point } from "../model/types";
import {
  INNER_HEIGHT,
  INNER_WIDTH,
  GRAPH_MAX_HEIGHT,
  GRAPH_MAX_WIDTH,
  PAN_FRACTION,
  ZOOM,
  ZOOM_IN,
  ZOOM_OUT,
} from "../model/const";
import { sinData } from "../model/data";
import { zoomDomain } from "../model/scales";

const Chart = () => {
  // --------------- refs ------------------
  const svgRef = useRef<SVGSVGElement | null>(null);
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

  const xDomainRef = useRef<Domain>([0, 20]);
  const baseXDomainRef = useRef<Domain>([0, 20]);

  // --------------- state ------------------

  const [xDomain, setXDomain] = useState<Domain>([0, 20]);

  const zoomBy = (zoomFactor: number) => {
    const svg = svgRef.current;
    const zoom = zoomBehaviorRef.current;
    if (!svg || !zoom) return;
    d3.select(svg).call(zoom.scaleBy as any, zoomFactor);
  };

  const panBy = (dir: "left" | "right") => {
    const svg = svgRef.current;
    const zoom = zoomBehaviorRef.current;
    if (!svg || !zoom) return;

    const stepPx = INNER_WIDTH * 0.1;
    const dx = dir === "left" ? stepPx : -stepPx;

    d3.select(svg).call(zoom.translateBy as any, dx, 0);
  };

  //--------------------------------------//
  // --------- init effect ------------- //
  //------------------------------------//
  useEffect(() => {
    const node = svgRef.current;
    if (!node) return;
    const svg = d3.select(node);
    if (svg.select("g.main").node()) return;

    const mainGroup = svg
      .append("g")
      .attr("transform", `translate(30, 20)`)
      .attr("class", "main");
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

    const zoom = d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
      const base = baseXDomainRef.current;
      const baseScale = d3.scaleLinear().domain(base).range([0, INNER_WIDTH]);
      const nextDomain = event.transform.rescaleX(baseScale).domain() as Domain;

      setXDomain((prev) => {
        const span = nextDomain[1] - nextDomain[0];
        if (span > ZOOM_OUT || span < ZOOM_IN) return prev;
        return nextDomain;
      });
    });

    svg.call(zoom);
    xAxisGroupRef.current = xAxisGroup;
    yAxisGroupRef.current = yAxisGroup;
    plotGroupRef.current = plotGroup;
    zoomBehaviorRef.current = zoom;
  }, []);

  //--------------------------------------//
  // --------- update effect -------- //
  //------------------------------------//
  useEffect(() => {
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
      .attr("transform", `translate(0,${INNER_HEIGHT})`);
    yAxisGroupRef.current.call(d3.axisLeft(yScale));

    plotGroupRef.current
      .selectAll("path")
      .data([sinData(xDomain)])
      .join("path")
      .attr("fill", "none")
      .attr("stroke", "tomato")
      .attr("d", line);
  }, [xDomain]);

  // ----------- JSX -----------------
  return (
    <>
      <svg ref={svgRef} width={GRAPH_MAX_WIDTH} height={GRAPH_MAX_HEIGHT} />
      <button onClick={() => panBy("right")}>right</button>
      <button onClick={() => panBy("left")}>left</button>

      <button onClick={() => zoomBy(1.2)}>zoom in</button>
      <button onClick={() => zoomBy(1 / 1.2)}>zoom out</button>
    </>
  );
};

export default Chart;
