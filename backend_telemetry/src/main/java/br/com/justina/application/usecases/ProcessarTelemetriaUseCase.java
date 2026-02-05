package br.com.justina.application.usecases;

import br.com.justina.application.ports.output.IAiClientPort;
import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.domain.model.FeedbackIA;
import br.com.justina.domain.model.Telemetria;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProcessarTelemetriaUseCase {

    private final ITelemetriaRepositoryPort repository;
    private final IAiClientPort aiClient;

    public FeedbackIA executar(List<Telemetria> movimentos) {
        // 1. Poderíamos ter lógica aqui (ex: validar se os pontos são coerentes)
        
        // 2. Manda para a IA analisar
        FeedbackIA feedback = aiClient.analisarMovimentos(movimentos);
        
        // 3. Salva no banco de dados (persistência)
        repository.salvarTudo(movimentos);
        
        return feedback;
    }
}