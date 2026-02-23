package br.com.justina.application.ports.output;

import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.Telemetria;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ITelemetriaRepositoryPort {
    void salvarTudo(UUID usuarioId, List<Telemetria> movimentos);
    SessaoSimulacao salvarSessao(SessaoSimulacao sessao);
    Optional<SessaoSimulacao> buscarSessaoPorId(UUID id);
    // Novo método exigido pelo UseCase da equipe
    List<Telemetria> buscarPorSessao(UUID sessaoId);
}
