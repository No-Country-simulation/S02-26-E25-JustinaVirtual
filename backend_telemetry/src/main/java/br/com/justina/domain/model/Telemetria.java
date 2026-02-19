package br.com.justina.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "tb_telemetrias")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Telemetria {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private Double eixoX;
    private Double eixoY;
    private Double eixoZ;
    private Double rotacao;
    private String eventId;
    private LocalDateTime timestamp;

    // Relacionamento com a Sessão (Chave Estrangeira no Banco)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sessao_id", nullable = false)
    private SessaoSimulacao sessao;

    // Campo para o Engine da IA, não vira coluna no banco
    @Transient
    private String sessionId;
}