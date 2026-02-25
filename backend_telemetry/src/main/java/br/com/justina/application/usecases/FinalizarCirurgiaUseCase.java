package br.com.justina.application.usecases;

import br.com.justina.application.ports.output.IAiClientPort;
import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.StatusSessao;
import br.com.justina.domain.model.Telemetria;
import br.com.justina.infrastructure.dto.FinalizarCirurgiaDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FinalizarCirurgiaUseCase {

    private final ITelemetriaRepositoryPort repository;
    private final IAiClientPort aiClient;

    @Transactional
    public SessaoSimulacao executar(UUID sessaoId, FinalizarCirurgiaDTO dto) {
        log.info("Iniciando finalização da cirurgia/sessão: {}", sessaoId);

        // 1. Buscar Sessão
        SessaoSimulacao sessao = repository.buscarSessaoPorId(sessaoId)
                .orElseThrow(() -> new IllegalArgumentException("Sessão não encontrada: " + sessaoId));

        // 2. Validar Status
        if (sessao.isFinalizada()) {
            log.warn("Tentativa de finalizar sessão já encerrada: {}", sessaoId);
            return sessao;
        }

        // 3. Atualizar Dados
        LocalDateTime agora = LocalDateTime.now();
        sessao.setDataFim(agora);
        sessao.setStatus(StatusSessao.FINALIZADA);

        if (sessao.getDataInicio() != null) {
            long segundos = Duration.between(sessao.getDataInicio(), agora).getSeconds();
            sessao.setTempoTotalSegundos(segundos);
        }

        // 4. Salvar (Agora retorna a sessão salva!)
        SessaoSimulacao sessaoSalva = repository.salvarSessao(sessao);
        log.info("Sessão {} finalizada com sucesso.", sessaoId);

        // 5. Acionar IA (Relatório)
        try {
            aiClient.solicitarRelatorioFinal(sessaoId);
        } catch (Exception e) {
            log.error("Erro ao solicitar relatório final para IA: {}", e.getMessage());
        }

        return sessaoSalva;
    }
}