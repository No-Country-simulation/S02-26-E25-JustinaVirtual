package br.com.justina.infrastructure.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TelemetriaDTO {
    
    private Double x;
    private Double y;
    private Double z;
    private Double rotation;
    private String eventId;
    private String timestamp; // Recebe como String (ISO-8601)
    private String sessionId;
}
