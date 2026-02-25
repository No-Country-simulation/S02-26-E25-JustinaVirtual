// Configurações Globais
const BASE_URL = "https://justina-backend.onrender.com/api";
const TEST_TOKEN = "MEU_TOKEN_DE_TESTE";

export const apiService = {
  /**
   * 1. Iniciar a sessão de treinamento
   * Registra o início da cirurgia no Banco de Dados.
   */
  startSession: async (modulo, traineeId) => {
    try {
      const response = await fetch(`${BASE_URL}/sessoes/iniciar`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TEST_TOKEN}`
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
   * 2. Enviar a telemetria
   * Envia os movimentos para o Engine do Fabio e recebe o feedback da IA.
   */
  sendTelemetry: async (payload) => {
    if (!Array.isArray(payload) || payload.length === 0) {
      console.warn("⚠️ Telemetria vazia.");
      return null;
    }

    try {
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
      console.log("✅ Telemetria processada:", feedback);
      return feedback;

    } catch (error) {
      console.error("🚨 Erro na comunicação com a API:", error.message);
      throw error;
    }
  },

  /**
   * 3. Download de Relatório PDF (Novo!)
   * Busca o relatório com gráficos que o Fabio e a IA geraram.
   */
  downloadReport: async (sessionId) => {
    try {
      console.log(`⏳ Gerando PDF para a sessão: ${sessionId}...`);
      const response = await fetch(`${BASE_URL}/sessoes/${sessionId}/relatorio`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${TEST_TOKEN}`
        },
      });

      if (!response.ok) throw new Error("Não foi possível baixar o relatório PDF.");

      // Converte a resposta em um arquivo (blob)
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Cria um link invisível e "clica" nele para baixar o arquivo
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `justina_report_${sessionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      console.log("✅ PDF baixado com sucesso!");
    } catch (error) {
      console.error("🚨 Erro ao baixar PDF:", error.message);
      throw error;
    }
  },

  /**
   * 4. Buscar Histórico (Novo!)
   * Atende ao endpoint que o pessoal estava testando no chat.
   */
  getHistory: async () => {
    try {
      const response = await fetch(`${BASE_URL}/sessoes/historico`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${TEST_TOKEN}`
        },
      });

      if (response.status === 401) {
        console.error("❌ Token de teste não possui usuário vinculado no DB.");
      }

      if (!response.ok) throw new Error("Erro ao buscar histórico.");

      return await response.json();
    } catch (error) {
      console.error("🚨 Falha ao obter histórico:", error.message);
      throw error;
    }
  }
};