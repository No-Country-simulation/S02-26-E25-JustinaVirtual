package br.com.justina.domain.model.training;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "questions", indexes = {
    @Index(name = "idx_questions_type", columnList = "type"),
    @Index(name = "idx_questions_media", columnList = "mediaUrl")
})
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String text;

    @Column(columnDefinition = "jsonb", nullable = false)
    private String options; 

    @Column(name = "correct_index", nullable = false)
    private Integer correctIndex;

    private String hint;
    private String topic;
    private String mediaUrl;

    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime modifiedAt;

    private Boolean active = true;
    private String status = "enabled";
    private Integer version = 1;
}