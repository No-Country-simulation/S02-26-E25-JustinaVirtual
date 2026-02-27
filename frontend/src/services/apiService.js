const API_BASE_URL = "http://localhost:8081/api";

export const apiService = {
  sendTelemetry: async (payload) => {
    if (!payload || !payload.telemetry || payload.telemetry.length === 0) {
      console.warn("⚠️ Tentativa de envio sem dados.");
      return { success: false, message: "Nenhum movimento capturado." };
    }

    // --- TRADUÇÃO PARA O FORMATO QUE O JAVA E A IA ESPERAM ---
    const user = JSON.parse(localStorage.getItem("justina_user") || "{}");
    const usuarioId = user.id || "11111111-1111-1111-1111-111111111111"; // UUID Provisório

    const javaPayload = {
      usuarioId: usuarioId,
      movimentos: payload.telemetry.map((ponto, index) => ({
        eixoX: ponto.x,
        eixoY: ponto.y,
        eixoZ: 0.0,
        rotacao: 0.0,
        eventId: `mov-${index}`,
        timestamp: new Date(ponto.t).toISOString(),
      })),
    };

    try {
      // CORREÇÃO DA ROTA: telemetria/analisar
      const response = await fetch(`${API_BASE_URL}/telemetria/analisar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(javaPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Erro no servidor: ${response.status}`,
        );
      }

      return await response.json(); // Aqui o React finalmente receberá o 200 OK
    } catch (error) {
      console.error("🚨 Erro na Telemetria:", error.message);
      throw error;
    }
  },

  getHistory: async (dni) => {
    if (!dni) throw new Error("DNI é obrigatório.");
    const response = await fetch(`${API_BASE_URL}/v1/medicos/${dni}/historico`);
    return await response.json();
  },

  getDirectorReport: async () => {
    const response = await fetch(
      `${API_BASE_URL}/v1/diretoria/relatorio-geral`,
    );
    return await response.json();
  },
};
