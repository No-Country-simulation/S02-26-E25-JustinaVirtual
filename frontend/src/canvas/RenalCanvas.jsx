import { useEffect, useRef, useState } from "react";
import { apiService } from "../services/apiService";
import { useTrainingSession } from "../contexts/TrainingSessionContext";
// Importamos a imagem que o Everton mandou
import rimImage from "../assets/ImagemRimPelveRenal.jpg";

export default function RenalCanvas() {
  const canvasRef = useRef(null);
  const imageRef = useRef(null); // Ref para a imagem não recarregar toda hora
  const { session } = useTrainingSession();
  const [path, setPath] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Proporções baseadas na imagem do Everton
    canvas.width = 900;
    canvas.height = 550;

    // Carregamos a imagem apenas uma vez
    const img = new Image();
    img.src = rimImage;
    img.onload = () => {
      imageRef.current = img;
      drawScene();
    };

    const drawScene = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 1. Desenha a Imagem do Everton no Fundo
      if (imageRef.current) {
        ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
      }

      // 2. Renderização do rastro
      const tail = path.slice(-50);
      tail.forEach((p, i) => {
        if (i === 0) return;
        const prev = tail[i - 1];
        ctx.strokeStyle = `rgba(34, 197, 94, ${i / tail.length})`; // Verde neon degradê
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
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

    const last = path[path.length - 1];
    if (!last || Math.abs(x - last.x) > 2 || Math.abs(y - last.y) > 2) {
      setPath(prev => [...prev, { x, y, t: Date.now() }]);
    }
  };

  const handleFinish = async () => {
    if (path.length === 0) return;
    setIsFinished(true);
    setIsSending(true);
    
    /**
     * AJUSTE DE OURO PARA O FABIO:
     * O Controller dele espera List<Telemetria>.
     * Vamos enviar o array direto conforme o mapeamento do Java dele.
     */
    const payload = path.map(p => ({
      eixoX: p.x,
      eixoY: p.y,
      timestamp: p.t
      // Se o Fabio precisar do usuarioId dentro de cada ponto, adicionamos aqui
    }));

    try {
      // Chama o  apiService 
      const feedbackIA = await apiService.sendTelemetry(payload);
      alert(`Sucesso! Feedback da IA: ${feedbackIA.mensagem || "Processado"}`);
    } catch (err) {
      alert("Erro ao enviar para o Java. Verifique se o servidor do Fabio está em http://localhost:8081");
      setIsFinished(false); // Permite tentar de novo se der erro
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
      <h2 className="text-white font-bold tracking-wider">SIMULADOR VASCULAR - JUSTINA VIRTUAL</h2>
      
      <div className="relative bg-black rounded-lg overflow-hidden border-4 border-slate-700 shadow-inner">
        <canvas 
          ref={canvasRef} 
          onMouseMove={handleMove} 
          className="cursor-crosshair shadow-2xl" 
        />
      </div>
      
      <div className="w-full flex justify-between items-center px-2">
        <div className="flex flex-col">
          <span className="text-slate-500 text-[10px] uppercase font-bold">Status da Captura</span>
          <div className="text-blue-400 font-mono text-sm">
            {path.length} pontos registrados
          </div>
        </div>

        <button
          onClick={handleFinish}
          disabled={isFinished || path.length === 0}
          className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black text-sm transition-all transform hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 shadow-lg"
        >
          {isSending ? "SINCRONIZANDO COM JAVA..." : "FINALIZAR E ANALISAR"}
        </button>
      </div>
    </div>
  );
}