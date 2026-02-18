package br.com.justina.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "tb_sessoes_simulacao")
public class SessaoSimulacao {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private LocalDateTime dataInicio;
    
    // Resultados da IA
    private String statusIa;   
    private Double precisaoIa;
}