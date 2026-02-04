import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import type { Action, Domain, Point } from "../model/types";
import {
  graphInnerHeight,
  graphInnerWidth,
  graphMaxHeight,
  graphMaxWidth,
  PAN_FRACTION,
  ZOOM,
  ZOOM_IN,
  ZOOM_OUT,
} from "../model/const";
import { sinData } from "../model/data";
import { zoomDomain } from "../model/scales";

const Chart = () => {
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
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const xScaleRef = useRef<d3.ScaleLinear<number, number> | null>(null);
  const yScaleRef = useRef<d3.ScaleLinear<number, number> | null>(null);

  const xDomainRef = useRef<Domain>([0, 20]);
  const baseXDomainRef = useRef<Domain>([0, 20]);

  const [xDomain, setXDomain] = useState<Domain>([0, 20]);

  const updateXDomain = (action: Action) => {
    if (action.type === "pan") {
      setXDomain((prev) => {
        const span = prev[1] - prev[0];
        const step = span * PAN_FRACTION;
        return action.dir === "left"
          ? [prev[0] - step, prev[1] - step]
          : [prev[0] + step, prev[1] + step];
      });
    } else {
      setXDomain((prev) => {
        const newXDomain =
          action.dir === "in"
            ? zoomDomain(prev, 1 / ZOOM)
            : zoomDomain(prev, ZOOM);
        const span = newXDomain[1] - newXDomain[0];
        if (span > ZOOM_OUT || span < ZOOM_IN) return prev;
        return newXDomain;
      });
    }
  };

  //--------------------------------------//
  // --------- init useEffect -------- //
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
    xDomainRef.current = xDomain;
    baseXDomainRef.current = xDomain;
    const zoom = d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
      const base = baseXDomainRef.current;
      const baseScale = d3
        .scaleLinear()
        .domain(base)
        .range([0, graphInnerWidth]);
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
    zoomRef.current = zoom;
  }, []);

  //--------------------------------------//
  // --------- update useEffect -------- //
  //------------------------------------//
  useEffect(() => {
    if (
      !xAxisGroupRef.current ||
      !yAxisGroupRef.current ||
      !plotGroupRef.current
    )
      return;
    const xScale = d3.scaleLinear().domain(xDomain).range([0, graphInnerWidth]);
    xScaleRef.current = xScale;
    const yScale = d3
      .scaleLinear()
      .domain([-1, 1])
      .range([graphInnerHeight, 0]);
    yScaleRef.current = yScale;

    const line = d3
      .line<Point>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    xAxisGroupRef.current
      .call(d3.axisBottom(xScale))
      .attr("transform", `translate(0,${graphInnerHeight})`);
    yAxisGroupRef.current.call(d3.axisLeft(yScale));

    plotGroupRef.current
      .selectAll("path")
      .data([sinData(xDomain)])
      .join("path")
      .attr("fill", "none")
      .attr("stroke", "tomato")
      .attr("d", line);
  }, [xDomain]);

  return (
    <>
      <svg ref={svgRef} width={graphMaxWidth} height={graphMaxHeight} />
      <button onClick={() => updateXDomain({ type: "pan", dir: "right" })}>
        right
      </button>
      <button onClick={() => updateXDomain({ type: "pan", dir: "left" })}>
        left
      </button>

      <button onClick={() => updateXDomain({ type: "zoom", dir: "in" })}>
        zoom in
      </button>
      <button onClick={() => updateXDomain({ type: "zoom", dir: "out" })}>
        zoom out
      </button>
    </>
  );
};

export default Chart;
