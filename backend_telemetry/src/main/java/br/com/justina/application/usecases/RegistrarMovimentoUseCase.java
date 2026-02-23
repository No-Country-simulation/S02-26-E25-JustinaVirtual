package br.com.justina.application.usecases;

import br.com.justina.application.ports.output.IAiClientPort;
import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.domain.model.FeedbackIA;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.Telemetria;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegistrarMovimentoUseCase {

    private final ITelemetriaRepositoryPort repository;
    private final IAiClientPort aiClient;

    public FeedbackIA executar(UUID usuarioId, List<Telemetria> movimentos) {
        log.info("Persistindo {} movimentos para usuário {} e solicitando análise IA", movimentos.size(), usuarioId);

        // 1. IA Analisa
        FeedbackIA feedback = aiClient.analisarMovimentos(movimentos);
        
        // 2. Persistência (Cria sessão e salva)
        repository.salvarTudo(usuarioId, movimentos);

        // 3. Lógica da Equipe 
        if (feedback != null && "ERRO".equalsIgnoreCase(feedback.getStatus())) {
            log.warn("Feedback IA indica ERRO no movimento");
            
            
            if (!movimentos.isEmpty() && movimentos.get(0).getSessao() != null) {
                SessaoSimulacao sessao = movimentos.get(0).getSessao();
                int erros = (sessao.getTotalErros() != null) ? sessao.getTotalErros() : 0;
                sessao.setTotalErros(erros + 1);

                repository.salvarSessao(sessao);
                log.info("Erro registrado na sessão {}", sessao.getId());
            }
        }
        
        return feedback;
    }
}