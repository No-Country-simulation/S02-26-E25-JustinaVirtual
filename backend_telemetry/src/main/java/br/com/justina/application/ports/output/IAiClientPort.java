package br.com.justina.application.ports.output;

import br.com.justina.domain.model.FeedbackIA;
import br.com.justina.domain.model.Telemetria;
import java.util.List;
import java.util.UUID;

public interface IAiClientPort {
    FeedbackIA analisarMovimentos(List<Telemetria> movimentos);
    // Novo método exigido pelo UseCase da equipe
    void solicitarRelatorioFinal(UUID sessaoId);
}
