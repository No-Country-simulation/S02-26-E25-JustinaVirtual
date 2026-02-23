import { useEffect, useRef, useState } from "react";
import { apiService } from "../services/apiService";
import { useTrainingSession } from "../contexts/TrainingSessionContext";
import { createTargetZone } from "../utils/targetZone"; 
import rimImage from "../assets/ImagemRimPelveRenal.jpg";

export default function RenalCanvas() {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const targetZoneRef = useRef(createTargetZone()); // Referência estável para a zona de alvo
  const { session } = useTrainingSession();
  const [path, setPath] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // 1. Configuração Inicial e Carregamento da Imagem
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = 900;
    canvas.height = 550;

    const img = new Image();
    img.src = rimImage;
    img.onload = () => {
      imageRef.current = img;
      render(); // Inicia a renderização assim que a imagem carrega
    };
  }, []);

  // 2. Loop de Renderização (O Brilho do Everton)
  useEffect(() => {
    render();
  }, [path]); // Atualiza o desenho sempre que o path mudar

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    const ctx = canvas.getContext("2d");

    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha o Rim do Everton
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    // Desenha a Área de Alvo (Tracejada/Suave)
    targetZoneRef.current.draw(ctx);

    // Desenha o Rastro Telemétrico com Efeito Neon
    const tail = path.slice(-60); // Mostra os últimos 60 pontos para um rastro fluido
    tail.forEach((p, i) => {
      if (i === 0) return;
      const prev = tail[i - 1];
      
      // Verifica se o ponto atual está dentro da zona cirúrgica
      const isInside = targetZoneRef.current.contains(p.x, p.y);

      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      
      // Configuração do Brilho (Neon)
      ctx.shadowBlur = 10;
      ctx.shadowColor = isInside ? "#4ade80" : "#f87171"; // Verde vs Vermelho
      ctx.strokeStyle = isInside 
        ? `rgba(74, 222, 128, ${i / tail.length})` 
        : `rgba(248, 113, 113, ${i / tail.length})`;

      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      
      // Reseta o brilho para não afetar outras camadas
      ctx.shadowBlur = 0;
    });
  };

  // 3. Captura de Movimento
  const handleMove = (e) => {
    if (isFinished) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    const last = path[path.length - 1];
    // Evita registrar pontos duplicados ou muito próximos (otimização)
    if (!last || Math.abs(x - last.x) > 2 || Math.abs(y - last.y) > 2) {
      setPath(prev => [...prev, { x, y, t: Date.now() }]);
    }
  };

  // 4. Envio para o Backend do Fabio (Java)
  const handleFinish = async () => {
    if (path.length === 0) return;
    setIsFinished(true);
    setIsSending(true);

    // Mapeamento exato para a List<Telemetria> do Java
    const payload = path.map(p => ({
      eixoX: p.x,
      eixoY: p.y,
      timestamp: p.t
    }));

    try {
      const feedbackIA = await apiService.sendTelemetry(payload);
      alert(`Sucesso! Feedback da IA: ${feedbackIA.mensagem || "Análise concluída"}`);
    } catch (err) {
      alert("Erro na conexão com o servidor Java (Fabio). Verifique o terminal.");
      setIsFinished(false);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl">
      <div className="flex flex-col items-center mb-2">
        <h2 className="text-white font-black tracking-tighter text-xl uppercase">
          Simulador Justina <span className="text-blue-500">Virtual</span>
        </h2>
        <p className="text-slate-500 text-[10px] uppercase font-mono tracking-[0.2em]">
          Procedimento: Pelve Renal - Nível Acadêmico
        </p>
      </div>
      
      <div className="relative bg-black rounded-xl overflow-hidden border-2 border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <canvas 
          ref={canvasRef} 
          onMouseMove={handleMove} 
          className="cursor-crosshair active:scale-[1.002] transition-transform" 
        />
        
        {/* Overlay de carregamento */}
        {isSending && (
          <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center backdrop-blur-sm">
            <div className="text-blue-400 font-bold animate-pulse uppercase tracking-widest">
              Sincronizando Telemetria...
            </div>
          </div>
        )}
      </div>
      
      <div className="w-full flex justify-between items-center px-4 mt-2">
        <div className="flex gap-6">
          <div className="flex flex-col">
            <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Pontos de Dados</span>
            <div className="text-blue-400 font-mono text-lg font-bold">
              {path.length.toString().padStart(4, '0')}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Status</span>
            <div className={`font-mono text-sm uppercase ${path.length > 0 ? 'text-green-500' : 'text-slate-600'}`}>
              {path.length > 0 ? '● Capturando' : '○ Standby'}
            </div>
          </div>
        </div>

        <button
          onClick={handleFinish}
          disabled={isFinished || path.length === 0}
          className="group relative px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-20 active:scale-95"
        >
          {isSending ? "Processando..." : "Finalizar Cirurgia"}
        </button>
      </div>
    </div>
  );
}