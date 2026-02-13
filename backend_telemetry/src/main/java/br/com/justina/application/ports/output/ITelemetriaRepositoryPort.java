package br.com.justina.application.ports.output;

import br.com.justina.domain.model.Telemetria;
import java.util.List;

public interface ITelemetriaRepositoryPort {
    
    // Contrato: ao implementar essa interface é obrigatório salvar uma lista
    void salvarTudo(List<Telemetria> movimentos);

}