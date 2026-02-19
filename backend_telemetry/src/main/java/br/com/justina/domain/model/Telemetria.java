package br.com.justina.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "tb_telemetrias")
public class Telemetria {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // --- Coordenadas ---
    private Double eixoX;
    private Double eixoY;
    private Double eixoZ;

    
    private Double rotacao; 
    private String eventId;

    // --- Tempo ---
    private LocalDateTime timestamp;

    // --- Relacionamento JPA (O que vale para o Banco) ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sessao_id")
    private SessaoSimulacao sessao;

    
    // Adicionei o sessionId para o TelemetryEngine funcionar, 
    // mas marquei como @Transient para não salvar no banco (o banco usa o 'sessao' acima)
    @Transient
    private String sessionId;
}