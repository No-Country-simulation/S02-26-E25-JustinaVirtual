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

    // --- Coordenadas (Mantido) ---
    private Double eixoX;
    private Double eixoY;
    private Double eixoZ;

    // --- Novidades da Equipe (Adicionado) ---
    private Double rotacao; 
    private String eventId;

    // --- Tempo (Adotamos a versão da equipe: LocalDateTime) ---
    private LocalDateTime timestamp;

    // --- Relacionamento (Mantendo JPA) ---
    // Foi sugerida 'String sessionId', mas no objeto real é necessário para as chaves estrangeiras.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sessao_id")
    private SessaoSimulacao sessao;
}