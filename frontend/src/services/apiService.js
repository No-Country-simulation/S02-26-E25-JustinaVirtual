// Alterado para o endereço oficial fornecido pela Stephanny
const BASE_URL = "https://justina-backend.onrender.com/api";

// Token estático de teste para contornar rotas protegidas por enquanto
const TEST_TOKEN = "MEU_TOKEN_DE_TESTE";

export const apiService = {
  /**
   * 1. Iniciar a sessão de treinamento
   */
  startSession: async (modulo, traineeId) => {
    try {
      const response = await fetch(`${BASE_URL}/sessoes/iniciar`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TEST_TOKEN}` // Inserindo segurança sugerida pela Stephanny
        },
        body: JSON.stringify({ modulo, traineeId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro do servidor: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("🚨 Falha Crítica no startSession:", error.message);
      throw error;
    }
  },

  /**
   * 2. Enviar a telemetria (Conectando com o Engine do Fabio no Render)
   */
  sendTelemetry: async (payload) => {
    if (!Array.isArray(payload) || payload.length === 0) {
      console.warn("⚠️ Tentativa de enviar telemetria vazia ou inválida.");
      return null;
    }

    try {
      // Como o servidor pode estar "dormindo", definimos um tempo de espera maior
      const response = await fetch(`${BASE_URL}/telemetria/analisar`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TEST_TOKEN}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text(); 
        throw new Error(`Erro na análise: ${response.status} - ${errorText}`);
      }

      const feedback = await response.json();
      console.log("✅ Telemetria enviada com sucesso para o Render:", feedback);
      return feedback;

    } catch (error) {
      console.error("🚨 Erro na comunicação com a API (Render):", error.message);
      // Dica: Se o erro for "Failed to fetch", pode ser o servidor acordando!
      throw error;
    }
  }
};