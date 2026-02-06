import {
  GRAPH_MAX_HEIGHT,
  GRAPH_MAX_WIDTH,
} from "../../../entities/chart/model/const";
import { useD3ZoomX } from "../lib/use-d3-zoomX";
import { Minus, MoveLeft, MoveRight, Plus, Undo2 } from "lucide-react";

const SinChart = () => {
  const { panBy, zoomBy, sinSvgRef } = useD3ZoomX();
  return (
    <main>
      <section className="chartPage">
        <svg
          className="chartSvg"
          ref={sinSvgRef}
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
            <Plus size={15} />
          </button>
          <button onClick={() => zoomBy(1 / 1.2)}>
            <Minus size={15} />
          </button>
          <button onClick={() => zoomBy(1 / 1.2)}>
            <Undo2 size={15} />
          </button>
        </div>
      </section>
    </main>
  );
};

export default SinChart;
