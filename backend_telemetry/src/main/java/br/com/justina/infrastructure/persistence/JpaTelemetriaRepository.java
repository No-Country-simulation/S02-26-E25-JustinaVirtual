package br.com.justina.infrastructure.persistence;

import br.com.justina.domain.model.Telemetria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface JpaTelemetriaRepository extends JpaRepository<Telemetria, UUID> {}