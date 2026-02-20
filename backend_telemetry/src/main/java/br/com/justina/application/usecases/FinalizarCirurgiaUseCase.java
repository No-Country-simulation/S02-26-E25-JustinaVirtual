package br.com.justina.application.usecases;

import br.com.justina.application.ports.output.IAiClientPort;
import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.StatusSessao;
import br.com.justina.domain.model.Telemetria;
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
    public SessaoSimulacao executar(UUID sessaoId) {
        log.info("Iniciando finalização da cirurgia/sessão: {}", sessaoId);

        // 1. Buscar Sessão
        SessaoSimulacao sessao = repository.buscarSessaoPorId(sessaoId)
                .orElseThrow(() -> new IllegalArgumentException("Sessão não encontrada: " + sessaoId));

        // 2. Validar Status (Idempotência)
        if (sessao.isFinalizada()) {
            log.warn("Tentativa de finalizar sessão já encerrada: {}", sessaoId);
            return sessao; 
        }

        // 3. Atualizar Dados de Finalização
        LocalDateTime agora = LocalDateTime.now();
        sessao.setDataFim(agora);
        sessao.setStatus(StatusSessao.FINALIZADA);

        if (sessao.getDataInicio() != null) {
            long segundos = Duration.between(sessao.getDataInicio(), agora).getSeconds();
            sessao.setTempoTotalSegundos(segundos);
        }

        // --- CÓDIGO LIMPO (Descomentado) ---
        // Agora isso compila porque adicionamos o método na interface!
        List<Telemetria> pontos = repository.buscarPorSessao(sessaoId);
        
        if (pontos != null && !pontos.isEmpty()) {
            double distancia = calcularDistancia3D(pontos);
            // Aqui poderíamos salvar a distância na sessão se houvesse campo
            log.info("Distância total calculada para a sessão {}: {} unidades", sessaoId, distancia);
        }

        // 4. Salvar
        SessaoSimulacao sessaoSalva = repository.salvarSessao(sessao);
        log.info("Sessão {} finalizada com sucesso.", sessaoId);

        // 5. Acionar IA (Descomentado)
        try {
            aiClient.solicitarRelatorioFinal(sessaoId);
        } catch (Exception e) {
            log.error("Erro ao solicitar relatório final IA: {}", e.getMessage());
        }

        return sessaoSalva;
    }

    private double calcularDistancia3D(List<Telemetria> pontos) {
        double total = 0;
        for (int i = 0; i < pontos.size() - 1; i++) {
            Telemetria p1 = pontos.get(i);
            Telemetria p2 = pontos.get(i + 1);
            total += Math.sqrt(
                    Math.pow(p2.getEixoX() - p1.getEixoX(), 2) +
                    Math.pow(p2.getEixoY() - p1.getEixoY(), 2) +
                    Math.pow(p2.getEixoZ() - p1.getEixoZ(), 2)
            );
        }
        return total;
    }
}