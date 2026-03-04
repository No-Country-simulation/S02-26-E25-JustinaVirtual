package br.com.justina.application.services;

import br.com.justina.application.ports.output.IAiClientPort;
import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.domain.model.SessaoSimulacao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RelatorioIAService {

    private final IAiClientPort aiClient;
    private final ITelemetriaRepositoryPort repository;

    @Async // <--- Isso roda em outra Thread!
    public void gerarRelatorioEmBackground(UUID sessaoId) {
        log.info("🔄 ASYNC: Iniciando geração de relatório para sessão {}", sessaoId);

        try {
            // 1. Chama o Python (Isso demora alguns segundos)
            aiClient.solicitarRelatorioFinal(sessaoId);

            // 2. Busca a sessão para atualizar
            SessaoSimulacao sessao = repository.buscarSessaoPorId(sessaoId)
                    .orElseThrow();

            // 3. Atualiza o status no banco
            sessao.setStatusIa("CONCLUIDO");
            // No futuro, o Python poderia retornar a URL, por enquanto simulamos:
            sessao.setRelatorioUrl("/relatorios/Relatorio_" + sessaoId + ".pdf");
            
            repository.salvarSessao(sessao);
            log.info("ASYNC: Relatório concluído com sucesso para sessão {}", sessaoId);

        } catch (Exception e) {
            log.error("ASYNC: Erro ao gerar relatório", e);
            // Atualiza o banco com erro
            repository.buscarSessaoPorId(sessaoId).ifPresent(s -> {
                s.setStatusIa("ERRO");
                repository.salvarSessao(s);
            });
        }
    }
}