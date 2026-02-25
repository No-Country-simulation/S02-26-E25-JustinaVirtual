import { useEffect, useRef, useState } from "react";
import { apiService } from "../services/apiService";
import { useTrainingSession } from "../contexts/TrainingSessionContext";
import { createTargetZone } from "../simulator2d/targetZone.jsx";
import TrainingHUD from "../components/hud/TrainingHUD"; // Importação do HUD v1.0.3
import rimImage from "../assets/ImagemRimPelveRenal.jpg";

export default function RenalCanvas() {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const targetZoneRef = useRef(createTargetZone());
  
  // Estados do Simulador
  const [path, setPath] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isFinished, setIsFinished] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState(null); // Armazena a resposta da IA para o HUD

  // 1. Setup Inicial e Carregamento da Imagem do Rim
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = 900;
    canvas.height = 550;

    const img = new Image();
    img.src = rimImage;
    img.onload = () => {
      imageRef.current = img;
      render(); 
    };
  }, []);

  // 2. Loop de Renderização reativo
  useEffect(() => {
    render();
  }, [path, mousePos]); 

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    const ctx = canvas.getContext("2d");

    // Limpeza de frame e desenho do fundo
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    
    // Desenha a zona alvo de sutura/incisão
    targetZoneRef.current.draw(ctx);

    // Desenha o Rastro Neon (Otimizado: últimos 60 pontos)
    const tail = path.slice(-60);
    tail.forEach((p, i) => {
      if (i === 0) return;
      const prev = tail[i - 1];
      const isInside = targetZoneRef.current.contains(p.x, p.y);

      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.shadowBlur = 8;
      ctx.shadowColor = isInside ? "#4ade80" : "#f87171";
      ctx.strokeStyle = isInside 
        ? `rgba(74, 222, 128, ${i / tail.length})` 
        : `rgba(248, 113, 113, ${i / tail.length})`;

      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Desenha a mira laser de precisão
    const isNowInside = targetZoneRef.current.contains(mousePos.x, mousePos.y);
    drawLaserPointer(ctx, mousePos.x, mousePos.y, isNowInside);
  };

  const drawLaserPointer = (ctx, x, y, isInside) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = isInside ? "#4ade80" : "#f87171";
    ctx.shadowBlur = 20;
    ctx.shadowColor = isInside ? "#4ade80" : "#f87171";
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 12, y); ctx.lineTo(x + 12, y);
    ctx.moveTo(x, y - 12); ctx.lineTo(x, y + 12);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  const handleMove = (e) => {
    if (isFinished) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    setMousePos({ x, y }); 

    const last = path[path.length - 1];
    // Grava telemetria apenas se houver deslocamento significativo (>3px)
    if (!last || Math.abs(x - last.x) > 3 || Math.abs(y - last.y) > 3) {
      setPath(prev => [...prev, { x, y, t: Date.now() }]);
    }
  };

  const handleFinish = async () => {
    if (path.length === 0) return;
    setIsFinished(true);
    setIsSending(true);

    const payload = path.map(p => ({
      eixoX: p.x,
      eixoY: p.y,
      timestamp: p.t
    }));

    try {
      // Envia dados para o backend Java/IA Service
      const response = await apiService.sendTelemetry(payload);
      setFeedback(response); 
      alert(`Procedimento Finalizado! IA: ${response.mensagem || "Dados processados com sucesso."}`);
    } catch (err) {
      alert("Erro na sincronização. Verifique se o servidor está ativo.");
      setIsFinished(false);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
      
      {/* HUD de Monitoramento - Z-index alto para ficar sobre o carregamento */}
      <TrainingHUD path={path} feedback={feedback} />

      {/* Container do Canvas */}
      <div className="relative bg-black rounded-2xl overflow-hidden border-4 border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
        <canvas 
          ref={canvasRef} 
          onMouseMove={handleMove} 
          className="cursor-none active:scale-[1.001] transition-transform" 
        />
        
        {/* Overlay de Sincronização */}
        {isSending && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center backdrop-blur-md z-[60]">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-blue-400 font-black animate-pulse uppercase tracking-[0.4em] text-xs">
              Sincronizando Telemetria...
            </div>
          </div>
        )}
      </div>
      
      {/* Botão de Ação de Finalização */}
      <div className="w-full flex justify-end mt-4">
        <button
          onClick={handleFinish}
          disabled={isFinished || path.length === 0}
          className="px-12 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg active:translate-y-1 z-[70] pointer-events-auto"
        >
          {isSending ? "ENVIANDO..." : "Finalizar Procedimento"}
        </button>
      </div>
    </div>
  );
}