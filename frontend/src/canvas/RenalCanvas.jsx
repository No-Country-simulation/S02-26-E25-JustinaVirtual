import { useEffect, useRef, useState } from "react";
import { apiService } from "../services/apiService";
import { useTrainingSession } from "../contexts/TrainingSessionContext";

export default function RenalCanvas() {
  const canvasRef = useRef(null);
  const { session } = useTrainingSession(); // Pegamos a sessão real iniciada no Java
  const [path, setPath] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // --- LÓGICA DE PERSISTÊNCIA (Resiliência Hospitalar) ---
  useEffect(() => {
    const saved = localStorage.getItem("justina_draft_session");
    if (saved) {
      const { path: sPath } = JSON.parse(saved);
      if (window.confirm("Simulação anterior interrompida. Deseja recuperar os dados telemétricos?")) {
        setPath(sPath);
      } else {
        localStorage.removeItem("justina_draft_session");
      }
    }
  }, []);

  // 1. Renderização do Ambiente Cirúrgico (Canvas API)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = 900;
    canvas.height = 500;

    const drawScene = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Desenho do Rim (Alvo Cirúrgico)
      ctx.fillStyle = "#7c3aed";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#7c3aed";
      ctx.beginPath();
      ctx.ellipse(650, 250, 80, 120, 0, 0, Math.PI * 2);
      ctx.fill();

      // Desenho da Linha de Telemetria (Rastro do Mouse)
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.beginPath();
      path.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    };
    drawScene();
  }, [path]);

  // 2. Captura de Movimento com Throttling
  const handleMove = (e) => {
    if (isFinished) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    const lastPoint = path[path.length - 1];
    // Só grava se houver movimento significativo (> 2px)
    if (!lastPoint || Math.abs(x - lastPoint.x) > 2 || Math.abs(y - lastPoint.y) > 2) {
      const newPoint = { x, y, t: Date.now() };
      const newPath = [...path, newPoint];
      setPath(newPath);
      
      localStorage.setItem("justina_draft_session", JSON.stringify({
        sessionId: session?.id,
        path: newPath
      }));
    }
  };

  // 3. Finalização Real com Payload para o Backend
  const handleFinish = async () => {
    if (path.length === 0) return;
    
    setIsFinished(true);
    setIsSending(true);
    
    const payload = {
      sessionId: session?.id || "OFFLINE_SESSION",
      dni: session?.traineeId || "000",
      pointsCount: path.length,
      telemetry: path 
    };

    try {
      // Enviando para o apiService !
      await apiService.sendTelemetry(payload); 
      localStorage.removeItem("justina_draft_session");
    } catch (error) {
      console.error("Erro na telemetria:", error);
      alert("Falha ao transmitir dados. A sessão foi salva localmente.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 max-w-fit mx-auto">
      {/* HUD de Telemetria Interno */}
      <div className="w-full flex justify-between items-center px-4 py-3 bg-slate-800 rounded-t-xl border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 animate-pulse rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
          <span className="text-slate-300 text-xs font-mono uppercase tracking-widest font-bold">
            Live Telemetry: {isSending ? "Transmitting..." : "Active"}
          </span>
        </div>
        <div className="text-blue-400 text-xs font-mono">
          SESSION_ID: {session?.id || "LOCAL_MODE"}
        </div>
      </div>

      <div className="relative border-4 border-slate-700 rounded-lg overflow-hidden bg-black">
        <canvas 
          ref={canvasRef} 
          onMouseMove={handleMove} 
          className="cursor-crosshair block" 
        />
        
        {isFinished && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-white">
             <h2 className="text-2xl font-black text-blue-500 mb-4">SESSÃO FINALIZADA</h2>
             <p className="text-slate-400 font-mono">Pontos capturados: {path.length}</p>
             <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-blue-600 rounded-full text-sm font-bold">Reiniciar</button>
          </div>
        )}
      </div>

      <div className="w-full flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-slate-500 text-[10px] uppercase font-black">Data Points</span>
          <span className="text-emerald-400 font-mono text-3xl">{path.length}</span>
        </div>
        
        <button
          onClick={handleFinish}
          disabled={isFinished || path.length === 0}
          className={`px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
            isFinished || path.length === 0 
            ? "bg-slate-700 text-slate-500 cursor-not-allowed" 
            : "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20"
          }`}
        >
          {isSending ? "Enviando..." : "Encerrar e Enviar Telemetria"}
        </button>
      </div>
    </div>
  );
}