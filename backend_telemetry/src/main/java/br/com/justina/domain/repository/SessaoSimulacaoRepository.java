package br.com.justina.domain.repository;

import br.com.justina.domain.model.SessaoSimulacao;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface SessaoSimulacaoRepository extends JpaRepository<SessaoSimulacao, UUID> {
    List<SessaoSimulacao> findByUsuarioIdOrderByDataInicioDesc(UUID usuarioId);
}