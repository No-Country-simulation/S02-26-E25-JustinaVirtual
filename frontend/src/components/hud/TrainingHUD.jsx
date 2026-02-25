import { useTrainingSession } from '../../contexts/TrainingSessionContext';
import { apiService } from '../../services/apiService';

export default function TrainingHUD({ path = [] }) {
  const { session } = useTrainingSession();

  // Função simplificada para o download
  const handleDownload = async () => {
    if (session?.sessionId) {
      console.log("Iniciando exportação de dados...");
      try {
        await apiService.downloadReport(session.sessionId);
      } catch (err) {
        alert("Erro: Relatório não disponível ou servidor ocupado.");
      }
    } else {
      alert("Aviso: Sessão não inicializada no DB.");
    }
  };

  if (!session) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full p-4 z-[100] pointer-events-none font-mono">
      
      {/* CABEÇALHO SÓLIDO */}
      <div className="flex justify-between items-start text-[11px] text-blue-400">
        <div className="bg-black p-2 border border-blue-900">
          <p className="font-bold">JUSTINA VIRTUAL — HUD v1.0.3</p>
          <p className="text-gray-300">OPERADOR: CIRURGIÃO ACADÊMICO</p>
        </div>
        
        <div className="bg-black p-2 border border-red-900 text-right">
          <p>TEMPO DE ISQUEMIA</p>
          <p className="text-xl text-red-500 font-bold">00:55</p> 
        </div>
      </div>

      {/* PAINEL LATERAL DE TELEMETRIA */}
      <div className="absolute top-28 left-4 space-y-3">
        <div className="bg-black p-3 border border-gray-800">
          <p className="text-green-500 text-[10px] font-bold">● TELEMETRIA ATIVA // FE-5</p>
          <div className="mt-2 text-white">
            <p className="text-[9px] text-gray-500 uppercase">Pontos de dados</p>
            <p className="text-2xl font-bold">{path.length.toString().padStart(4, '0')}</p>
          </div>
        </div>

        {/* BOTÃO ESTÁTICO (Pointer-events-auto para permitir o clique) */}
        <div className="pointer-events-auto">
          <button 
            onClick={handleDownload}
            className="bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] p-2 border border-zinc-700 w-full text-left flex justify-between items-center group"
          >
            <span>[ EXPORTAR RELATÓRIO PDF ]</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>

      {/* RODAPÉ ESTÁVEL */}
      <div className="fixed bottom-6 left-0 w-full text-center space-y-1">
        <p className="text-[9px] text-gray-600 tracking-[0.2em]">
          SISTEMA DE MONITORAMENTO CIRÚRGICO - PROJETO JUSTINA 2026
        </p>
        <p className="text-[10px] text-blue-900 font-bold">
          PROTOCOLO ESTÁVEL // TELEMETRIA FE-5 // DD-READY
        </p>
      </div>

    </div>
  );
}