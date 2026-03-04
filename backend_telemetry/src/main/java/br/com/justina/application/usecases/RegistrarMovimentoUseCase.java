package br.com.justina.application.usecases;

import br.com.justina.application.ports.output.IAiClientPort;
import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.application.services.RegrasCirurgiaService;
import br.com.justina.domain.model.Cirurgia;
import br.com.justina.domain.model.FeedbackIA;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.Telemetria;
import br.com.justina.infrastructure.exception.RegraCirurgiaException;
import br.com.justina.domain.repository.CirurgiaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegistrarMovimentoUseCase {

    private final ITelemetriaRepositoryPort repository;
    private final IAiClientPort aiClient;
    private final RegrasCirurgiaService regrasService;
    private final CirurgiaRepository cirurgiaRepository;

    @Transactional
    public FeedbackIA executar(UUID usuarioId, List<Telemetria> movimentos) {
        log.info("Persistindo {} movimentos para usuário {} e solicitando análise IA", movimentos.size(), usuarioId);

        if (!movimentos.isEmpty() && movimentos.get(0).getSessao() != null) {
            SessaoSimulacao sessao = movimentos.get(0).getSessao();

            // 1. Vincula a cirurgia ANTES de tentar salvar no banco!
            if (sessao.getCirurgia() == null) {
                Cirurgia cirurgiaBase = cirurgiaRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new IllegalStateException("Nenhuma cirurgia cadastrada no sistema!"));
                sessao.setCirurgia(cirurgiaBase);
            }

            // 2. Valida as regras de colisão e tempo em memória
            for (Telemetria movimento : movimentos) {
                regrasService.analisarMovimento(movimento, sessao);
            }
        }

        // 3. Pede feedback para a IA do Google Gemini
        FeedbackIA feedback = aiClient.analisarMovimentos(movimentos);

        // 4. Se a IA detectou um erro crítico, penalizamos a sessão
        if (feedback != null && "ERRO".equalsIgnoreCase(feedback.getStatus()) && !movimentos.isEmpty()
                && movimentos.get(0).getSessao() != null) {
            SessaoSimulacao sessao = movimentos.get(0).getSessao();
            int erros = (sessao.getTotalErros() != null) ? sessao.getTotalErros() : 0;
            sessao.setTotalErros(erros + 1);
        }

        // 5. Persiste tudo
        repository.salvarTudo(usuarioId, movimentos);

        if (!movimentos.isEmpty() && movimentos.get(0).getSessao() != null) {
            SessaoSimulacao sessao = movimentos.get(0).getSessao();
            repository.salvarSessao(sessao);
            log.info("Sessão {} salva com sucesso. Erros acumulados: {} | Pontuação: {}",
                    sessao.getId(), sessao.getTotalErros(), sessao.getPontuacaoGeral());
        }

        return feedback;
    }
}