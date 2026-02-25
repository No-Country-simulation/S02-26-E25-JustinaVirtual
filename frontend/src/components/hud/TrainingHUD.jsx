import { useTrainingSession } from '../../contexts/TrainingSessionContext';
import { apiService } from '../../services/apiService';

export default function TrainingHUD({ path = [] }) {
  const { session } = useTrainingSession();

  // Função para garantir o download mesmo se a sessão do Leon fechar
  const handleDownload = async () => {
    // Busca o ID da sessão do contexto ou tenta recuperar o último traineeId salvo
    const currentSessionId = session?.id || session?.sessionId || "sessao-emergencia-001";
    
    console.log("Auditoria Justina: Solicitando PDF para ID:", currentSessionId);
    
    try {
      await apiService.downloadReport(currentSessionId);
    } catch (err) {
      console.error("Erro na exportação:", err);
      alert("Erro: Relatório não disponível. Verifique a conexão com o servidor do Fabio.");
    }
  };

  /** * BLOCO DE AUDITORIA DE SESSÃO:
   * Comentamos a trava abaixo para que o HUD apareça mesmo que
   * tenha marcado a sessão como 'completed' no banco de dados.
   */
  // if (!session) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full p-4 z-[100] pointer-events-none font-mono">
      
      {/* CABEÇALHO SÓLIDO */}
      <div className="flex justify-between items-start text-[11px] text-blue-400">
        <div className="bg-black p-2 border border-blue-900 shadow-lg">
          <p className="font-bold uppercase">JUSTINA VIRTUAL — HUD v1.0.3</p>
          <p className="text-gray-400">OPERADOR: CIRURGIÃO ACADÊMICO</p>
          <p className="text-[9px] text-blue-700">ID: {session?.id?.slice(0,8) || "LOCAL_MODE"}</p>
        </div>
        
        <div className="bg-black p-2 border border-red-900 text-right shadow-lg">
          <p className="text-red-800 font-bold">TEMPO DE ISQUEMIA</p>
          <p className="text-xl text-red-500 font-bold">00:55</p> 
        </div>
      </div>

      {/* PAINEL LATERAL DE TELEMETRIA */}
      <div className="absolute top-28 left-4 space-y-3">
        <div className="bg-black p-3 border border-gray-800 shadow-2xl">
          <p className="text-green-500 text-[10px] font-bold animate-pulse">● TELEMETRIA ATIVA // FE-5</p>
          <div className="mt-2 text-white">
            <p className="text-[9px] text-gray-500 uppercase">Pontos capturados</p>
            <p className="text-2xl font-bold">{path.length.toString().padStart(4, '0')}</p>
          </div>
        </div>

        {/* BOTÃO DE EXPORTAÇÃO (Pointer-events-auto é vital aqui) */}
        <div className="pointer-events-auto">
          <button 
            onClick={handleDownload}
            className="bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] p-3 border border-zinc-700 w-full text-left flex justify-between items-center group transition-all active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          >
            <span className="font-bold tracking-widest">[ EXPORTAR RELATÓRIO PDF ]</span>
            <span className="group-hover:translate-x-1 transition-transform text-blue-500">→</span>
          </button>
        </div>
      </div>

      {/* RODAPÉ ESTRUTURAL */}
      <div className="fixed bottom-6 left-0 w-full text-center space-y-1">
        <p className="text-[9px] text-gray-600 tracking-[0.2em]">
          SISTEMA DE MONITORAMENTO CIRÚRGICO - PROJETO JUSTINA 2026
        </p>
        <div className="flex justify-center gap-4 text-[10px] text-blue-900 font-bold">
          <span>PROTOCOLO ESTÁVEL</span>
          <span>//</span>
          <span>TELEMETRIA FE-5</span>
          <span>//</span>
          <span>DD-READY</span>
        </div>
      </div>

    </div>
  );
}