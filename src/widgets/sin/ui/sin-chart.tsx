import { Minus, MoveLeft, MoveRight, Plus, Undo2 } from "lucide-react";
import {
  GRAPH_MAX_HEIGHT,
  GRAPH_MAX_WIDTH,
  ZOOM,
} from "../../../entities/chart/model/const";
import { useD3ZoomX } from "../lib/use-d3-zoomX";

const SinChart = () => {
  const { panBy, reset, zoomX, sinSvgRef, zoomY } = useD3ZoomX();

  return (
    <main>
      <section className="chartPage">
        <div style={{ position: "relative" }}>
          <svg
            onWheel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const factor = e.deltaY > 0 ? 1 / ZOOM : ZOOM;
              zoomX(factor);
            }}
            className="chartSvg"
            ref={sinSvgRef}
            width={GRAPH_MAX_WIDTH}
            height={GRAPH_MAX_HEIGHT}
          />

          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 50,
              height: "100%",
              cursor: "ew-resize",
              background: "transparent",
            }}
            title="Scroll to zoom Y axis"
            onWheel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const factor = e.deltaY > 0 ? 1 / ZOOM : ZOOM;
              zoomY(factor);
            }}
          />
        </div>

        <div className="chartButtons">
          <button onClick={() => panBy("left")} title="Pan left">
            <MoveLeft size={15} />
          </button>
          <button onClick={() => panBy("right")} title="Pan right">
            <MoveRight size={15} />
          </button>

          <button onClick={() => zoomX(1.2)} title="Zoom in">
            <Plus size={15} />
          </button>
          <button onClick={() => zoomX(1 / 1.2)} title="Zoom out">
            <Minus size={15} />
          </button>
          <button onClick={() => reset()} title="Reset view">
            <Undo2 size={15} />
          </button>
        </div>
      </section>
    </main>
  );
};

export default SinChart;
