package br.com.justina.application.usecases;

import br.com.justina.application.dto.AsyncResponseDTO;
import br.com.justina.application.services.RelatorioIAService;
import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.StatusSessao;
import br.com.justina.infrastructure.dto.FinalizarCirurgiaDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FinalizarCirurgiaUseCase {

    private final ITelemetriaRepositoryPort repository;
    private final RelatorioIAService relatorioService; // O nosso serviço @Async

    @Transactional
    public AsyncResponseDTO executar(UUID sessaoId, FinalizarCirurgiaDTO dto) {
        log.info("Iniciando finalização da cirurgia: {}", sessaoId);

        SessaoSimulacao sessao = repository.buscarSessaoPorId(sessaoId)
                .orElseThrow(() -> new RuntimeException("Sessão não encontrada: " + sessaoId));

        // 1. Finaliza a parte "humana" da sessão
        sessao.setDataFim(LocalDateTime.now());
        sessao.setStatus(StatusSessao.FINALIZADA);
        
        // 2. Avisa que a IA vai começar a trabalhar
        sessao.setStatusIa("PROCESSANDO");
        
        // Salva o estado inicial no banco
        repository.salvarSessao(sessao);

        // 3. Dispara o processo em segundo plano (O usuário não espera isso acabar)
        relatorioService.gerarRelatorioEmBackground(sessaoId);

        log.info("Sessão {} finalizada. IA rodando em background.", sessaoId);

        // 4. Retorna o "Recibo" imediatamente
        return new AsyncResponseDTO(
            sessaoId, 
            "PROCESSANDO", 
            "A cirurgia foi finalizada e a IA está gerando o relatório em segundo plano."
        );
    }
}