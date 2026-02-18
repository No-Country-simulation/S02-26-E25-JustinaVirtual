package br.com.justina.infrastructure.persistence;

import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.Telemetria;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Primary // Importante: Substitui o banco de memória
@RequiredArgsConstructor
public class TelemetriaDatabaseAdapter implements ITelemetriaRepositoryPort {

    private final JpaTelemetriaRepository telemetriaRepo;
    private final JpaSessaoRepository sessaoRepo;

    @Override
    public void salvarTudo(List<Telemetria> movimentos) {
        if (movimentos.isEmpty()) return;

        // 1. Cria a Sessão
        SessaoSimulacao sessao = new SessaoSimulacao();
        sessao.setDataInicio(LocalDateTime.now());
        sessao.setStatusIa("PROCESSADO"); 
        
        sessao = sessaoRepo.save(sessao);

        // 2. Vincula movimentos à sessão
        for (Telemetria t : movimentos) {
            t.setSessao(sessao);
        }

        // 3. Salva movimentos
        telemetriaRepo.saveAll(movimentos);
        
        System.out.println(" DB: Sessão " + sessao.getId() + " salva com sucesso!");
    }
}