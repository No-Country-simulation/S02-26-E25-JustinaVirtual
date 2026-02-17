const BASE_URL = "http://localhost:8081/api";

export const apiService = {
  // 1. Iniciar a sessão (Onde deu ERR_CONNECTION_REFUSED porque o Java estava desligado)
  startSession: async (modulo, traineeId) => {
    try {
      const response = await fetch(`${BASE_URL}/sessoes/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modulo, traineeId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao iniciar sessão");
      }
      
      return await response.json();
    } catch (error) {
      console.error("🚨 Erro no startSession:", error.message);
      throw error;
    }
  },

  // 2. Enviar a telemetria 
  sendTelemetry: async (payload) => {
    try {
      const response = await fetch(`${BASE_URL}/telemetria`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Falha ao transmitir telemetria.");
      
      return await response.json();
    } catch (error) {
      console.error("🚨 Erro no sendTelemetry:", error);
      throw error;
    }
  }
};