const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
export const API_BASE_URL = envUrl && envUrl !== "" ? envUrl : "http://localhost:8081/api";
export const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL || "http://localhost:8000";

console.log("Conectando em:", API_BASE_URL);

export const apiService = {
  // 1. Envio de Telemetria 
  sendTelemetry: async (payload) => {
    if (!payload || !payload.telemetry || payload.telemetry.length === 0) {
      console.warn("⚠️ Tentativa de envio sem dados de telemetria.");
      return { success: false, message: "Nenhum movimento capturado." };
    }

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
      const response = await fetch(`${API_BASE_URL}/telemetria/analisar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(javaPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro no servidor: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("🚨 Erro na Telemetria:", error.message);
      throw error;
    }
  },

  // 2. Busca Histórico Individual
  getHistory: async (dni) => {
    if (!dni) throw new Error("DNI é obrigatório.");
    try {    
      const response = await fetch(`${API_BASE_URL}/medicos/${dni}/historico`);
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
      const response = await fetch(`${API_BASE_URL}/diretoria/relatorio-geral`);
      if (!response.ok) throw new Error(`Erro: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("❌ Erro Relatório Diretoria:", error.message);
      throw error;
    }
  },

  // 4. Funções da IA (Mantendo o que veio da branch dev)
  startDataCollection: async (userId, procedureType = "renal_surgery") => {
    try {
      const response = await fetch(`${AI_BASE_URL}/sessions/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, procedure_type: procedureType })
      });
      return await response.json();
    } catch (error) {
      console.error("❌ Erro ao iniciar coleta:", error.message);
      throw error;
    }
  },

  // 5. Listar todos os usuários (Admin - Exclusivo da sua feature)
  getAllUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error(`Erro: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("❌ Erro ao listar usuários:", error.message);
      throw error;
    }
  },

  // 5. Buscar sessões do usuário com análise da IA
  getUserSessions: async (userId) => {
    try {
      const response = await fetch(`${AI_BASE_URL}/sessions/user/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("[IA] Erro ao buscar sessões:", error);
      return { user_id: userId, total_sessions: 0, sessions: [] };
    }
  }
};

window.apiService = apiService;