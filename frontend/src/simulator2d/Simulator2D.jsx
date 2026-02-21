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
    <div className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      
      {/* 1. O HUD (TrainingHUD) agora recebe os dados em tempo real */}
      <TrainingHUD 
        pathCount={instrument.path.length} 
        timer={started ? metrics.getElapsedTime() : "00:00"}
        errors={started ? metrics.errors : 0}
      />

      {/* 2. Área do Simulador */}
      <div
        className="relative cursor-crosshair rounded-xl overflow-hidden border-4 border-slate-800 shadow-2xl"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMouse({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          });
        }}
        onClick={() => {
          if (!started) {
            metrics.reset();
            instrument.path = []; // Limpa o rastro anterior ao começar de novo
            setStarted(true);
            console.log("🚀 Telemetria Iniciada...");
          }
        }}
      >
        {/* O CanvasStage para correção do loop() */}
        <CanvasStage onFrame={onFrame} />

        {/* Overlay de Início */}
        {!started && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <p className="text-white font-mono animate-pulse text-lg">
              CLIQUE NO RIM PARA INICIAR PROCEDIMENTO
            </p>
          </div>
        )}
      </div>

      {/* 3. Painel de Controle de Auditoria (Baixo do Canvas) */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={async () => {
            if (!started) return;
            setStarted(false); // Para as métricas
            
            // PREPARAÇÃO PARA O FABIO (Auditoria de Pontos)
            const payload = instrument.path.map(p => ({
              eixoX: Math.round(p.x),
              eixoY: Math.round(p.y),
              timestamp: Date.now(),
              dentroAlvo: p.inside
            }));

            try {
              console.log("📦 Enviando auditoria para o Backend...");
              await apiService.sendTelemetry(payload);
              alert(`Sessão Sincronizada!\nErros: ${metrics.errors}\nTremor Médio: ${metrics.getTremorScore()}`);
            } catch (err) {
              alert("Erro na sincronização. Verifique a conexão com o servidor Java.");
            }
          }}
          disabled={!started || instrument.path.length === 0}
          className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full transition-all disabled:opacity-30 shadow-lg shadow-red-900/20"
        >
          ENCERRAR E ENVIAR TELEMETRIA
        </button>

        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-full transition-all"
        >
          REINICIAR
        </button>
      </div>

      {/* Log de Auditoria em tempo real (Opcional, para debug) */}
      <div className="mt-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
        Protocolo Estável // Latência: 2ms // DD-Ready
      </div>
    </div>
  );
}