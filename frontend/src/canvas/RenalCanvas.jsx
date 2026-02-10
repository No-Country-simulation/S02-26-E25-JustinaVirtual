import { useEffect, useRef, useState } from "react";

export default function RenalCanvas() {
  const canvasRef = useRef(null);
  const [path, setPath] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  // 1. Efeito de Desenho (Canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 900;
    canvas.height = 500;

    const drawScene = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Rim (Alvo Cirúrgico)
      ctx.fillStyle = "#7c3aed";
      ctx.beginPath();
      ctx.ellipse(650, 250, 80, 120, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#7c3aed";

      // Vaso Sanguíneo (Obstáculo - Não toque!)
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(200, 100);
      ctx.lineTo(600, 250);
      ctx.stroke();

      // Trajetória do instrumento (Linha verde)
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

  // 2. Captura de Movimento
  const handleMove = (e) => {
    if (isFinished) return; // Trava o simulador ao finalizar
    if (!startTime) setStartTime(Date.now());

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Guardamos X, Y e o tempo exato do movimento
    setPath((prev) => [...prev, { 
      x: Math.round(x), 
      y: Math.round(y), 
      t: Date.now() 
    }]);
  };

  // 3. Integração: Envio dos dados para o (Backend 8081)
  const handleFinish = async () => {
    setIsFinished(true);
    
    // Recuperamos quem é o médico que está operando
    const user = JSON.parse(localStorage.getItem("justina_user") || "{}");

    const payload = {
      doctor: user.name || "Unknown",
      dni: user.dni || "000",
      sessionStart: startTime,
      sessionEnd: Date.now(),
      telemetry: path // Aqui vão todos os pontos (x,y,t) para a IA
    };

    console.log("Enviando Telemetria para o Java...", payload);

    try {
      // Exemplo: de integração que o Fábio vai receber
      // await fetch('http://localhost:8081/api/telemetria', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });
      alert(`Cirurgia Finalizada! ${path.length} pontos de telemetria capturados.`);
    } catch (error) {
      console.error("Erro na integração:", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative border-4 border-slate-700 rounded-lg overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMove}
          style={{
            background: "#09090b",
            cursor: "crosshair",
          }}
        />
        {isFinished && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <h2 className="text-white text-3xl font-bold">SESSÃO ENCERRADA</h2>
          </div>
        )}
      </div>

      <button
        onClick={handleFinish}
        disabled={isFinished || path.length === 0}
        className={`px-10 py-4 rounded-full font-bold text-white transition-all ${
          isFinished || path.length === 0 
          ? "bg-gray-600 cursor-not-allowed" 
          : "bg-red-600 hover:bg-red-700 hover:scale-105 shadow-lg shadow-red-900/40"
        }`}
      >
        {isFinished ? "Dados Enviados ✅" : "Finalizar Cirurgia e Gerar Relatório"}
      </button>
    </div>
  );
}