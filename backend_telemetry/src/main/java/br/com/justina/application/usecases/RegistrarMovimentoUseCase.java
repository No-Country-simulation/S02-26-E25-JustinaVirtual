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

@Slf4j
@Service
@RequiredArgsConstructor
public class RegistrarMovimentoUseCase {

    private final ITelemetriaRepositoryPort repository;
    private final IAiClientPort aiClient;

    public FeedbackIA executar(List<Telemetria> movimentos) {

        FeedbackIA feedback = aiClient.analisarMovimentos(movimentos);
        repository.salvarTudo(movimentos);

        if (feedback != null && "ERRO".equalsIgnoreCase(feedback.getStatus())) {
            SessaoSimulacao sessao = movimentos.get(0).getSessao();

            if (sessao != null) {
                int erros = (sessao.getTotalErros() != null) ? sessao.getTotalErros() : 0;
                sessao.setTotalErros(erros + 1);

                repository.salvarSessao(sessao);
                log.info("Feedback IA processado: Erro registrado via status da IA para a sessão {}", sessao.getId());
            }
        }
        return feedback;
    }
}