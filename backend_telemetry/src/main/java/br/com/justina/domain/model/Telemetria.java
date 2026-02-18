package br.com.justina.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "tb_telemetria")
@AllArgsConstructor
@NoArgsConstructor
public class Telemetria {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private Double eixoX;
    private Double eixoY;
    private Double eixoZ;
    private Double rotacao; // Adicionado conforme backlog
    private String eventId; // Adicionado conforme backlog
    private LocalDateTime timestamp; // Alterado para LocalDateTime para facilitar operações de tempo
    private String sessionId; // Necessário para throttling por sessão

    @ManyToOne
    @JoinColumn(name = "sessao_id")
    private SessaoSimulacao sessao;
}
