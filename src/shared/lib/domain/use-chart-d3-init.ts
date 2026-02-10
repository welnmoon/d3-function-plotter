import { useEffect, useRef } from "react";
import {
  INNER_HEIGHT,
  INNER_WIDTH,
  xDOMAIN,
  yDOMAIN,
} from "../../../entities/chart/model/const";
import type { Domain } from "../../../entities/chart/model/types";
import * as d3 from "d3";
import { parseDomain, writeUrl } from "../url/domain-url";

interface Params {
  setXDomain: React.Dispatch<React.SetStateAction<Domain>>;
  setYDomain: React.Dispatch<React.SetStateAction<Domain>>;
  SvgRef: React.RefObject<SVGSVGElement | null>;
  xDomainRef: React.RefObject<Domain>;
  yDomainRef: React.RefObject<Domain>;
  lastTransformRef: React.RefObject<d3.ZoomTransform>;
  lastDomainForUrlRef: React.RefObject<{ x: Domain; y: Domain }>;
}

// Этот хук инициализирует refs, готовит основное поле для графика и создаем слушатель d3.zoom.
export const useChartD3Init = ({
  setXDomain,
  setYDomain,
  lastTransformRef,
  SvgRef,
  xDomainRef,
  yDomainRef,
  lastDomainForUrlRef,
}: Params) => {
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const xFromUrl = parseDomain(params.get("x"));
    const yFromUrl = parseDomain(params.get("y"));

    const startX = xFromUrl ?? xDOMAIN;
    const startY = yFromUrl ?? yDOMAIN;
    setXDomain(startX);
    setYDomain(startY);
    const node = SvgRef.current;
    if (!node) return;
    const svg = d3.select(node);
    svg.selectAll("*").remove();

    const mainGroup = svg
      .append("g")
      .attr("transform", `translate(30, 20)`)
      .attr("class", "main-tan");
    const xAxisGroup = mainGroup.append("g").attr("class", "x-axis");
    xAxisGroup
      .append("rect")
      .attr("class", "x-axis-wheel")
      .attr("x", 0)
      .attr("y", -10)
      .attr("width", INNER_WIDTH)
      .attr("height", 20)
      .attr("fill", "transparent")
      .style("cursor", "ns-resize")
      .style("pointer-events", "all")
      .append("title")
      .text("Scroll to zoom X axis");

    const yAxisGroup = mainGroup.append("g").attr("class", "y-axis");
    yAxisGroup
      .append("rect")
      .attr("class", "y-axis-wheel")
      .attr("x", -20)
      .attr("y", 0)
      .attr("width", 20)
      .attr("height", INNER_HEIGHT)
      .attr("fill", "transparent")
      .style("cursor", "ew-resize")
      .style("pointer-events", "all")
      .append("title")
      .text("Scroll to zoom Y axis");
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
    xAxisGroup.raise();
    yAxisGroup.raise();

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .filter((event) => event.type !== "wheel")
      .scaleExtent([1, 1])
      .on("zoom", (event) => {
        const prev = lastTransformRef.current;
        const current = event.transform;

        const xDiffPx = current.x - prev.x;
        const yDiffPx = current.y - prev.y;

        lastTransformRef.current = current;

        const xScale = d3
          .scaleLinear()
          .domain(xDomainRef.current)
          .range([0, INNER_WIDTH]);
        const yScale = d3
          .scaleLinear()
          .domain(yDomainRef.current)
          .range([INNER_HEIGHT, 0]);
        console.log("x diff px: ", xDiffPx);

        const dX = xScale.invert(0) - xScale.invert(xDiffPx);
        console.log("delta x: ", dX);
        const dY = yScale.invert(0) - yScale.invert(yDiffPx);

        setXDomain(([a, b]) => [a + dX, b + dX]);
        setYDomain(([a, b]) => [a + dY, b + dY]);
      })
      .on("end", () => {
        const { x, y } = lastDomainForUrlRef.current;
        writeUrl(x, y);
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

  return { xAxisGroupRef, yAxisGroupRef, plotGroupRef, zoomBehaviorRef };
};
