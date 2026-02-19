package br.com.justina.infrastructure.persistence;

import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.Telemetria;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryTelemetriaRepositoryAdapter implements ITelemetriaRepositoryPort {
    
    // Simulação simples de banco em memória para Sessões
    private final Map<UUID, SessaoSimulacao> sessoesDB = new ConcurrentHashMap<>();

    @Override
    public void salvarTudo(List<Telemetria> movimentos) {
        System.out.println("--- PERSISTÊNCIA SIMULADA ---");
        System.out.println("Salvando " + movimentos.size() + " itens na memória.");
    }

    @Override
    public Optional<SessaoSimulacao> buscarSessaoPorId(UUID id) {
        return Optional.ofNullable(sessoesDB.get(id));
    }

    @Override
    public SessaoSimulacao salvarSessao(SessaoSimulacao sessao) {
        if (sessao.getId() == null) {
            sessao.setId(UUID.randomUUID());
        }
        sessoesDB.put(sessao.getId(), sessao);
        System.out.println("--- SESSÃO SALVA --- ID: " + sessao.getId() + " Status: " + sessao.getStatus());
        return sessao;
    }
}
