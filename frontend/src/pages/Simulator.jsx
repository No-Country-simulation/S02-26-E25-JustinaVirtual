import { useEffect, useState, useRef } from "react";
import RenalCanvas from "../canvas/RenalCanvas";
import { apiService } from "../services/apiService";
import { useNavigate } from "react-router-dom";

export default function Simulator() {
  const [medico, setMedico] = useState("CIRURGIÃO");
  const [segundos, setSegundos] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [simulationKey, setSimulationKey] = useState(0);
  const navigate = useNavigate();
  
  const telemetryBuffer = useRef([]);
  const isFinalized = useRef(false);
  const sessionStartTime = useRef(null);

// reset entire simulation
  const startNewSimulation = () => {

    telemetryBuffer.current = [];
    isFinalized.current = false;
    sessionStartTime.current = Date.now();

    setSegundos(0);

    setSimulationKey(prev => prev + 1);
  };

  useEffect(() => {
    const dadosSalvos = localStorage.getItem("justina_user");
    if (dadosSalvos) {
      const objetoMedico = JSON.parse(dadosSalvos);
      setMedico(objetoMedico.name ? objetoMedico.name.toUpperCase() : "CIRURGIÃO");
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSegundos((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [simulationKey]);

  useEffect(() => {
    const iniciarColeta = async () => {
      try {
        const dadosSalvos = localStorage.getItem("justina_user");
        if (dadosSalvos) {
          const user = JSON.parse(dadosSalvos);
          const response = await apiService.startDataCollection(user.email, "renal_surgery_2d");
          setSessionId(response.session_id);
          sessionStartTime.current = Date.now();
        }
      } catch (error) {
        console.error("Erro ao iniciar coleta:", error);
      }
    };
    iniciarColeta();
  }, [simulationKey]);

  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(async () => {
      if (telemetryBuffer.current.length > 0) {
        try {
          await apiService.sendTelemetryBatch(sessionId, telemetryBuffer.current);
          telemetryBuffer.current = [];
        } catch (error) {
          console.error("Erro ao enviar lote:", error);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const handlePositionUpdate = (position) => {
    if (!sessionId || isFinalized.current || !sessionStartTime.current) return;
    
    const timestampSeconds = (Date.now() - sessionStartTime.current) / 1000;
    
    telemetryBuffer.current.push({
      timestamp: timestampSeconds,
      position: {
        x: position.x,
        y: position.y,
        z: position.z || 0
      },
      instrument_id: "surgical_tool",
      velocity: null
    });
  };

  const handleFinishSession = async () => {
    if (!sessionId || isFinalized.current) return;
    
    isFinalized.current = true;
    
    try {
      if (telemetryBuffer.current.length > 0) {
        await apiService.sendTelemetryBatch(sessionId, telemetryBuffer.current);
        telemetryBuffer.current = [];
      }
      
      await apiService.completeDataCollection(sessionId);
    } catch (error) {
      console.error("Erro ao finalizar sessão:", error);
    }
  };

  const formatarTempo = (s) => {
    const min = Math.floor(s / 60).toString().padStart(2, '0');
    const seg = (s % 60).toString().padStart(2, '0');
    return `${min}:${seg}`;
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-gray-100 font-sans">
      
      <div className="mb-6 flex justify-between items-center bg-slate-800/50 p-5 rounded-2xl border border-slate-700 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-blue-400 tracking-tighter uppercase italic">
            Justina Virtual — HUD v1.0.3
          </h1>
          <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">
            Operador: <span className="text-white font-bold">{medico}</span>
          </p>
        </div>

        <div className="flex gap-8 items-center">
          <div className="text-right border-r border-slate-700 pr-8">
            <p className="text-[10px] uppercase text-blue-300 tracking-widest mb-1">Tempo de Isquemia</p>
            <p className="text-3xl font-mono font-black text-white">{formatarTempo(segundos)}</p>
          </div>
          
          <div className="bg-blue-900/20 p-2 px-4 rounded-lg border border-blue-500/30">
            <p className="text-[10px] uppercase tracking-widest text-blue-300 mb-1">Sistema</p>
            <p className="text-green-400 animate-pulse font-mono text-sm font-bold flex items-center gap-2">
              <span className="h-2 w-2 bg-green-500 rounded-full"></span>
              TELEMETRIA ATIVA
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-black rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden relative group">
        <RenalCanvas 
          key={simulationKey}
          onPositionUpdate={handlePositionUpdate}
          onFinish={handleFinishSession}
          onRestart={startNewSimulation}
        />
        
        <div className="absolute top-6 right-6 bg-slate-950/80 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-right shadow-2xl">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Precisão da Incisão</p>
          <p className="text-4xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
            573 <span className="text-xs text-emerald-600 font-normal">pts</span>
          </p>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600/90 text-white text-[10px] px-4 py-1 rounded-full font-bold uppercase tracking-widest">
          Mouse para interagir com o parênquima renal
        </div>
      </div>
      
      <div className="mt-6 flex justify-between items-center px-2">
        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
          Protocolo Estável // Telemetria FE-5 // DD-Ready
        </p>
        
        <div className="flex gap-4">
          <button className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black transition-all border border-slate-700 uppercase tracking-widest">
            Pausar
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-blue-950/30 hover:bg-blue-600 border border-blue-500/30 text-blue-400 hover:text-white rounded-xl text-xs font-black transition-all shadow-lg uppercase tracking-widest"
          >
            Voltar ao Menu Inicial
          </button>

          <button 
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 bg-red-950/30 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white rounded-xl text-xs font-black transition-all shadow-lg uppercase tracking-widest"
          >
            Encerrar Sessão
          </button>
        </div>
      </div>

    </div>
  );
}