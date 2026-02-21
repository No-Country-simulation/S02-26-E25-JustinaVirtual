const BASE_URL = "http://localhost:8081/api";

export const apiService = {
  /**
   * 1. Iniciar a sessão de treinamento
   * Envia os dados iniciais para o backend criar um registro no banco.
   */
  startSession: async (modulo, traineeId) => {
    try {
      const response = await fetch(`${BASE_URL}/sessoes/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modulo, traineeId }),
      });

      // Se o servidor responder mas com erro (ex: 404 ou 500)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro do servidor: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Captura se o servidor estiver OFF (ERR_CONNECTION_REFUSED)
      console.error("🚨 Falha Crítica no startSession:", error.message);
      throw error;
    }
  },

  /**
   * 2. Enviar a telemetria (Ajustado para o Controller do Fabio)
   * Envia a lista de movimentos e recebe o Feedback da IA.
   */
  sendTelemetry: async (payload) => {
    // Verificação de segurança: O Fabio espera uma LISTA (Array)
    if (!Array.isArray(payload) || payload.length === 0) {
      console.warn("⚠️ Tentativa de enviar telemetria vazia ou inválida.");
      return null;
    }

    try {
      const response = await fetch(`${BASE_URL}/telemetria/analisar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Tenta ler a mensagem de erro do Java, se não conseguir usa o status
        const errorText = await response.text(); 
        throw new Error(`Erro na análise: ${response.status} - ${errorText}`);
      }

      // Retorna o FeedbackIA (o resultado da análise do Fabio)
      const feedback = await response.json();
      console.log("✅ Telemetria enviada e processada:", feedback);
      return feedback;

    } catch (error) {
      console.error("🚨 Erro na comunicação com a API de Telemetria:", error.message);
      // Aqui você poderia disparar um alerta visual na tela para o usuário
      throw error;
    }
  }
};