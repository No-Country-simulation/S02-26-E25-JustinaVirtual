package br.com.justina.application.dto;

import br.com.justina.domain.model.Telemetria;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class AnaliseRequest {
    private UUID usuarioId;
    private List<Telemetria> movimentos;
}