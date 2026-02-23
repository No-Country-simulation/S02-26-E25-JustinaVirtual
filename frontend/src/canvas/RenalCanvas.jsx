import { useEffect, useRef, useState } from "react";
import { apiService } from "../services/apiService";
import { useTrainingSession } from "../contexts/TrainingSessionContext";
import { createTargetZone } from "../simulator2d/targetZone.jsx";
import rimImage from "../assets/ImagemRimPelveRenal.jpg";

export default function RenalCanvas() {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const targetZoneRef = useRef(createTargetZone());
  const [path, setPath] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // Para o ponteiro customizado
  const [isFinished, setIsFinished] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // 1. Setup Inicial
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

  // 2. Loop de Renderização Consolidado
  useEffect(() => {
    render();
  }, [path, mousePos]); // Re-renderiza quando move ou grava

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    const ctx = canvas.getContext("2d");

    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fundo Anatômico (Rim do Everton)
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    // Zona de Sucesso (Target)
    targetZoneRef.current.draw(ctx);

    // Renderização do Rastro Neon
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

    // Ponteiro Laser Customizado (Sugestão de "Ponteira")
    const isNowInside = targetZoneRef.current.contains(mousePos.x, mousePos.y);
    drawLaserPointer(ctx, mousePos.x, mousePos.y, isNowInside);
  };

  // Função auxiliar para desenhar a ponteira sem precisar de imagem paga
  const drawLaserPointer = (ctx, x, y, isInside) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = isInside ? "#4ade80" : "#f87171";
    ctx.shadowBlur = 15;
    ctx.shadowColor = isInside ? "#4ade80" : "#f87171";
    ctx.fill();
    
    // Mira interna
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 10, y); ctx.lineTo(x + 10, y);
    ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 10);
    ctx.stroke();
    ctx.restore();
  };

  // 3. Captura de Movimento Otimizada
  const handleMove = (e) => {
    if (isFinished) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    setMousePos({ x, y }); // Atualiza posição visual

    const last = path[path.length - 1];
    // Só grava se mover mais de 3px (Economiza dados pro Fabio)
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
      const feedbackIA = await apiService.sendTelemetry(payload);
      alert(`Sucesso! Feedback da IA: ${feedbackIA.mensagem || "Análise concluída"}`);
    } catch (err) {
      alert("Erro na conexão com o Java. Verifique se o servidor está ativo.");
      setIsFinished(false);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl transition-all duration-500 hover:border-slate-700">
      
      {/* Header do HUD */}
      <div className="flex w-full justify-between items-end mb-2 px-2">
        <div className="flex flex-col">
          <h2 className="text-white font-black tracking-tighter text-2xl uppercase">
            Justina <span className="text-blue-500">HUD v1.0.3</span>
          </h2>
          <p className="text-slate-500 text-[10px] uppercase font-mono tracking-[0.3em]">
            Operador: <span className="text-blue-400">Cirurgião Acadêmico</span>
          </p>
        </div>
        <div className="text-right">
          <span className="text-slate-500 text-[9px] uppercase font-bold">Protocolo</span>
          <div className="text-green-500 font-mono text-xs animate-pulse">TELEMETRIA ATIVA // FE-5</div>
        </div>
      </div>
      
      {/* Container do Canvas */}
      <div className="relative bg-black rounded-2xl overflow-hidden border-4 border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
        <canvas 
          ref={canvasRef} 
          onMouseMove={handleMove} 
          // Esconde o mouse padrão para usar a ponteira laser 
          className="cursor-none active:scale-[1.001] transition-transform" 
        />
        
        {/* Overlay de Sincronização */}
        {isSending && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center backdrop-blur-md">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-blue-400 font-black animate-pulse uppercase tracking-[0.4em] text-xs">
              Sincronizando com a IA...
            </div>
          </div>
        )}
      </div>
      
      {/* Footer do HUD */}
      <div className="w-full flex justify-between items-center px-4 py-2 bg-slate-800/30 rounded-2xl border border-slate-800/50">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="text-slate-500 text-[9px] uppercase font-bold tracking-widest">Data Points</span>
            <div className="text-blue-400 font-mono text-xl font-black">
              {path.length.toString().padStart(4, '0')}
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className={`flex items-center gap-2 font-mono text-xs uppercase ${path.length > 0 ? 'text-green-500' : 'text-slate-600'}`}>
              <div className={`w-2 h-2 rounded-full ${path.length > 0 ? 'bg-green-500 animate-ping' : 'bg-slate-600'}`}></div>
              {path.length > 0 ? 'Capturando' : 'Standby'}
            </div>
          </div>
        </div>

        <button
          onClick={handleFinish}
          disabled={isFinished || path.length === 0}
          className="group relative px-12 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg active:translate-y-1"
        >
          {isSending ? "Processando..." : "Finalizar Procedimento"}
        </button>
      </div>
      
      <p className="text-[9px] text-slate-600 uppercase font-mono">
        Ambiente de Simulação Virtual - Justina Project 2026
      </p>
    </div>
  );
}