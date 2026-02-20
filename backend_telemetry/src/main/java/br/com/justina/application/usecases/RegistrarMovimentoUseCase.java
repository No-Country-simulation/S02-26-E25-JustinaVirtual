package br.com.justina.application.usecases;

import br.com.justina.application.ports.output.IAiClientPort;
import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.domain.model.FeedbackIA;
import br.com.justina.domain.model.Telemetria;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistrarMovimentoUseCase {

    private final ITelemetriaRepositoryPort repository;
    private final IAiClientPort aiClient;

    // Atualização da assinatura do método para receber o ID
    public FeedbackIA executar(UUID usuarioId, List<Telemetria> movimentos) {
        
        // 1. Manda para a IA analisar
        FeedbackIA feedback = aiClient.analisarMovimentos(movimentos);
        
        // 2. Salva no banco passando o ID do usuário dono da sessão
        repository.salvarTudo(usuarioId, movimentos);
        
        return feedback;
    }
}