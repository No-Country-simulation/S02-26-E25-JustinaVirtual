package br.com.justina.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "tb_telemetrias")
public class Telemetria {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private Double eixoX;
    private Double eixoY;
    private Double eixoZ;
    private String tempo;

    // Vínculo com a sessão
    @ManyToOne
    @JoinColumn(name = "sessao_id")
    private SessaoSimulacao sessao;
}