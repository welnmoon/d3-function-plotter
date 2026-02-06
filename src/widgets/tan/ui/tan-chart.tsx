import { Minus, MoveLeft, MoveRight, Plus, Undo2 } from "lucide-react";
import {
  GRAPH_MAX_HEIGHT,
  GRAPH_MAX_WIDTH,
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
              const factor = e.deltaY > 0 ? 1.1 : 1 / 1.1;
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
              height: 50,
              background: "transparent",
            }}
            onWheel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const factor = e.deltaY > 0 ? 1.1 : 1 / 1.1;
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
              background: "transparent",
            }}
            onWheel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const factor = e.deltaY > 0 ? 1.1 : 1 / 1.1;
              zoomY(factor);
            }}
          />
        </div>

        <div className="chartButtons">
          <button onClick={() => panBy("left")}>
            <MoveLeft size={15} />
          </button>
          <button onClick={() => panBy("right")}>
            <MoveRight size={15} />
          </button>

          <button onClick={() => zoomBoth(1.2)}>
            <Plus size={15} />
          </button>
          <button onClick={() => zoomBoth(1 / 1.2)}>
            <Minus size={15} />
          </button>
          <button onClick={() => reset()}>
            <Undo2 size={15} />
          </button>
        </div>
      </section>
    </main>
  );
};

export default TanChart;
