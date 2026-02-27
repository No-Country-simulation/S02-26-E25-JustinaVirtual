const API_BASE_URL = "http://localhost:8081/api";
const AI_BASE_URL = "http://localhost:8000";

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
  },

  // 4. AI Service - Inicia coleta de dados
  startDataCollection: async (userId) => {
    try {
      const response = await fetch(`${AI_BASE_URL}/sessions/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: userId,
          procedure_type: "renal_surgery"
        })
      });
      if (!response.ok) throw new Error(`Erro: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("❌ Erro ao iniciar coleta:", error.message);
      throw error;
    }
  },

  // 5. AI Service - Envia lote de telemetria
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

  // 6. AI Service - Completa sessão
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