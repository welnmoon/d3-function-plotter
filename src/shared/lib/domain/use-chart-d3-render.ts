import { useEffect } from "react";
import { INNER_HEIGHT, INNER_WIDTH } from "../../../entities/chart/model/const";

import * as d3 from "d3";
import type {
  Domain,
  Point,
  Variant,
} from "../../../entities/chart/model/types";
import { sinData, tanData } from "../../../entities/chart/model/data";

interface Params {
  xAxisGroupRef: React.RefObject<d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  > | null>;
  yAxisGroupRef: React.RefObject<d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  > | null>;
  plotGroupRef: React.RefObject<d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  > | null>;
  xDomain: Domain;
  yDomain: Domain;
  lastDomainForUrlRef: React.RefObject<{ x: Domain; y: Domain }>;
  variant: Variant;
}

// Этот хук рисует график
export const useChartD3Render = ({
  plotGroupRef,
  xAxisGroupRef,
  yAxisGroupRef,
  xDomain,
  yDomain,
  lastDomainForUrlRef,
  variant,
}: Params) => {
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
        return true;
      })
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    xAxisGroupRef.current
      .call(d3.axisBottom(xScale))
      .attr("transform", `translate(0,${yScale(0)})`);
    yAxisGroupRef.current.call(d3.axisLeft(yScale));

    const renderData =
      variant === "sin" ? sinData(xDomain) : tanData(xDomain, INNER_WIDTH, 2);

    plotGroupRef.current
      .selectAll("path")
      .data([renderData])
      .join("path")
      .attr("class", "plot-line tan")
      .attr("fill", "none")
      .attr("d", line);

    lastDomainForUrlRef.current = {
      x: xDomain,
      y: yDomain,
    };
  }, [xDomain, yDomain]);
};
