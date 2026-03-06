package br.com.justina.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tb_sessoes_simulacao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessaoSimulacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false)
    @NotNull(message = "Toda sessão deve pertencer a um usuário.")
    private Usuario usuario;

    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cirurgia_id", nullable = false)
    @NotNull(message = "Toda sessão deve estar vinculada a um procedimento cirúrgico.")
    private Cirurgia cirurgia;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dataInicio;

    private LocalDateTime dataFim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusSessao status;

    // Métricas Gerais
    private Double pontuacaoGeral;
    private Integer totalErros;
    private Long tempoTotalSegundos;

    // Resultados da IA
    private String statusIa;
    private Double precisaoIa;
    private String relatorioUrl;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.dataInicio == null) dataInicio = LocalDateTime.now();
        if (this.status == null) status = StatusSessao.EM_ANDAMENTO;
    }

    
    public boolean isFinalizada() {
        return StatusSessao.FINALIZADA.equals(this.status);
    }

    public boolean isEmAndamento() {
        return StatusSessao.EM_ANDAMENTO.equals(this.status);
    }

    
    public double getPercentualAcertos() {
        if (totalErros == null || totalErros == 0)
            return 100.0;
        return Math.max(0, 100.0 - (totalErros * 5));
    }
}