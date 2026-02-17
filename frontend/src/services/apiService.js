const API_BASE_URL = "http://localhost:8081/api";

export const apiService = {
  // 1. Envio de Telemetria
  sendTelemetry: async (payload) => {
    if (!payload || !payload.telemetry || payload.telemetry.length === 0) {
      console.warn("⚠️ Tentativa de envio sem dados.");
      return { success: false, message: "Nenhum movimento capturado." };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/v1/simulacao/finalizar`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro no servidor: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (error.message.includes("Failed to fetch")) {
        console.error("🚨 Backend desligado na porta 8081!");
      }
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