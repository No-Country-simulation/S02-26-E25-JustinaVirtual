const envUrl = import.meta.env.VITE_API_URL;
export const API_BASE_URL =
  envUrl && envUrl !== "" ? envUrl : "http://localhost:8080/api";

export const AI_BASE_URL = "http://localhost:8000";

console.log("Conectando em:", API_BASE_URL);

export const apiService = {
  // 1. Registro de Usuário
  registerUser: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = "Erro ao registrar usuário.";

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          const text = await response.text();
          if (text) errorMessage = text;
        }

        throw new Error(errorMessage);
      }

      return await response.text(); 
    } catch (error) {
      console.error("❌ Erro ao registrar usuário:", error.message);
      throw error;
    }
  },
      //Login
    loginUser: async (credentials) => {
      try {
        const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        if (!response.ok) {
          throw new Error("E-mail ou senha inválidos.");
        }

        return await response.json(); 
      } catch (error) {
        console.error("❌ Erro no login:", error.message);
        throw error;
      }
    },

  // 2. Envio de Telemetria
  sendTelemetry: async (payload) => {
    if (!payload || !payload.telemetry || payload.telemetry.length === 0) {
      console.warn("⚠️ Tentativa de envio sem dados de telemetria.");
      return { success: false, message: "Nenhum movimento capturado." };
    }

    const user = JSON.parse(localStorage.getItem("justina_user") || "{}");
    const usuarioId =
      user.id || "11111111-1111-1111-1111-111111111111";

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
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(javaPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Erro no servidor: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("🚨 Erro na Telemetria:", error.message);
      throw error;
    }
  },

  // 3. Busca Histórico Individual
  getHistory: async (dni) => {
    if (!dni) throw new Error("DNI é obrigatório.");

    try {
      const response = await fetch(
        `${API_BASE_URL}/medicos/${dni}/historico`
      );

      if (!response.ok)
        throw new Error(`Erro: ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error(`❌ Erro DNI ${dni}:`, error.message);
      throw error;
    }
  },

  // 4. Relatório para Admin
  getDirectorReport: async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/diretoria/relatorio-geral`
      );

      if (!response.ok)
        throw new Error(`Erro: ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error(
        "❌ Erro Relatório Diretoria:",
        error.message
      );
      throw error;
    }
  },

  // 5. Funções da IA
  startDataCollection: async (
    userId,
    procedureType = "renal_surgery"
  ) => {
    try {
      const response = await fetch(`${AI_BASE_URL}/sessions/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          procedure_type: procedureType,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error(
        "❌ Erro ao iniciar coleta:",
        error.message
      );
      throw error;
    }
  },

  sendTelemetryBatch: async (sessionId, telemetryPoints) => {
    try {
      const response = await fetch(`${AI_BASE_URL}/sessions/${sessionId}/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telemetryPoints),
      });

      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Erro ao enviar telemetria:", error.message);
      throw error;
    }
  },

  completeDataCollection: async (sessionId, userFeedback = null, difficultyRating = null) => {
    try {
      const response = await fetch(`${AI_BASE_URL}/sessions/${sessionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_feedback: userFeedback,
          difficulty_rating: difficultyRating,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Erro ao finalizar coleta:", error.message);
      throw error;
    }
  },

  getUserSessions: async (userEmail) => {
    try {
      const response = await fetch(`${AI_BASE_URL}/sessions/user/${userEmail}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Erro ao buscar sessões:", error.message);
      throw error;
    }
  },

  // 6. Listar todos os usuários (Admin)
  getAllUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok)
        throw new Error(`Erro: ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error(
        "❌ Erro ao listar usuários:",
        error.message
      );
      throw error;
    }
  },
};

window.apiService = apiService;