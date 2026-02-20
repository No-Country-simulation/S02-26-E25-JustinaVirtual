package br.com.justina.infrastructure.persistence;

import br.com.justina.domain.model.Telemetria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface JpaTelemetriaRepository extends JpaRepository<Telemetria, UUID> {
    // O Spring cria o SQL automaticamente baseado no nome do método
    List<Telemetria> findBySessao_Id(UUID sessaoId);
}