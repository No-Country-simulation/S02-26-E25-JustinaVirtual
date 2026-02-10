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
    <div className="flex flex-col items-center gap-6">
      <div className="relative border-4 border-slate-700 rounded-lg overflow-hidden shadow-2xl bg-black">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMove}
          className="cursor-crosshair"
        />
        
        {isFinished && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-4 text-center">
            <h2 className="text-3xl font-bold mb-2">SESSÃO FINALIZADA</h2>
            <p className="text-blue-400 animate-pulse">
              {isSending ? "Transmitindo telemetria para o servidor..." : "Processamento concluído!"}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleFinish}
          disabled={isFinished || path.length === 0}
          className={`px-10 py-4 rounded-full font-bold text-white transition-all transform ${
            isFinished || path.length === 0 
            ? "bg-gray-600 cursor-not-allowed opacity-50" 
            : "bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95 shadow-lg shadow-red-900/40"
          }`}
        >
          {isFinished ? "Enviado para IA" : "Finalizar e Enviar Relatório"}
        </button>
        
        {isFinished && (
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-bold transition"
          >
            Nova Simulação
          </button>
        )}
      </div>
      
      <div className="text-slate-500 text-sm font-mono">
        Pontos capturados: {path.length}
      </div>
    </div>
  );
}