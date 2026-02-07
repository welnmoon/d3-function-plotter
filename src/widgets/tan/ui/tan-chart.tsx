import {
  ArrowUp,
  Minus,
  MoveDown,
  MoveLeft,
  MoveRight,
  MoveUp,
  Plus,
  Undo2,
} from "lucide-react";
import {
  GRAPH_MAX_HEIGHT,
  GRAPH_MAX_WIDTH,
  ZOOM,
} from "../../../entities/chart/model/const";
import { useD3ZoomXY } from "../lib/use-d3-zoomXY";

const TanChart = () => {
  const { panBy, tanSvgRef, reset, zoomBoth, zoomX, zoomY } = useD3ZoomXY();

  return (
    <main>
      <section className="chartPage">
        <div style={{ position: "relative" }}>
          <svg
            onWheel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const factor = e.deltaY > 0 ? 1 / ZOOM : ZOOM;
              zoomBoth(factor);
            }}
            className="chartSvg"
            ref={tanSvgRef}
            width={GRAPH_MAX_WIDTH}
            height={GRAPH_MAX_HEIGHT}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "45%",
              width: "100%",
              height: 20,
              background: "transparent",
              cursor: "ns-resize",
            }}
            title="Scroll to zoom X axis"
            onWheel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const factor = e.deltaY > 0 ? 1 / ZOOM : ZOOM;
              zoomX(factor);
            }}
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
          <button onClick={() => panBy("up")} title="Pan top">
            <MoveUp size={15} />
          </button>
          <button onClick={() => panBy("down")} title="Pan bottom">
            <MoveDown size={15} />
          </button>

          <button onClick={() => zoomBoth(1.2)} title="Zoom in (both axes)">
            <Plus size={15} />
          </button>
          <button
            onClick={() => zoomBoth(1 / 1.2)}
            title="Zoom out (both axes)"
          >
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

export default TanChart;
