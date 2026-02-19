import { useEffect, useRef, useState } from "react";
import { apiService } from "../services/apiService";
import { useTrainingSession } from "../contexts/TrainingSessionContext";

export default function RenalCanvas() {
  const canvasRef = useRef(null);
  const { session } = useTrainingSession();
  const [path, setPath] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Configuração do Alvo (Rim)
  const KIDNEY_TARGET = { x: 650, y: 250, radiusX: 80, radiusY: 120 };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = 900;
    canvas.height = 500;

    const drawScene = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. DESENHO DO RIM (Efeito 3D com Gradiente)
      const gradient = ctx.createRadialGradient(
        KIDNEY_TARGET.x - 20, KIDNEY_TARGET.y - 40, 10,
        KIDNEY_TARGET.x, KIDNEY_TARGET.y, 120
      );
      gradient.addColorStop(0, "#ff4d4d"); // Brilho interno
      gradient.addColorStop(1, "#660000"); // Sombra externa

      ctx.fillStyle = gradient;
      ctx.shadowBlur = 30;
      ctx.shadowColor = "rgba(153, 0, 0, 0.5)";
      ctx.beginPath();
      ctx.ellipse(KIDNEY_TARGET.x, KIDNEY_TARGET.y, KIDNEY_TARGET.radiusX, KIDNEY_TARGET.radiusY, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. BRAÇO ROBÓTICO VIRTUAL (Linha de conexão)
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(100, 116, 139, 0.5)"; // Cor metálica
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 500); // Base do braço no canto inferior
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
      
      // Ponteira do instrumento
      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // 3. RASTRO DE TELEMETRIA (Dinâmico: Verde/Vermelho)
      path.forEach((p, i) => {
        if (i === 0) return;
        const prev = path[i - 1];
        
        // Lógica de Colisão simples (dentro ou fora da elipse)
        const dx = (p.x - KIDNEY_TARGET.x) / KIDNEY_TARGET.radiusX;
        const dy = (p.y - KIDNEY_TARGET.y) / KIDNEY_TARGET.radiusY;
        const isInside = (dx * dx + dy * dy) <= 1;

        ctx.strokeStyle = isInside ? "#22c55e" : "#ef4444";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      });
    };

    drawScene();
  }, [path, mousePos]);

  const handleMove = (e) => {
    if (isFinished) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    
    setMousePos({ x, y });

    const lastPoint = path[path.length - 1];
    if (!lastPoint || Math.abs(x - lastPoint.x) > 2 || Math.abs(y - lastPoint.y) > 2) {
      const newPoint = { x, y, t: Date.now() };
      const newPath = [...path, newPoint];
      setPath(newPath);
      localStorage.setItem("justina_draft_session", JSON.stringify({ path: newPath }));
    }
  };

  const handleFinish = async () => {
    if (path.length === 0) return;
    setIsFinished(true);
    setIsSending(true);
    
    // Simula o cálculo de precisão para o vídeo
    const pointsInside = path.filter(p => {
        const dx = (p.x - KIDNEY_TARGET.x) / KIDNEY_TARGET.radiusX;
        const dy = (p.y - KIDNEY_TARGET.y) / KIDNEY_TARGET.radiusY;
        return (dx * dx + dy * dy) <= 1;
    }).length;

    const precision = ((pointsInside / path.length) * 100).toFixed(1);

    const payload = {
      sessionId: session?.id || "LOCAL_TEST",
      telemetry: path,
      metrics: { precision }
    };

    try {
      await apiService.sendTelemetry(payload);
      localStorage.removeItem("justina_draft_session");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 max-w-fit mx-auto font-sans">
      <div className="w-full flex justify-between items-center px-4 py-3 bg-slate-800/50 rounded-t-xl border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-500 animate-pulse rounded-full"></div>
          <span className="text-slate-300 text-[10px] font-mono uppercase tracking-[0.2em] font-bold">
            Simulador Justina // Telemetria Ativa
          </span>
        </div>
      </div>

      <div className="relative border-2 border-slate-700 rounded-xl overflow-hidden bg-slate-950 shadow-inner">
        <canvas 
          ref={canvasRef} 
          onMouseMove={handleMove} 
          className="cursor-none block" 
        />
        
        {isFinished && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-lg flex flex-col items-center justify-center text-center">
            <h2 className="text-4xl font-black text-blue-500 italic tracking-tighter mb-2">SESSÃO FINALIZADA</h2>
            <div className="h-1 w-20 bg-blue-500 mb-6"></div>
            <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Relatório enviado para o sistema</p>
            <button onClick={() => window.location.reload()} className="mt-8 px-10 py-3 bg-slate-800 hover:bg-blue-600 text-white rounded-full text-xs font-black uppercase transition-all">Reiniciar Protocolo</button>
          </div>
        )}
      </div>

      <div className="w-full flex justify-between items-end bg-slate-800/20 p-4 rounded-2xl">
        <div className="flex gap-10">
            <div className="flex flex-col">
              <span className="text-slate-500 text-[9px] uppercase font-black tracking-tighter">Captura de Pontos</span>
              <span className="text-blue-400 font-mono text-4xl font-black">{path.length}</span>
            </div>
            <div className="flex flex-col border-l border-slate-700 pl-10">
              <span className="text-slate-500 text-[9px] uppercase font-black tracking-tighter">Status do Instrumento</span>
              <span className="text-emerald-500 font-mono text-sm mt-2 font-bold uppercase">Ready // DD-01</span>
            </div>
        </div>
        
        <button
          onClick={handleFinish}
          disabled={isFinished || path.length === 0}
          className={`px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-tighter transition-all ${
            isFinished || path.length === 0 
            ? "bg-slate-800 text-slate-600" 
            : "bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white shadow-[0_10px_30px_rgba(220,38,38,0.3)]"
          }`}
        >
          {isSending ? "Transmitindo Dados..." : "Finalizar Procedimento"}
        </button>
      </div>
    </div>
  );
}