package br.com.justina.domain.model.training;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Data
@Entity
@Table(name = "program_questions", indexes = {
    @Index(name = "idx_program_questions_program", columnList = "program_id")
})
public class ProgramQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "program_id", nullable = false)
    private TrainingProgram program;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;
}