package br.com.justina.infrastructure.clients;

import br.com.justina.application.ports.output.IAiClientPort;
import br.com.justina.domain.model.FeedbackIA;
import br.com.justina.domain.model.Telemetria;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

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
        return restClient.post()
                .uri("/analisar")
                .contentType(MediaType.APPLICATION_JSON)
                .body(movimentos)
                .retrieve()
                .body(FeedbackIA.class);
    }
}