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

    public PythonAiClientAdapter(@Value("${app.ai-service.url:http://localhost:5000}") String aiServiceUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(aiServiceUrl)
                .build();
    }

    @Override
    public FeedbackIA analisarMovimentos(List<Telemetria> movimentos) {
        // Envia os dados para o Python e recebe o feedback imediato
        return restClient.post()
                .uri("/analisar")
                .contentType(MediaType.APPLICATION_JSON)
                .body(movimentos)
                .retrieve()
                .body(FeedbackIA.class);
    } 
    // ^--- O erro provavelmente estava aqui (faltava fechar essa chave)

    @Override
    public void solicitarRelatorioFinal(UUID sessaoId) {
        // Simulação da chamada assíncrona para o relatório final
        System.out.println("IA: Solicitando relatório final para sessão " + sessaoId);
        
        /* Futuramente, descomentaremos quando o Python tiver essa rota:
        restClient.post()
                .uri("/relatorio/" + sessaoId)
                .retrieve()
                .toBodilessEntity();
        */
    }
}