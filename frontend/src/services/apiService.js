const API_BASE_URL = "http://localhost:8081/api";

export const apiService = {
  // Envia a telemetria (Conecta com Dev 1 e Dev 2)
  sendTelemetry: async (payload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/simulacao/finalizar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erro ao enviar dados");
      return await response.json();
    } catch (error) {
      console.error("Erro no serviço de telemetria:", error);
      throw error;
    }
  },

  // Busca histórico (Conecta com Dev 3)
  getHistory: async (dni) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/medicos/${dni}/historico`);
      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      throw error;
    }
  }
};