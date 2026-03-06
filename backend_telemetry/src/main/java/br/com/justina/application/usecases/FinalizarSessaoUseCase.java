package br.com.justina.application.usecases;

import br.com.justina.application.dto.FinalizarSessaoRequest;
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
    private final GeminiService geminiService;

    @Transactional
    public SessaoResponse executar(UUID sessaoId, FinalizarSessaoRequest request) {
        SessaoSimulacao sessao = sessaoRepository.findById(sessaoId)
                .orElseThrow(() -> new IllegalArgumentException("Sessão não encontrada com o ID: " + sessaoId));

        if (sessao.isFinalizada()) {
            throw new IllegalStateException("Esta sessão já foi finalizada anteriormente.");
        }

        sessao.setDataFim(LocalDateTime.now());
        sessao.setStatus(StatusSessao.FINALIZADA);
        sessao.setTotalErros(request.totalErros());
        sessao.setPontuacaoGeral(request.pontuacaoGeral());

        long segundos = Duration.between(sessao.getDataInicio(), sessao.getDataFim()).getSeconds();
        sessao.setTempoTotalSegundos(segundos);

        //  Integração com a IA
        try {
            log.info("Solicitando feedback da IA para a sessão: {}", sessaoId);
            String feedbackTexto = geminiService.gerarFeedback(sessao.getTotalErros(), sessao.getPontuacaoGeral());

            sessao.setStatusIa(feedbackTexto);
            sessao.setPrecisaoIa(sessao.getPercentualAcertos());

        } catch (Exception e) {
            log.error("Falha ao obter feedback da IA: {}", e.getMessage());
            sessao.setStatusIa("Feedback indisponível no momento.");
        }

        SessaoSimulacao salva = sessaoRepository.save(sessao);
        log.info("Sessão {} finalizada com sucesso.", salva.getId());

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