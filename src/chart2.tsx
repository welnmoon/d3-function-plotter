import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

type Domain = [number, number];
type Point = { x: number; y: number };

type PanDir = "left" | "right";
type ZoomDir = "in" | "out";

type Action = { type: "pan"; dir: PanDir } | { type: "zoom"; dir: ZoomDir };

const graphMaxHeight = 400;
const graphMaxWidth = 900;
const margin = { top: 20, right: 30, bottom: 30, left: 40 };
const innerHeight = graphMaxHeight - margin.top - margin.bottom;
const innerWidth = graphMaxWidth - margin.left - margin.right;
const N = 300;

const sinData = (xDomain: Domain): Point[] =>
  d3.range(N).map((i) => {
    const x = xDomain[0] + (i / (N - 1)) * (xDomain[1] - xDomain[0]);
    return { x, y: Math.sin(x) };
  });

//--------------//
//  Component  //
//------------//

const Chart2 = () => {
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

  const [xDomain, setXDomain] = useState<Domain>([0, 20]);

  const updateXDomain = (action: Action) => {
    if (action.type === "pan") {
      action.dir === "left"
        ? setXDomain((prev) => [prev[0] + 1, prev[1] + 1])
        : setXDomain((prev) => [prev[0] - 1, prev[1] - 1]);
    }
  };

  //--------------------------------------//
  // --------- init useEffect -------- //
  //------------------------------------//
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (svg.select("g.main").node()) return;

    const mainGroup = svg
      .append("g")
      .attr("transform", `translate(30, 20)`)
      .attr("class", "main");
    const xAxisGroup = mainGroup.append("g").attr("class", "x-axis");
    const yAxisGroup = mainGroup.append("g").attr("class", "y-axis");
    const plotGroup = mainGroup.append("g").attr("class", "plot"); // Как он поймет какой у него размер? - Я думаю что ему не нужно определять размер, так как это группа находится в main группе как и все.

    xAxisGroupRef.current = xAxisGroup;
    yAxisGroupRef.current = yAxisGroup;
    plotGroupRef.current = plotGroup;
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
    const xScale = d3.scaleLinear().domain(xDomain).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([-1, 1]).range([innerHeight, 0]);

    const line = d3
      .line<Point>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    xAxisGroupRef.current
      .call(d3.axisBottom(xScale))
      .attr("transform", `translate(0,${innerHeight})`);
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
    </>
  );
};

export default Chart2;
