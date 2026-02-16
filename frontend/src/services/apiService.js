const API_BASE_URL = "http://localhost:8081";
const TEST_TOKEN = "MEU_TOKEN_DE_TESTE";

export const apiService = {
  // 1. Iniciar Sessão (Conforme especificado pela Stephanny)
  startSession: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessoes/iniciar`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TEST_TOKEN}` // Dica da Stephanny!
        }
      });

      if (response.status === 409) {
        throw new Error("⚠️ Você já possui uma sessão em andamento no servidor.");
      }

      if (!response.ok) throw new Error(`Erro ao iniciar: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("🚨 Falha na conexão com o Backend:", error.message);
      throw error;
    }
  },

  // 2. Finalizar Sessão (PUT http://localhost:8081/api/sessoes/{id}/finalizar)
  finishSession: async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessoes/${sessionId}/finalizar`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${TEST_TOKEN}`
        }
      });

      if (!response.ok) throw new Error("Erro ao finalizar sessão no servidor.");
      return await response.json();
    } catch (error) {
      console.error("❌ Erro ao encerrar:", error.message);
      throw error;
    }
  },

  // 3. Login (Para autenticação futura)
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    return await response.json();
  }
};