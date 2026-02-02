import { useEffect, useRef } from "react";
import * as d3 from "d3";

type Datum = { x: number; y: number };

const data: Datum[] = [
  { x: 0, y: 5 },
  { x: 10, y: 20 },
  { x: 20, y: 10 },
  { x: 30, y: 35 },
  { x: 40, y: 25 },
  { x: 50, y: 45 },
];

const Chart = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const svgWidth = 900;
  const svgHeight = 500;

  useEffect(() => {
    if (!svgRef.current) return;

    const margin = { top: 20, right: 20, bottom: 40, left: 60 };

    const innerWidth = svgWidth - margin.left - margin.right;
    const innerHeight = svgHeight - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // g.append("rect")
    //   .attr("width", innerWidth)
    //   .attr("height", innerHeight)
    //   .attr("fill", "none")
    //   .attr("stroke", "black");

    const xScale = d3.scaleLinear().domain([0, 10]).range([0, 700]);
    const xAxisG = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`);
    xAxisG.call(d3.axisBottom(xScale));

    const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);
    const yAxisG = g.append("g").attr("transform", "translate(0, 0)");
    yAxisG.call(d3.axisLeft(yScale));

    //     const xScale = d3
    //       .scaleLinear()
    //       .domain(d3.extent(data, (d) => d.x) as [number, number])
    //       .nice()
    //       .range([0, innerWidth]);

    //     const yScale = d3
    //       .scaleLinear()
    //       .domain(d3.extent(data, (d) => d.y) as [number, number])
    //       .nice()
    //       .range([innerHeight, 0]);

    //     const xAxis = d3.axisBottom(xScale);
    //     const yAxis = d3.axisLeft(yScale);

    //     g.append("g").attr("transform", `translate(0,${innerHeight})`).call(xAxis);
    //     g.append("g").call(yAxis);

    //     g.selectAll("circle")
    //       .data(data)
    //       .join("circle")
    //       .attr("cx", (d) => xScale(d.x))
    //       .attr("cy", (d) => yScale(d.y))
    //       .attr("r", 5)
    //       .attr("fill", "steelblue");
  });

  return (
    <>
      <svg ref={svgRef} width={svgWidth} height={svgHeight} />
    </>
  );
};

export default Chart;
