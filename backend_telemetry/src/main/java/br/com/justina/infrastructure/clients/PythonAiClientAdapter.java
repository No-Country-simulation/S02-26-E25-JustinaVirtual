package br.com.justina.infrastructure.clients;

import br.com.justina.application.ports.output.IAiClientPort;
import br.com.justina.domain.model.FeedbackIA;
import br.com.justina.domain.model.Telemetria;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.UUID;

@Component
public class PythonAiClientAdapter implements IAiClientPort {

    private final RestClient restClient;

    // Injeta a URL do serviço Python (definir no application.properties)
    public PythonAiClientAdapter(@Value("${app.ai-service.url:http://localhost:5000}") String aiServiceUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(aiServiceUrl)
                .build();
    }

    @Override
    public FeedbackIA analisarMovimentos(List<Telemetria> movimentos) {
        // Log para debug
        System.out.println("Enviando " + movimentos.size() + " pontos de telemetria para o serviço Python...");

        // Faz o POST para o serviço Python (ex: endpoint /analisar)
        try {
            return restClient.post()
                    .uri("/analisar")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(movimentos)
                    .retrieve()
                    .body(FeedbackIA.class);
        } catch (Exception e) {
            System.err.println("Erro ao chamar serviço Python: " + e.getMessage());
            // Retorna um fallback para não quebrar o fluxo síncrono por enquanto
            return new FeedbackIA(); 
        }
    }

    @Override
    public void solicitarRelatorioFinal(UUID sessaoId) {
        System.out.println("Trigger Assíncrono para IA -> Gerar Relatório Sessão: " + sessaoId);
        
        // Chamada assíncrona (fire-and-forget ou fila)
        // Por enquanto, faremos uma chamada REST simples sem esperar resposta complexa
        try {
            restClient.post()
                    .uri("/relatorio/" + sessaoId)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            System.err.println("Falha ao notificar IA sobre fim de sessão (esperado se serviço offline): " + e.getMessage());
        }
    }
}
