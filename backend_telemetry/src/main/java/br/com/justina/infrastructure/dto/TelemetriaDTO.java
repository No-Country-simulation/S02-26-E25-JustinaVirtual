package br.com.justina.infrastructure.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TelemetriaDTO {

    @NotNull(message = "O eixo X é obrigatório")
    @Min(value = -100, message = "X fora do limite inferior (-100)")
    @Max(value = 100, message = "X fora do limite superior (100)")
    private Double x;

    @NotNull(message = "O eixo Y é obrigatório")
    @Min(value = -100, message = "Y fora do limite inferior (-100)")
    @Max(value = 100, message = "Y fora do limite superior (100)")
    private Double y;

    @NotNull(message = "O eixo Z é obrigatório")
    @Min(value = 0, message = "Z (profundidade) não pode ser negativa")
    @Max(value = 200, message = "Z fora do limite superior (200)")
    private Double z;

    private Double rotation;
    private String eventId;

    @NotNull(message = "O timestamp é obrigatório")
    private String timestamp; // Recebe como String (ISO-8601)

    @NotNull(message = "O sessionId é obrigatório")
    private String sessionId;
}
