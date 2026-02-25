package br.com.justina.domain.model.training;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "training_programs")
public class TrainingProgram {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String mainVideoUrl;
    private String mainImageUrl;
    private String mainCaseUrl;
    
    @Column(columnDefinition = "TEXT")
    private String videoDescription;
    @Column(columnDefinition = "TEXT")
    private String imageDescription;
    @Column(columnDefinition = "TEXT")
    private String caseDescription;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime modifiedAt;

    private Boolean active = true;
    private String status = "enabled";
    private Integer version = 1;
}