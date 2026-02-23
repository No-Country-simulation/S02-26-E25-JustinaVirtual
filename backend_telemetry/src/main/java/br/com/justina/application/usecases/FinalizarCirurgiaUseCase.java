package br.com.justina.application.usecases;

import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.StatusSessao;
import br.com.justina.infrastructure.dto.FinalizarCirurgiaDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FinalizarCirurgiaUseCase {

    private final ITelemetriaRepositoryPort repository;

    
    public SessaoSimulacao executar(UUID sessaoId, FinalizarCirurgiaDTO dto) {
        
        SessaoSimulacao sessao = repository.buscarSessaoPorId(sessaoId)
                .orElseThrow(() -> new RuntimeException("Sessão não encontrada: " + sessaoId));

        sessao.setDataFim(LocalDateTime.now());
        sessao.setStatus(StatusSessao.FINALIZADA);
        
        
        return repository.salvarSessao(sessao);
    }
}