import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { Domain, Point } from "../../../entities/chart/model/types";
import {
  INNER_HEIGHT,
  INNER_WIDTH,
  MAX_SPAN,
  MIN_SPAN,
  xDOMAIN,
  yDOMAIN,
} from "../../../entities/chart/model/const";
import { tanData } from "../../../entities/chart/model/data";
import { parseDomain, writeUrl } from "../../../shared/lib/domain-url";
import { zoomDomain } from "../../../shared/lib/zoom-domain";

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

    // const { x, y } = lastDomainForUrlRef.current;
    writeUrl(xDomain, yDomain);
    setIsZooming(false);
  }, [xDomain, yDomain, isZooming]);

  //--------------------------------------//
  // --------- helpers ----------------- //
  //------------------------------------//

  const panBy = (dir: "left" | "right" | "up" | "down") => {
    const svg = tanSvgRef.current;
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

  const zoomBoth = (zoomFactor: number) => {
    setIsZooming(true);
    setXDomain((d) =>
      zoomDomain(d, zoomFactor, { minSpan: MIN_SPAN, maxSpan: MAX_SPAN }),
    );
    setYDomain((d) =>
      zoomDomain(d, zoomFactor, { minSpan: MIN_SPAN, maxSpan: MAX_SPAN }),
    );
  };

  const zoomX = (factor: number) => {
    setIsZooming(true);
    setXDomain((d) =>
      zoomDomain(d, factor, { minSpan: MIN_SPAN, maxSpan: MAX_SPAN }),
    );
  };

  const zoomY = (factor: number) => {
    setIsZooming(true);
    setYDomain((d) =>
      zoomDomain(d, factor, { minSpan: MIN_SPAN, maxSpan: MAX_SPAN }),
    );
  };

  const reset = () => {
    setXDomain(xDOMAIN);
    setYDomain(yDOMAIN);

    lastTransformRef.current = d3.zoomIdentity;

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
    console.log("x from url: ", xFromUrl);
    setXDomain(startX);
    setYDomain(startY);
    console.log("x in state: ", xDomain);
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
    const yScale = d3.scaleLinear().domain(yDomain).range([INNER_HEIGHT, 0]);

    const line = d3
      .line<Point>()
      .defined((d) => {
        if (!Number.isFinite(d.y)) return false;
        const yMin = Math.min(yDomain[0], yDomain[1]);
        const yMax = Math.max(yDomain[0], yDomain[1]);
        return d.y >= yMin && d.y <= yMax;
      })
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    xAxisGroupRef.current
      .call(d3.axisBottom(xScale))
      .attr("transform", `translate(0,${yScale(0)})`);
    yAxisGroupRef.current.call(d3.axisLeft(yScale));

    plotGroupRef.current
      .selectAll("path")
      .data([tanData(xDomain, INNER_WIDTH, 2)])
      .join("path")
      .attr("class", "plot-line tan")
      .attr("fill", "none")
      .attr("d", line);

    lastDomainForUrlRef.current = {
      x: xDomain,
      y: yDomain,
    };
  }, [xDomain, yDomain]);

  return { panBy, tanSvgRef, reset, zoomBoth, zoomX, zoomY };
};
