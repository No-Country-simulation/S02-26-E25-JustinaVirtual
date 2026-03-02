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

    // Construtor Híbrido: Usa localhost por padrão (seu), mas com a limpeza de string da equipe
    public PythonAiClientAdapter(@Value("${app.ai-service.url:http://localhost:5000}") String aiServiceUrl) {
        this.restClient = RestClient.builder().build();
        this.aiServiceUrl = aiServiceUrl.trim().replaceAll("\\s", "").replaceAll("/+$", "");
    }

    @Override
    public FeedbackIA analisarMovimentos(List<Telemetria> movimentos) {
        try {
            // Usa UriComponentsBuilder (Mais seguro, vindo da equipe)
            URI targetUri = UriComponentsBuilder.fromHttpUrl(this.aiServiceUrl)
                    .path("/analisar")
                    .build()
                    .toUri();

            System.out.println("DEBUG: Enviando " + movimentos.size() + " pontos para IA: " + targetUri);

            return restClient.post()
                    .uri(targetUri)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(movimentos)
                    .retrieve()
                    .body(FeedbackIA.class);
        } catch (Exception e) {
            System.err.println("Erro ao chamar serviço Python: " + e.getMessage());
            // Retorna feedback de erro para não quebrar o Java
            return new FeedbackIA("ERRO", "Falha na comunicação com IA", 0.0);
        }
    }

    @Override
    public void solicitarRelatorioFinal(UUID sessaoId) {
        try {
            // Endpoint que criamos no Python (/relatorio/{id})
            URI targetUri = UriComponentsBuilder.fromHttpUrl(this.aiServiceUrl)
                    .path("/relatorio/{id}")
                    .buildAndExpand(sessaoId)
                    .toUri();

            System.out.println("DEBUG: Solicitando PDF para IA em: " + targetUri);

            restClient.post()
                    .uri(targetUri)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            System.err.println("Falha ao solicitar relatório para IA: " + e.getMessage());
        }
    }
}