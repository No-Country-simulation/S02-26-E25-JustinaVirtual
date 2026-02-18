package br.com.justina.application.ports.output;

import br.com.justina.domain.model.Telemetria;
import br.com.justina.domain.model.SessaoSimulacao;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ITelemetriaRepositoryPort {
    
    // Telemetria
    void salvarTudo(List<Telemetria> movimentos);

    // Sessão
    Optional<SessaoSimulacao> buscarSessaoPorId(UUID id);
    SessaoSimulacao salvarSessao(SessaoSimulacao sessao);

}
