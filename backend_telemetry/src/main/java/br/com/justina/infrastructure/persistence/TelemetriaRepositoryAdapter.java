package br.com.justina.infrastructure.persistence;

import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.Telemetria;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@Primary
@RequiredArgsConstructor
public class TelemetriaRepositoryAdapter implements ITelemetriaRepositoryPort {

    private final TelemetriaJpaRepository jpaRepository;

    @Override
    public void salvarTudo(List<Telemetria> movimentos) {
        jpaRepository.saveAll(movimentos);
        System.out.println("--- PERSISTÊNCIA REAL NO BANCO ---");
    }

    @Override
    public Optional<SessaoSimulacao> buscarSessaoPorId(UUID id) {
        return Optional.empty();
    }

    @Override
    public SessaoSimulacao salvarSessao(SessaoSimulacao sessao) {
        return sessao;
    }
    @Override
    public List<Telemetria> buscarPorSessao(UUID sessaoId) {
        return jpaRepository.findBySessaoIdOrderByTimestampAsc(sessaoId);
    }
}