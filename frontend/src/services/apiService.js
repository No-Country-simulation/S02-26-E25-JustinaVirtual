const API_BASE_URL = "http://localhost:8081/api";

export const apiService = {
  // 1. Envio de Telemetria
  sendTelemetry: async (payload) => {    
    if (!payload || !payload.sessionId) {
      console.warn("⚠️ Tentativa de finalizar sem ID de sessão.");
      return { success: false, message: "ID da sessão não encontrado." };
    }

    try {  
      const response = await fetch(`${API_BASE_URL}/telemetria/finalizar?sessaoId=${payload.sessionId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}` // Segurança!
        },
        body: JSON.stringify({
          user_feedback: "Finalizado via simulador",
          difficulty_rating: 3 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro no servidor: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("🚨 Erro ao finalizar telemetria:", error.message);
      throw error; 
    }
  },

  // 2. Busca Histórico Individual (Dev 3)
  getHistory: async (dni) => {
    if (!dni) throw new Error("DNI é obrigatório.");
    try {
      const response = await fetch(`${API_BASE_URL}/v1/medicos/${dni}/historico`);
      if (!response.ok) throw new Error(`Erro: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`❌ Erro DNI ${dni}:`, error.message);
      throw error;
    }
  },

  // 3. Relatório para a Diretoria
  getDirectorReport: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/diretoria/relatorio-geral`);
      if (!response.ok) throw new Error(`Erro: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("❌ Erro Relatório Diretoria:", error.message);
      throw error;
    }
  }
};