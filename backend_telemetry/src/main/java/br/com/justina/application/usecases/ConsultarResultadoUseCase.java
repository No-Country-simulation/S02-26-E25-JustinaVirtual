package br.com.justina.application.usecases;

import br.com.justina.application.dto.AsyncResponseDTO;
import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.domain.model.SessaoSimulacao;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConsultarResultadoUseCase {

    private final ITelemetriaRepositoryPort repository;

    public AsyncResponseDTO executar(UUID sessaoId) {
        SessaoSimulacao sessao = repository.buscarSessaoPorId(sessaoId)
                .orElseThrow(() -> new RuntimeException("Sessão não encontrada"));

        // Retorna o estado atual (PROCESSANDO, CONCLUIDO ou ERRO)
        // Se estiver concluído, o 'mensagem' vira a URL do PDF
        String mensagem = "CONCLUIDO".equals(sessao.getStatusIa()) 
                ? sessao.getRelatorioUrl() 
                : "Aguardando processamento...";

        return new AsyncResponseDTO(
                sessao.getId(),
                sessao.getStatusIa(),
                mensagem
        );
    }
}