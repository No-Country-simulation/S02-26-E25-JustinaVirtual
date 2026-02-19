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

  const KIDNEY_TARGET = { x: 650, y: 250, radiusX: 80, radiusY: 120 };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = 900;
    canvas.height = 500;

    const drawScene = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. O RIM (Gradiente para efeito 3D)
      const gradient = ctx.createRadialGradient(
        KIDNEY_TARGET.x - 20, KIDNEY_TARGET.y - 40, 10,
        KIDNEY_TARGET.x, KIDNEY_TARGET.y, 120
      );
      gradient.addColorStop(0, "#ff4d4d");
      gradient.addColorStop(1, "#660000");

      ctx.fillStyle = gradient;
      ctx.shadowBlur = 30;
      ctx.shadowColor = "rgba(153, 0, 0, 0.5)";
      ctx.beginPath();
      ctx.ellipse(KIDNEY_TARGET.x, KIDNEY_TARGET.y, KIDNEY_TARGET.radiusX, KIDNEY_TARGET.radiusY, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. BRAÇO ROBÓTICO (O "link" metálico)
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(100, 116, 139, 0.3)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 500); 
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();

      // 3. RASTRO DE TELEMETRIA (Efeito de Cauda Curta)
      const maxVisiblePoints = 40; // Exibe apenas os últimos 40 pontos
      const tail = path.slice(-maxVisiblePoints); 

      tail.forEach((p, i) => {
        if (i === 0) return;
        const prev = tail[i - 1];
        
        const dx = (p.x - KIDNEY_TARGET.x) / KIDNEY_TARGET.radiusX;
        const dy = (p.y - KIDNEY_TARGET.y) / KIDNEY_TARGET.radiusY;
        const isInside = (dx * dx + dy * dy) <= 1;

        // Efeito de fade-out (o ponto mais velho é mais transparente)
        const opacity = i / tail.length; 

        ctx.strokeStyle = isInside 
          ? `rgba(34, 197, 94, ${opacity})` 
          : `rgba(239, 68, 68, ${opacity})`;
        
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      });

      // Ponteira do Instrumento
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, 4, 0, Math.PI * 2);
      ctx.fill();
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
      setPath(prev => [...prev, newPoint]);
    }
  };

  const handleFinish = async () => {
    if (path.length === 0) return;
    setIsFinished(true);
    setIsSending(true);
    
    // Cálculo de precisão simples para o relatório
    const pointsInside = path.filter(p => {
        const dx = (p.x - KIDNEY_TARGET.x) / KIDNEY_TARGET.radiusX;
        const dy = (p.y - KIDNEY_TARGET.y) / KIDNEY_TARGET.radiusY;
        return (dx * dx + dy * dy) <= 1;
    }).length;

    const precision = ((pointsInside / path.length) * 100).toFixed(1);

    try {
      await apiService.sendTelemetry({
        sessionId: session?.id || "DEBUG_MODE",
        points: path,
        accuracy: precision
      });
    } catch (error) {
      console.error("Erro no envio:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 max-w-fit mx-auto font-sans">
      {/* HUD HEADER */}
      <div className="w-full flex justify-between items-center px-4 py-3 bg-slate-800/50 rounded-t-xl border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-500 animate-ping rounded-full"></div>
          <span className="text-slate-300 text-[10px] font-mono uppercase tracking-widest font-bold">
            JUSTINA_OS // TELEMETRIA V1.0.5
          </span>
        </div>
        <div className="text-[10px] font-mono text-slate-500 uppercase">
            X: {mousePos.x} Y: {mousePos.y}
        </div>
      </div>

      {/* ÁREA DO SIMULADOR */}
      <div className="relative border-2 border-slate-700 rounded-xl overflow-hidden bg-slate-950">
        <canvas ref={canvasRef} onMouseMove={handleMove} className="cursor-none block" />
        
        {isFinished && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-10">
            <h2 className="text-4xl font-black text-blue-500 mb-2 italic">DADOS TRANSMITIDOS</h2>
            <p className="text-slate-400 font-mono text-xs uppercase mb-8">Obrigado pela colaboração, Dr. {session?.traineeName || "Operador"}</p>
            <button onClick={() => window.location.reload()} className="px-10 py-3 bg-blue-600 text-white rounded-full text-xs font-bold uppercase hover:bg-blue-500 transition-all">Nova Sessão</button>
          </div>
        )}
      </div>

      {/* FOOTER METRICS */}
      <div className="w-full flex justify-between items-center bg-slate-800/30 p-6 rounded-2xl border border-slate-800">
        <div className="flex gap-12">
            <div className="flex flex-col">
              <span className="text-slate-500 text-[9px] uppercase font-black">Coordenadas</span>
              <span className="text-blue-400 font-mono text-3xl font-black">{path.length}</span>
            </div>
            <div className="flex flex-col border-l border-slate-700 pl-12">
              <span className="text-slate-500 text-[9px] uppercase font-black">Sistema</span>
              <span className="text-emerald-500 font-mono text-sm mt-1 font-bold uppercase">Online</span>
            </div>
        </div>
        
        <button
          onClick={handleFinish}
          disabled={isFinished || path.length === 0}
          className={`px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-tighter transition-all ${
            isFinished || path.length === 0 
            ? "bg-slate-800 text-slate-600" 
            : "bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-900/20"
          }`}
        >
          {isSending ? "Sincronizando..." : "Finalizar Simulação"}
        </button>
      </div>
    </div>
  );
}