import { useTrainingSession } from '../../contexts/TrainingSessionContext';

export default function TrainingHUD() {
  const { session } = useTrainingSession();

  // Se não houver sessão, o HUD pode mostrar "STANDBY" ou não renderizar
  if (!session) return null;

  return (
    <div className="fixed top-0 left-0 w-full p-4 z-50 pointer-events-none">
      {/* Barra Superior - Status da Telemetria */}
      <div className="flex justify-between items-start text-[10px] font-mono text-blue-400 uppercase tracking-widest">
        <div className="bg-black/60 p-2 border-l-2 border-blue-500 backdrop-blur-md">
          <p>Justina Virtual — HUD v1.0.3</p>
          <p className="text-white">Operador: <span className="text-blue-300">CIRURGIÃO</span></p>
        </div>
        
        <div className="bg-black/60 p-2 border-r-2 border-red-500 text-right backdrop-blur-md">
          <p>Tempo de Isquemia</p>
          <p className="text-xl text-red-500 font-bold">00:15</p> 
        </div>
      </div>

      {/* Indicador Lateral - Telemetria */}
      <div className="absolute top-24 left-4 space-y-2">
        <div className="bg-black/60 p-3 border border-blue-900/30 rounded backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 animate-pulse rounded-full" />
            <p className="text-green-400 text-[9px] font-bold">TELEMETRIA ATIVA</p>
          </div>
          <p className="text-[8px] text-gray-400">DR_ID: {session.traineeId || '12345678'}</p>
        </div>

        {/* Score Real vindo das questões que o médico responde */}
        <div className="bg-black/60 p-3 border border-blue-900/30 rounded backdrop-blur-sm">
          <p className="text-blue-400 text-[9px]">PONTOS TELEMÉTRICOS</p>
          <p className="text-2xl font-bold text-white">
            {session.totalScore * 100} <span className="text-[10px] text-blue-300">pts</span>
          </p>
        </div>
      </div>

      {/* Rodapé do HUD */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-gray-600 font-mono">
        Protocolo Estável // Telemetria FE-5 // DD-Ready
      </div>
    </div>
  );
}