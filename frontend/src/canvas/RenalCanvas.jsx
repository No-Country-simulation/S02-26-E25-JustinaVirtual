import { useEffect, useRef, useState } from "react";

export default function RenalCanvas() {
  const canvasRef = useRef(null);
  const [path, setPath] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // 1. Renderização do Ambiente Cirúrgico (Canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 900;
    canvas.height = 500;

    const drawScene = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Desenho do Rim (Alvo)
      ctx.fillStyle = "#7c3aed";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#7c3aed";
      ctx.beginPath();
      ctx.ellipse(650, 250, 80, 120, 0, 0, Math.PI * 2);
      ctx.fill();

      // Desenho do Vaso (Obstáculo)
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(200, 100);
      ctx.lineTo(600, 250);
      ctx.stroke();

      // Trajetória do Instrumento (Linha de Telemetria)
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      path.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    };

    drawScene();
  }, [path]);

  // 2. Captura de Movimento (Input para o Dev 2)
  const handleMove = (e) => {
    if (isFinished) return; 
    if (!startTime) setStartTime(Date.now());

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    // Adicionamos apenas se o movimento for relevante (Throttling simples)
    setPath((prev) => [...prev, { x, y, t: Date.now() }]);
  };

  // 3. Finalização e Envio (Conexão com Dev 1, 2, 3 e 4)
  const handleFinish = async () => {
    setIsFinished(true);
    setIsSending(true);
    
    const user = JSON.parse(localStorage.getItem("justina_user") || "{}");

    // Estrutura de dados (Payload) conforme discutido na reunião
    const payload = {
      doctorName: user.name || "Desconhecido",
      dni: user.dni || "000",
      role: user.role || "TRAINEE",
      sessionStart: new Date(startTime).toISOString(), // Formato ISO para o Dev 1
      sessionEnd: new Date().toISOString(),
      pointsCount: path.length,
      telemetry: path 
    };

    console.log("Payload pronto para o Back-end:", payload);

    try {
      // Simulação da chamada de API para a porta 8081
      // await fetch('http://localhost:8081/api/v1/simulacao/finalizar', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });

      setTimeout(() => {
        setIsSending(false);
        alert(`Sucesso! ${path.length} pontos enviados para análise da IA.`);
      }, 1500);

    } catch (error) {
      console.error("Erro na integração:", error);
      setIsSending(false);
    }
  };

return (
  <div className="flex flex-col items-center gap-6 p-8 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 max-w-fit mx-auto">
    
    {/* 1. Cabeçalho do Monitor (Lógica de ID integrada) */}
    <div className="w-full flex justify-between items-center px-4 py-3 bg-slate-800 rounded-t-xl border-b border-slate-700">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-red-500 animate-pulse rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
        <span className="text-slate-300 text-xs font-mono uppercase tracking-[0.2em] font-bold">
          Live Telemetry System
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-slate-500 text-[10px] font-mono">STATUS: ACTIVE</span>
        <span className="text-blue-400 text-xs font-mono bg-blue-900/30 px-2 py-1 rounded">
          DR_ID: {JSON.parse(localStorage.getItem("justina_user") || "{}").dni || "UNSET"}
        </span>
      </div>
    </div>

    {/* 2. Área do Canvas (Sua lógica de ref e movimento) */}
    <div className="relative border-4 border-slate-700 rounded-lg overflow-hidden shadow-[inner_0_2px_10px_rgba(0,0,0,1)] bg-black">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMove}
        className="cursor-crosshair block"
      />
      
      {/* Overlay de Finalização (Estilo Glassmorphism) */}
      {isFinished && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-white p-4 text-center transition-all duration-500">
          <div className="p-8 border-2 border-blue-500/50 rounded-3xl bg-slate-900/90 shadow-[0_0_40px_rgba(59,130,246,0.2)]">
            <h2 className="text-3xl font-black mb-2 tracking-tighter text-blue-500">SESSÃO CONCLUÍDA</h2>
            <div className="h-1 w-20 bg-blue-500 mx-auto mb-4 rounded-full"></div>
            <p className="text-slate-300 font-mono text-sm uppercase tracking-widest">
              {isSending ? "Transmitindo telemetria para análise..." : "Processamento concluído com sucesso!"}
            </p>
          </div>
        </div>
      )}
    </div>

    {/* 3. Rodapé de Controle (Combinação de Botões e Contador) */}
    <div className="w-full flex justify-between items-center bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50">
      
      {/* Contador de Pontos (Sua lógica de path.length) */}
      <div className="flex flex-col gap-1">
        <span className="text-slate-500 text-[10px] uppercase font-black tracking-tighter">Telemetric Points</span>
        <div className="flex items-baseline gap-1">
          <span className="text-emerald-400 font-mono text-3xl leading-none">{path.length}</span>
          <span className="text-emerald-900 text-xs font-bold uppercase">pts</span>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-4">
        <button
          onClick={handleFinish}
          disabled={isFinished || path.length === 0}
          className={`px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all transform shadow-lg ${
            isFinished || path.length === 0 
            ? "bg-slate-700 text-slate-500 cursor-not-allowed opacity-50" 
            : "bg-red-600 hover:bg-red-500 text-white hover:scale-105 active:scale-95 shadow-red-900/20"
          }`}
        >
          {isFinished ? "✓ Dados Enviados" : "Encerrar e Enviar"}
        </button>
        
        {isFinished && (
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
          >
            Nova Simulação
          </button>
        )}
      </div>
    </div>

    {/* Marca d'água técnica */}
    <div className="w-full text-left">
      <p className="text-[9px] text-slate-600 font-mono uppercase tracking-tighter">
        Justina Virtual Protocol // v1.0.2-stable // FE-5 Integration Active
      </p>
    </div>
  </div>
  );
}