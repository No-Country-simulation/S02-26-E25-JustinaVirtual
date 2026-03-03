const envUrl = import.meta.env.VITE_API_URL;
export const API_BASE_URL = envUrl && envUrl !== "" ? envUrl : "http://localhost:8080/api";

console.log("Conectando em:", API_BASE_URL);
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
          "Authorization": `Bearer ${localStorage.getItem('token')}`
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

  // 2. Busca Histórico Individual
  getHistory: async (dni) => {
    if (!dni) throw new Error("DNI é obrigatório.");
    try {
      const response = await fetch(`${API_BASE_URL}/medicos/${dni}/historico`);
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
      const response = await fetch(`${API_BASE_URL}/diretoria/relatorio-geral`);
      if (!response.ok) throw new Error(`Erro: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("❌ Erro Relatório Diretoria:", error.message);
      throw error;
    }
  },

  // 4. Listar todos os usuários (Admin)
  getAllUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem('token')}` 
        },
      });
      if (!response.ok) throw new Error(`Erro: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("❌ Erro ao listar usuários:", error.message);
      throw error;
    }
  }
};
window.apiService = apiService;