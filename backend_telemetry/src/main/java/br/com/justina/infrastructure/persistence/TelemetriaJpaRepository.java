package br.com.justina.infrastructure.persistence;

import br.com.justina.domain.model.Telemetria;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TelemetriaJpaRepository extends JpaRepository<Telemetria, UUID> {
}