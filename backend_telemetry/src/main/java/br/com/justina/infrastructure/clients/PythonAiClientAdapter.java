package br.com.justina.infrastructure.clients;

import br.com.justina.application.ports.output.IAiClientPort;
import br.com.justina.domain.model.FeedbackIA;
import br.com.justina.domain.model.Telemetria;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Component
public class PythonAiClientAdapter implements IAiClientPort {

    private final RestClient restClient;
    private final String aiServiceUrl;

    public PythonAiClientAdapter(@Value("${app.ai-service.url:http://ai_service:8000}") String aiServiceUrl) {
        this.restClient = RestClient.builder().build();
        // Remove espaços, quebras de linha invisíveis (\s) e barras no final
        this.aiServiceUrl = aiServiceUrl.trim().replaceAll("\\s", "").replaceAll("/+$", "");
    }

    @Override
    public FeedbackIA analisarMovimentos(List<Telemetria> movimentos) {
        try {
            // Constrói a URI de forma segura
            URI targetUri = UriComponentsBuilder.fromHttpUrl(this.aiServiceUrl)
                    .path("/analisar")
                    .build()
                    .toUri();

            System.out.println("DEBUG: Enviando " + movimentos.size() + " pontos para: " + targetUri);

            return restClient.post()
                    .uri(targetUri)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(movimentos)
                    .retrieve()
                    .body(FeedbackIA.class);
        } catch (Exception e) {
            System.err.println("Erro ao chamar serviço Python: " + e.getMessage());
            return new FeedbackIA();
        }
    }

    @Override
    public void solicitarRelatorioFinal(UUID sessaoId) {
        try {
            URI targetUri = UriComponentsBuilder.fromHttpUrl(this.aiServiceUrl)
                    .path("/relatorio/{id}")
                    .buildAndExpand(sessaoId)
                    .toUri();

            System.out.println("DEBUG: Trigger Relatório Final em: " + targetUri);

            restClient.post()
                    .uri(targetUri)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            System.err.println("Falha ao notificar IA: " + e.getMessage());
        }
    }
}