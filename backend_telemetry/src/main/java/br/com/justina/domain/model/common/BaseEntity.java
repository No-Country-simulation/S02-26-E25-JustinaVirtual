package br.com.justina.domain.model.common;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@MappedSuperclass
@Getter
@Setter
public abstract class BaseEntity {
    
    @Column(name = "active", nullable = false)
    private Boolean active = true;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    @Column(name = "deleted_by")
    private String deletedBy;
    
    // Nome alterado para não conflitar com StatusSessao
    @Column(name = "persistence_status", length = 20)
    private String persistenceStatus = "enabled";
    
    @PrePersist
    public void prePersistBase() {
        if (active == null) active = true;
        if (persistenceStatus == null) persistenceStatus = "enabled";
    }
    
    public void softDelete(String deletedBy) {
        this.active = false;
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = deletedBy;
        this.persistenceStatus = "deleted";
    }
    
    public boolean isActive() {
        return Boolean.TRUE.equals(active);
    }
}
