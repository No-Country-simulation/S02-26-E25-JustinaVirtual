const API_BASE_URL = "http://localhost:8081/api";
const AI_BASE_URL = "http://localhost:8000";

export const apiService = {
  // 1. Envio de Telemetria (Reconstrução Task 8)
  sendTelemetry: async (payload) => {
    if (!payload || !payload.telemetry || payload.telemetry.length === 0) {
      console.warn("⚠️ Tentativa de envio sem dados de telemetria.");
      return { success: false, message: "Nenhum movimento capturado." };
    }

    // --- TRADUÇÃO PARA O FORMATO QUE O MOTOR JAVA ESPERA ---
    const user = JSON.parse(localStorage.getItem("justina_user") || "{}");
    const usuarioId = user.id || "11111111-1111-1111-1111-111111111111";

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
      // Enviamos para a rota de análise que processa as colisões e pontuação
      const response = await fetch(`${API_BASE_URL}/telemetria/analisar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Mantido por compatibilidade com a branch dev
        },
        body: JSON.stringify(javaPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Erro no servidor: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("🚨 Erro na Telemetria:", error.message);
      throw error;
    }
  },

  // 2. Histórico do Médico
  getHistory: async (dni) => {
    if (!dni) throw new Error("DNI é obrigatório.");
    const response = await fetch(`${API_BASE_URL}/v1/medicos/${dni}/historico`);
    return await response.json();
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
  },

  // 4. Inicia coleta de dados
  startDataCollection: async (userId, procedureType = "renal_surgery") => {
    try {
      const response = await fetch(`${AI_BASE_URL}/sessions/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: userId,
          procedure_type: procedureType
        })
      });
      if (!response.ok) throw new Error(`Erro: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("❌ Erro ao iniciar coleta:", error.message);
      throw error;
    }
  },

  // 5. Envia lote de telemetria
  sendTelemetryBatch: async (sessionId, telemetryPoints) => {
    try {
      const formattedPoints = telemetryPoints.map(point => ({
        timestamp: point.timestamp / 1000,
        position: {
          x: point.x,
          y: point.y,
          z: point.z
        },
        instrument_id: "surgical_tool"
      }));

      const response = await fetch(`${AI_BASE_URL}/sessions/${sessionId}/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedPoints)
      });
      if (!response.ok) throw new Error(`Erro: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("❌ Erro ao enviar lote:", error.message);
      throw error;
    }
  },

  // 6. Completa sessão
  completeDataCollection: async (sessionId) => {
    try {
      const response = await fetch(`${AI_BASE_URL}/sessions/${sessionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_feedback: "Sessão concluída via simulador",
          difficulty_rating: 3
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro ${response.status}: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error("❌ Erro ao completar coleta:", error.message);
      throw error;
    }
  }
};
