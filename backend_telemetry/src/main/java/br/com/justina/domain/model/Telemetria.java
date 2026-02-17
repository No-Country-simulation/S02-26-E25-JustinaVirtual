package br.com.justina.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Telemetria {
    
    private Double eixoX;
    private Double eixoY;
    private Double eixoZ;
    private Double rotacao; // Adicionado conforme backlog
    private String eventId; // Adicionado conforme backlog
    private LocalDateTime timestamp; // Alterado para LocalDateTime para facilitar operações de tempo
    private String sessionId; // Necessário para throttling por sessão
    
}
