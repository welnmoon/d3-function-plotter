import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import type { Domain, Point } from "../model/types";
import {
  INNER_HEIGHT,
  INNER_WIDTH,
  GRAPH_MAX_HEIGHT,
  GRAPH_MAX_WIDTH,
  ZOOM_IN,
  ZOOM_OUT,
  xDOMAIN,
  yDOMAIN,
} from "../model/const";
import { sinData, tanData } from "../model/data";
import { MoveLeft, MoveRight, ZoomIn, ZoomOut } from "lucide-react";

const ChartTan = () => {
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

  const xDomainRef = useRef<Domain>(xDOMAIN);
  const baseXDomainRef = useRef<Domain>(xDOMAIN);
  const yDomainRef = useRef<Domain>(yDOMAIN);
  const baseYDomainRef = useRef<Domain>(yDOMAIN);

  // --------------- state ------------------

  const [xDomain, setXDomain] = useState<Domain>(xDOMAIN);
  const [yDomain, setYDomain] = useState<Domain>(yDOMAIN);

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

    xDomainRef.current = xDomain;
    yDomainRef.current = yDomain;
    baseXDomainRef.current = xDomain;
    baseYDomainRef.current = yDomain;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .on("zoom", (event) => {
        console.log("transform K:", event.transform.k);
        const baseX = baseXDomainRef.current;
        const baseY = baseYDomainRef.current;
        const baseXScale = d3
          .scaleLinear()
          .domain(baseX)
          .range([0, INNER_WIDTH]);
        const baseYScale = d3
          .scaleLinear()
          .domain(baseY)
          .range([INNER_HEIGHT, 0]);
        const nextXDomain = event.transform
          .rescaleX(baseXScale)
          .domain() as Domain;
        const nextYDomain = event.transform
          .rescaleY(baseYScale)
          .domain() as Domain;

        // setXDomain((prev) => {
        //   const span = nextXDomain[1] - nextXDomain[0];
        //   if (span > ZOOM_OUT || span < ZOOM_IN) return prev;
        //   return nextXDomain;
        // });
        setXDomain(nextXDomain);
        setYDomain(nextYDomain);

        // setYDomain((prev) => {
        //   const span = nextYDomain[1] - nextYDomain[0]; // Берем не prev а nextYDomain так как проверяем следующий домен а не текущий.
        //   if (span > ZOOM_OUT || span < ZOOM_IN) return prev;
        //   return nextYDomain;
        // });
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
    xScaleRef.current = xScale;
    const yScale = d3.scaleLinear().domain(yDomain).range([INNER_HEIGHT, 0]);
    yScaleRef.current = yScale;

    const line = d3
      .line<Point>()
      .defined(
        (d) => Number.isFinite(d.y) && d.y >= yDomain[0] && d.y <= yDomain[1],
      )

      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    xAxisGroupRef.current
      .call(d3.axisBottom(xScale))
      .attr("transform", `translate(0,${INNER_HEIGHT / 2})`);
    yAxisGroupRef.current.call(d3.axisLeft(yScale));

    plotGroupRef.current
      .selectAll("path")
      .data([tanData(xDomain)])
      .join("path")
      .attr("class", "plot-line tan")
      .attr("fill", "none")
      .attr("d", line);
  }, [yDomain, xDomain]);

  // ----------- JSX -----------------
  return (
    <main>
      <h1>Tan (X)</h1>
      <section className="chartPage">
        <svg
          className="chartSvg"
          ref={svgRef}
          width={GRAPH_MAX_WIDTH}
          height={GRAPH_MAX_HEIGHT}
        />

        <div className="chartButtons">
          <button onClick={() => panBy("left")}>
            <MoveLeft size={15} />
          </button>
          <button onClick={() => panBy("right")}>
            <MoveRight size={15} />
          </button>

          <button onClick={() => zoomBy(1.2)}>
            <ZoomIn size={15} />
          </button>
          <button onClick={() => zoomBy(1 / 1.2)}>
            <ZoomOut size={15} />
          </button>
        </div>
      </section>
    </main>
  );
};

export default ChartTan;
