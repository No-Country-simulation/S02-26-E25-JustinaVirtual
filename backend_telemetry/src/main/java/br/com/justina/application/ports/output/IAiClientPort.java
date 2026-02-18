package br.com.justina.application.ports.output;

import br.com.justina.domain.model.FeedbackIA;
import br.com.justina.domain.model.Telemetria;
import java.util.List;
import java.util.UUID;

public interface IAiClientPort {
    FeedbackIA analisarMovimentos(List<Telemetria> movimentos);
    void solicitarRelatorioFinal(UUID sessaoId); // Novo método para trigger assíncrono
}
