package br.com.justina.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "tb_cirurgias")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Cirurgia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nomeProcedimento; // Ex: "Nefrectomia Parcial"

    private String nivelDificuldade; // Ex: "INICIANTE", "AVANCADO"

    private LocalDateTime dataCriacao;

    // Relacionamento N:M - Quais instrumentos estão disponíveis para esta cirurgia?
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "tb_cirurgia_instrumento", joinColumns = @JoinColumn(name = "cirurgia_id"), inverseJoinColumns = @JoinColumn(name = "instrumento_id"))
    @Builder.Default
    private List<Instrumento> instrumentosPermitidos = new ArrayList<>();

    // Relacionamento 1:N - Uma cirurgia pode ter várias tentativas (sessões) no
    // simulador
    @OneToMany(mappedBy = "cirurgia", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SessaoSimulacao> sessoes = new ArrayList<>();
}