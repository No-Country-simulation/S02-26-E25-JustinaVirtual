package br.com.justina.infrastructure.persistence;

import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.Telemetria;
import br.com.justina.domain.repository.SessaoSimulacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Profile("dev")
@RequiredArgsConstructor
public class TelemetriaRepositoryAdapter implements ITelemetriaRepositoryPort {

    private final TelemetriaJpaRepository jpaRepository;
    private final SessaoSimulacaoRepository sessaoSimulacaoRepository;

    @Override
    public void salvarTudo(List<Telemetria> movimentos) {
        jpaRepository.saveAll(movimentos);
        System.out.println("--- PERSISTÊNCIA REAL NO BANCO ---");
    }

    @Override
    public List<Telemetria> buscarPorSessao(UUID sessaoId) {
        return jpaRepository.findBySessaoIdOrderByTimestampAsc(sessaoId);
    }

    @Override
    public Optional<SessaoSimulacao> buscarSessaoPorId(UUID id) {
        return sessaoSimulacaoRepository.findById(id);
    }

    @Override
    public SessaoSimulacao salvarSessao(SessaoSimulacao sessao) {
        return sessaoSimulacaoRepository.save(sessao);
    }
}