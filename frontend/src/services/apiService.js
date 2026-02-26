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

// ========================================
// API DE IA - COLETA DE DADOS
// ========================================

const AI_API_BASE_URL = import.meta.env.VITE_AI_API_URL || "http://localhost:8000";

export const aiService = {
  // Iniciar sessão de coleta
  startDataCollection: async (userId, skillLevel = null, procedureType = "suture") => {
    try {
      const response = await fetch(`${AI_API_BASE_URL}/sessions/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          user_id: userId,
          skill_level: skillLevel,
          procedure_type: procedureType
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao iniciar coleta: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Sessão de coleta IA iniciada:", data.session_id);
      return data;
    } catch (error) {
      console.error("Erro em startDataCollection:", error);
      throw error;
    }
  },

  // Enviar batch de telemetria
  sendTelemetryBatch: async (sessionId, telemetryPoints) => {
    if (!sessionId || !telemetryPoints || telemetryPoints.length === 0) {
      console.warn("Tentativa de envio sem dados");
      return { success: false };
    }

    try {
      const response = await fetch(
        `${AI_API_BASE_URL}/sessions/${sessionId}/telemetry`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(telemetryPoints),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao enviar telemetria: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro em sendTelemetryBatch:", error);
      // Não lança erro para não interromper simulação
      return { success: false, error: error.message };
    }
  },

  // Finalizar sessão de coleta
  completeDataCollection: async (sessionId, userFeedback = null, difficultyRating = null) => {
    try {
      const response = await fetch(
        `${AI_API_BASE_URL}/sessions/${sessionId}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            session_id: sessionId,
            user_feedback: userFeedback,
            difficulty_rating: difficultyRating
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao finalizar coleta: ${response.status}`);
      }

      const data = await response.json();
      console.log("Sessão IA finalizada e salva:", data.saved_to);
      return data;
    } catch (error) {
      console.error("Erro em completeDataCollection:", error);
      throw error;
    }
  },

  // Obter estatísticas do dataset
  getDatasetStats: async () => {
    try {
      const response = await fetch(`${AI_API_BASE_URL}/dataset/stats`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar stats: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Erro em getDatasetStats:", error);
      return { total_sessions: 0, message: "Erro ao carregar" };
    }
  }
};