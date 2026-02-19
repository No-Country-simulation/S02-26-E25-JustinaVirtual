package br.com.justina.domain.model;

import jakarta.persistence.*;
<<<<<<< HEAD
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "tb_sessoes_simulacao")
public class SessaoSimulacao {
=======
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

>>>>>>> origin/dev
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

<<<<<<< HEAD
    private LocalDateTime dataInicio;
    
    // Resultados da IA
    private String statusIa;   
    private Double precisaoIa;
=======
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @NotNull(message = "Toda sessão deve pertencer a um usuário.")
    private Usuario usuario;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dataInicio;

    private LocalDateTime dataFim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusSessao status;

    private Double pontuacaoGeral;
    private Integer totalErros;
    private Long tempoTotalSegundos;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.dataInicio == null) {
            this.dataInicio = LocalDateTime.now();
        }
        // Toda sessão nova nasce em andamento
        if (this.status == null) {
            this.status = StatusSessao.EM_ANDAMENTO;
        }
    }

    public boolean isFinalizada() {
        return StatusSessao.FINALIZADA.equals(this.status);
    }

    public boolean isEmAndamento() {
        return StatusSessao.EM_ANDAMENTO.equals(this.status);
    }

    public double getPercentualAcertos() {
        if (totalErros == null || totalErros == 0) return 100.0;
        return Math.max(0, 100.0 - (totalErros * 5));
    }
>>>>>>> origin/dev
}