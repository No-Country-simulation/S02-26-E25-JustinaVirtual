import { useCallback, useState, useRef } from "react";
import CanvasStage from "./CanvasStage";
import { createInstrument } from "./Instrument";
import { createTargetZone } from "./targetZone";
import { createMetrics } from "./MetricsEngine";
import { apiService } from "../../services/apiService";
import { useTrainingSession } from "../../contexts/TrainingSessionContext";
import TrainingHUD from "../components/hud/TrainingHUD";

const instrument = createInstrument();
const target = createTargetZone();
const metrics = createMetrics();

export default function Simulator2D() {
  const { session } = useTrainingSession();
  const [started, setStarted] = useState(false);
  
  // 🔥 CORREÇÃO: useRef para evitar que o mouse trave a renderização do React
  const mouseRef = useRef({ x: 0, y: 0 });

  const onFrame = useCallback((ctx) => {
    target.draw(ctx);

    // Usa a referência do mouse (estável) em vez do estado (instável)
    const { x, y } = mouseRef.current;
    const isInside = target.contains(x, y);

    instrument.update(x, y, isInside);
    instrument.drawPath(ctx);
    instrument.draw(ctx);

    if (started) {
      metrics.update(isInside, instrument.path);
    }

    // Estilização do Log de Debug no Canvas
    ctx.font = "12px monospace";
    ctx.fillStyle = "#4ade80";
    ctx.fillText(`Tempo: ${started ? metrics.getElapsedTime() : 0}s`, 10, 25);
    ctx.fillText(`Erros: ${started ? metrics.errors : 0}`, 10, 45);
    ctx.fillText(`Tremor: ${started ? metrics.getTremorScore() : 0}`, 10, 65);
    
    if (!started) {
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText("CLIQUE PARA INICIAR", 450, 275);
    }
  }, [started]); // Removemos 'mouse' das dependências para destravar o loop

  const handleFinish = async () => {
    if (!started) return;
    setStarted(false);

    // 🚀 AJUSTE DE INTEGRAÇÃO: Mapeamento compatível com a sua IA
    const payload = instrument.path.map(p => ({
      usuarioId: session?.id || session?.sessionId || "sessao-emergencia-001",
      eixoX: Math.round(p.x),
      eixoY: Math.round(p.y),
      eixoZ: 0, // Necessário para o DTO da IA
      tempo: new Date().toISOString() // Formato ISO que o Python exige
    }));

    try {
      console.log("📦 Sincronizando com a IA de Auditoria...");
      const feedback = await apiService.sendTelemetry(payload);
      alert(`Sucesso! Precisão IA: ${feedback.precisao || "Processada"}\nErros: ${metrics.errors}`);
    } catch (err) {
      console.error(err);
      alert("Falha na sincronização. Verifique se o servidor IA está ativo.");
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      
      <TrainingHUD 
        pathCount={instrument.path.length} 
        timer={started ? metrics.getElapsedTime() : "00:00"}
      />

      <div
        className="relative cursor-none rounded-xl overflow-hidden border-4 border-slate-800 shadow-2xl"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          // Atualiza a Ref sem disparar re-render do componente
          mouseRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          };
        }}
        onClick={() => {
          if (!started) {
            metrics.reset();
            instrument.path = [];
            setStarted(true);
          }
        }}
      >
        <CanvasStage onFrame={onFrame} />

        {!started && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <p className="text-white font-mono animate-pulse text-lg border-2 border-white/20 p-4">
              CLIQUE NO RIM PARA INICIAR PROCEDIMENTO
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={handleFinish}
          disabled={!started || instrument.path.length === 0}
          className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl transition-all disabled:opacity-30 shadow-xl"
        >
          ENCERRAR E ENVIAR TELEMETRIA
        </button>

        <button 
          onClick={() => window.location.reload()}
          className="px-10 py-4 bg-slate-700 hover:bg-slate-600 text-white font-black rounded-xl transition-all"
        >
          REINICIAR
        </button>
      </div>
    </div>
  );
}