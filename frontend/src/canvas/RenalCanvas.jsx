import { useEffect, useRef, useState } from "react";
import { apiService } from "../services/apiService";
import { useTrainingSession } from "../contexts/TrainingSessionContext";

export default function RenalCanvas() {
  const canvasRef = useRef(null);
  const { session } = useTrainingSession();
  const [path, setPath] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Alvo estático para garantir que a telemetria tenha uma referência de colisão
  const KIDNEY_TARGET = { x: 500, y: 250, radiusX: 130, radiusY: 190 };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = 900;
    canvas.height = 550;

    const drawScene = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Desenho minimalista (focado na telemetria.)
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(KIDNEY_TARGET.x, KIDNEY_TARGET.y, KIDNEY_TARGET.radiusX, KIDNEY_TARGET.radiusY, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Renderização do rastro (Feedback visual para o usuário)
      const tail = path.slice(-40);
      tail.forEach((p, i) => {
        if (i === 0) return;
        const prev = tail[i - 1];
        ctx.strokeStyle = `rgba(34, 197, 94, ${i / tail.length})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      });
    };

    drawScene();
  }, [path]);

  const handleMove = (e) => {
    if (isFinished) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    // Evita duplicados e pontos colados demais (otimiza o banco do Fabio)
    const last = path[path.length - 1];
    if (!last || Math.abs(x - last.x) > 2 || Math.abs(y - last.y) > 2) {
      setPath(prev => [...prev, { x, y, t: Date.now() }]);
    }
  };

  const handleFinish = async () => {
    if (path.length === 0) return;
    setIsFinished(true);
    setIsSending(true);
    
    // ESTRUTURA EXATA QUE O FABIO PEDIU
    const payload = {
      usuarioId: session?.traineeId || "123e4567-e89b-12d3-a456-426614174000",
      movimentos: path.map(p => ({
        eixoX: p.x,
        eixoY: p.y,
        timestamp: p.t
      }))
    };

    console.log("Enviando Payload Otimizado para o Fabio:", payload);

    try {
      await apiService.sendTelemetry(payload);
      localStorage.removeItem("justina_draft_session");
      alert("Sucesso: Dados enviados ao Backend Java.");
    } catch (err) {
      console.error("Erro na integração:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-slate-900 rounded-2xl border border-slate-800">
      <div className="relative bg-black rounded-lg overflow-hidden border border-slate-700">
        <canvas ref={canvasRef} onMouseMove={handleMove} className="cursor-crosshair" />
      </div>
      
      <div className="w-full flex justify-between items-center px-2">
        <div className="text-slate-400 font-mono text-xs">
          Pontos Capturados: <span className="text-blue-400">{path.length}</span>
        </div>
        <button
          onClick={handleFinish}
          disabled={isFinished || path.length === 0}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50"
        >
          {isSending ? "Sincronizando..." : "Enviar Dados ao Fabio"}
        </button>
      </div>
    </div>
  );
}