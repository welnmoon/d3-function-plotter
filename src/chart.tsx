import { useEffect, useRef } from "react";
import * as d3 from "d3";

type Datum = { x: number; y: number };

const data: Datum[] = [
  { x: 0, y: 5 },
  { x: 10, y: 2 },
  { x: 21, y: 10 },
  { x: 30, y: 35 },
  { x: 40, y: 25 },
  { x: 50, y: 45 },
];

const data2: Datum[] = data.map((p) => ({ x: p.x, y: 100 - p.y }));

const Chart = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const svgWidth = 900;
  const svgHeight = 500;

  useEffect(() => {
    if (!svgRef.current) return;
    console.log("Use effect started", svgRef);

    const margin = { top: 20, right: 20, bottom: 40, left: 60 };

    const innerWidth = svgWidth - margin.left - margin.right;
    const innerHeight = svgHeight - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    const root = svg.select<SVGGElement>("g.root");
    console.log("root g", root);
    const g = root.empty()
      ? svg
          .append("g")
          .attr("class", "root")
          .attr("transform", `translate(${margin.left},${margin.top})`)
      : root;

    // const xMax = d3.max(data, (d) => d.x) ?? 0;
    // const yMax = d3.max(data, (d) => d.y) ?? 0;

    const [xMin, xMax] = d3.extent(data, (d) => d.x) as [number, number];
    const [yMin, yMax] = d3.extent(data, (d) => d.y) as [number, number];

    const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, innerWidth]);
    const xAxisG = g.select<SVGGElement>("g.xAxisG").empty()
      ? g
          .append("g")
          .attr("transform", `translate(0,${innerHeight})`)
          .attr("class", "xAxisG")
      : g.select<SVGGElement>("g.xAxisG");

    xAxisG.call(d3.axisBottom(xScale));

    const yScale = d3
      .scaleLinear()
      .domain([yMin, yMax])
      .range([innerHeight, 0]);
    const yAxisG = g.select<SVGGElement>("g.yAxisG").empty()
      ? g.append("g").attr("class", "yAxisG")
      : g.select<SVGGElement>("g.yAxisG");
    yAxisG.call(d3.axisLeft(yScale));

    const line = d3
      .line<Datum>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    const plotG = g.select<SVGGElement>("g.plot").empty()
      ? g.append("g").attr("class", "plot")
      : g.select<SVGGElement>("g.plot");
    plotG
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 4)
      .attr("fill", "steelblue")
      .attr("stroke", "blue");

    plotG
      .selectAll("circle2")
      .data(data2)
      .join("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 4)
      .attr("fill", "steelblue")
      .attr("stroke", "blue");

    plotG
      .selectAll("path.line")
      .data([data])
      .join("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("d", line);

    plotG
      .selectAll("path.line2")
      .data([data2])
      .join("path")
      .attr("class", "line2")
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("d", line);
  }, []);

  return (
    <>
      <svg ref={svgRef} width={svgWidth} height={svgHeight} />
    </>
  );
};

export default Chart;
