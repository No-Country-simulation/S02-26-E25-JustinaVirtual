package br.com.justina.domain.model.training;

import br.com.justina.domain.model.common.BaseEntity; // Import da nossa classe base
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false) // Necessário quando se usa herança com Lombok
@Table(name = "training_sessions", indexes = {
    @Index(name = "idx_training_sessions_trainee_id", columnList = "traineeId"),
    @Index(name = "idx_training_sessions_program_id", columnList = "programId"),
    @Index(name = "idx_training_sessions_start_time", columnList = "startTime")
})
public class TrainingSession extends BaseEntity { 

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // --- Who did it ---
    @Column(nullable = false)
    private String traineeId;

    @Column(nullable = false)
    private String programId;

    // --- Timestamps do Treino ---
    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false)
    private Long totalTimeMs;

    // --- Performance ---
    @Column(nullable = false)
    private Integer totalScore = 0;

    @Column(nullable = false)
    private Integer totalQuestions = 0;

    @Column(nullable = false)
    private Integer majorErrors = 0;

    // --- Detailed Answers (JSONB) ---
    @Column(columnDefinition = "jsonb", nullable = false)
    private String answers; 

    // --- Status de Negócio (Progresso) ---
    // Este campo convive bem com o 'persistenceStatus' da BaseEntity
    @Column(nullable = false)
    private String status; // 'completed', 'in_progress', 'abandoned'

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}