import { useCallback, useState } from "react";
import CanvasStage from "./CanvasStage";
import { createInstrument } from "./Instrument";
import { createTargetZone } from "./TargetZone";
import { createMetrics } from "./MetricsEngine";

const instrument = createInstrument();
const target = createTargetZone();
const metrics = createMetrics();

export default function Simulator2D() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [started, setStarted] = useState(false);

  const onFrame = useCallback((ctx) => {
    target.draw(ctx);

    const isInside = target.contains(mouse.x, mouse.y);

    instrument.update(mouse.x, mouse.y, isInside);
    instrument.drawPath(ctx);
    instrument.draw(ctx);

    // ⚠️ Só atualiza métricas se iniciou
    if (started) {
      metrics.update(isInside, instrument.path);
    }

    ctx.fillStyle = "black";
    ctx.fillText(`Tempo: ${started ? metrics.getElapsedTime() : 0}s`, 10, 20);
    ctx.fillText(`Erros: ${started ? metrics.errors : 0}`, 10, 40);
    ctx.fillText(`Tremor: ${started ? metrics.getTremorScore() : 0}`, 10, 60);
    ctx.fillText(
      `Velocidade: ${started ? metrics.lastSpeed.toFixed(2) : 0}`,
      10,
      80
    );
    ctx.fillText(`Excessos: ${started ? metrics.speedViolations : 0}`, 10, 100);

    if (!started) {
      ctx.fillText("Clique para iniciar", 300, 250);
    }
  }, [mouse, started]);

  return (
    <div
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMouse({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }}
      onClick={() => {
        if (!started) {
          metrics.reset(); // 👈 importante
          setStarted(true);
        }
      }}
    >
      <CanvasStage onFrame={onFrame} />
    </div>
  );
}
