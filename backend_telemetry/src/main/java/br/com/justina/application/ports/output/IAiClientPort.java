package br.com.justina.application.ports.output;

import br.com.justina.domain.model.FeedbackIA;
import br.com.justina.domain.model.Telemetria;
import java.util.List;

public interface IAiClientPort {
    FeedbackIA analisarMovimentos(List<Telemetria> movimentos);
}