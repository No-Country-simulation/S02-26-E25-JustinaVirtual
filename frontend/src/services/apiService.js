const API_BASE_URL = "http://localhost:8081/api";

export const apiService = {
  /**
   * Envia a telemetria da simulação para o Backend (Porta 8081)
   * Conecta o trabalho do Frontend com o Backend  e IA.
   */
  sendTelemetry: async (payload) => {
    // Validação de segurança: Não envia se não houver dados
    if (!payload || !payload.telemetry || payload.telemetry.length === 0) {
      console.warn("⚠️ Tentativa de envio de telemetria sem dados.");
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

      // Tratamento de erros de status (404, 500, etc)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro no servidor: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Diferencia erro de conexão de erro de lógica
      if (error.message.includes("Failed to fetch")) {
        console.error("🚨 Erro de Conexão: O Backend (8081) está desligado?");
      }
      console.error("❌ Erro no serviço de telemetria:", error.message);
      throw error; 
    }
  },

  /**
   * Busca o histórico de um médico pelo DNI
   * Facilita a vida do Dev 3 (Dashboard de Resultados)
   */
  getHistory: async (dni) => {
    if (!dni) throw new Error("DNI é obrigatório para buscar histórico.");

    try {
      const response = await fetch(`${API_BASE_URL}/v1/medicos/${dni}/historico`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar histórico: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ Erro ao buscar histórico do DNI ${dni}:`, error.message);
      throw error;
    }
  }
};