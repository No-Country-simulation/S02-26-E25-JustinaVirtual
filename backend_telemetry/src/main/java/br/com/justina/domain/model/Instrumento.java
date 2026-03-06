package br.com.justina.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Data
@Entity
@Table(name = "tb_instrumentos")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Instrumento {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nome; // Ex: "Pinça Robótica Maryland"

    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoInstrumento tipo;

    public enum TipoInstrumento {
        CORTE,
        SUTURA,
        MANIPULACAO,
        CAMERA
    }
}