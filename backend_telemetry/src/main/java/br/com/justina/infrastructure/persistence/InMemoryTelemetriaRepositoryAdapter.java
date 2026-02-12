package br.com.justina.infrastructure.persistence;

import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.domain.model.Telemetria;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class InMemoryTelemetriaRepositoryAdapter implements ITelemetriaRepositoryPort {
    @Override
    public void salvarTudo(List<Telemetria> movimentos) {
        System.out.println("--- PERSISTÊNCIA SIMULADA ---");
        System.out.println("Salvando " + movimentos.size() + " itens na memória.");
    }
}