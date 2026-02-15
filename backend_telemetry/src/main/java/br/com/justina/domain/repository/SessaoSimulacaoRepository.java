package br.com.justina.domain.repository;

import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.StatusSessao;
import br.com.justina.domain.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface SessaoSimulacaoRepository extends JpaRepository<SessaoSimulacao, UUID> {
    boolean existsByUsuarioAndStatus(Usuario usuario, StatusSessao status);
    List<SessaoSimulacao> findByUsuarioIdOrderByDataInicioDesc(UUID usuarioId);
}