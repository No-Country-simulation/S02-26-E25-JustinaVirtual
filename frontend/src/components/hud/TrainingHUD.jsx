import { useTrainingSession } from '../../contexts/TrainingSessionContext';
import { apiService } from '../../services/apiService'; // Importamos o novo serviço

export default function TrainingHUD({ path = [], feedback = null }) {
  const { session } = useTrainingSession();

  // Função para disparar o download do PDF do Fabio
  const handleDownloadReport = async () => {
    if (session?.sessionId) {
      try {
        await apiService.downloadReport(session.sessionId);
      } catch (err) {
        alert("O relatório ainda está sendo processado pela IA. Tente em instantes.");
      }
    }
  };

  if (!session) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full p-4 z-50 pointer-events-none flex flex-col justify-between">
      
      {/* Barra Superior */}
      <div className="flex justify-between items-start text-[10px] font-mono text-blue-400 uppercase tracking-widest">
        <div className="bg-black/60 p-2 border-l-2 border-blue-500 backdrop-blur-md">
          <p>Justina Virtual — HUD v1.1.0</p>
          <p className="text-white">Operador: <span className="text-blue-300">CIRURGIÃO</span></p>
        </div>
        
        <div className="bg-black/60 p-2 border-r-2 border-red-500 text-right backdrop-blur-md">
          <p>Tempo de Isquemia</p>
          <p className="text-xl text-red-500 font-bold">00:15</p> 
        </div>
      </div>

      {/* Indicadores Laterais */}
      <div className="flex-1 mt-10 space-y-2">
        {/* Status da Telemetria */}
        <div className="w-fit bg-black/60 p-3 border border-blue-900/30 rounded backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 animate-pulse rounded-full" />
            <p className="text-green-400 text-[9px] font-bold">TELEMETRIA ATIVA</p>
          </div>
          <p className="text-[8px] text-gray-400">DR_ID: {session.traineeId || '12345678'}</p>
        </div>

        {/* Coordenadas - Dados em tempo real */}
        <div className="w-fit bg-black/60 p-3 border border-green-900/30 rounded backdrop-blur-sm">
          <p className="text-green-400 text-[9px]">COORDENADAS CAPTURADAS</p>
          <p className="text-2xl font-bold text-white">
            {path.length} <span className="text-[10px] text-green-300">px</span>
          </p>
        </div>

        {/* BOTÃO DE RELATÓRIO - Só aparece se houver feedback da IA */}
        {feedback && (
          <div className="pointer-events-auto mt-4">
            <button 
              onClick={handleDownloadReport}
              className="bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold py-2 px-4 rounded border-b-4 border-green-800 active:border-b-0 transition-all flex items-center gap-2"
            >
              <span>📥</span> BAIXAR RELATÓRIO PDF
            </button>
            <p className="text-[7px] text-green-400 mt-1 animate-pulse">GERADO POR IA SERVICE</p>
          </div>
        )}
      </div>
      
      {/* Rodapé do HUD */}
      <div className="text-center text-[8px] text-gray-600 font-mono pb-2">
        Protocolo Estável // Telemetria FE-5 // DD-Ready // IA-PDF-ENABLED
      </div>
    </div>
  );
}