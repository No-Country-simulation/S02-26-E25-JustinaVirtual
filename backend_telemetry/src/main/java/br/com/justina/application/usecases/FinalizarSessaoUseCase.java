package br.com.justina.application.usecases;

import br.com.justina.application.dto.SessaoResponse;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.StatusSessao;
import br.com.justina.domain.repository.SessaoSimulacaoRepository;
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
public class FinalizarSessaoUseCase {

    private final SessaoSimulacaoRepository sessaoRepository;

    @Transactional
    public SessaoResponse executar(UUID sessaoId) {
        // 1. Busca a sessão
        SessaoSimulacao sessao = sessaoRepository.findById(sessaoId)
                .orElseThrow(() -> new IllegalArgumentException("Sessão não encontrada com o ID: " + sessaoId));

        // 2. Verifica se já não está finalizada
        if (sessao.isFinalizada()) {
            throw new IllegalStateException("Esta sessão já foi finalizada anteriormente.");
        }

        // 3. Define a data de fim e status
        sessao.setDataFim(LocalDateTime.now());
        sessao.setStatus(StatusSessao.FINALIZADA);

        // 4. Calcula o tempo total em segundos - Lógica simples por enquanto
        long segundos = Duration.between(sessao.getDataInicio(), sessao.getDataFim()).getSeconds();
        sessao.setTempoTotalSegundos(segundos);

        // 5. Salva as alterações
        SessaoSimulacao salva = sessaoRepository.save(sessao);

        log.info("Sessão {} finalizada. Duração: {} segundos.", salva.getId(), segundos);

        return new SessaoResponse(
                salva.getId(),
                salva.getStatus().name(),
                salva.getDataInicio(),
                salva.getPontuacaoGeral(),
                salva.getTotalErros(),
                salva.getTempoTotalSegundos()
        );
    }
}