package br.com.justina.application.usecases;

import br.com.justina.application.ports.output.IAiClientPort;
import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.StatusSessao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FinalizarCirurgiaUseCase {

    private final ITelemetriaRepositoryPort repository;
    private final IAiClientPort aiClient;

    @Transactional
    public SessaoSimulacao executar(UUID sessaoId) {
        log.info("Iniciando finalização da cirurgia/sessão: {}", sessaoId);

        // 1. Buscar Sessão
        SessaoSimulacao sessao = repository.buscarSessaoPorId(sessaoId)
                .orElseThrow(() -> new IllegalArgumentException("Sessão não encontrada: " + sessaoId));

        // 2. Validar Status
        if (sessao.isFinalizada()) {
            log.warn("Tentativa de finalizar sessão já encerrada: {}", sessaoId);
            return sessao; // Idempotência: se já finalizou, retorna como está
        }

        // 3. Atualizar Dados de Finalização
        LocalDateTime agora = LocalDateTime.now();
        sessao.setDataFim(agora);
        sessao.setStatus(StatusSessao.FINALIZADA);

        // Calcular tempo total em segundos
        if (sessao.getDataInicio() != null) {
            long segundos = Duration.between(sessao.getDataInicio(), agora).getSeconds();
            sessao.setTempoTotalSegundos(segundos);
        }

        // 4. Salvar (Persistência)
        SessaoSimulacao sessaoSalva = repository.salvarSessao(sessao);
        log.info("Sessão {} finalizada com sucesso. Tempo total: {}s", sessaoId, sessao.getTempoTotalSegundos());

        // 5. Acionar IA (Trigger Assíncrono)
        try {
            aiClient.solicitarRelatorioFinal(sessaoId);
        } catch (Exception e) {
            log.error("Erro ao solicitar relatório final para IA (Sessão {}): {}", sessaoId, e.getMessage());
            // Não relança exceção para não rollbackar a finalização da sessão no banco
        }

        return sessaoSalva;
    }
}
