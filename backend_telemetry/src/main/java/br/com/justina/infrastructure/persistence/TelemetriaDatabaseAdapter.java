package br.com.justina.infrastructure.persistence;

import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.StatusSessao;
import br.com.justina.domain.model.Telemetria;
import br.com.justina.domain.model.Usuario;
// import br.com.justina.domain.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Component
@Primary
@Profile("prod")
@RequiredArgsConstructor
public class TelemetriaDatabaseAdapter implements ITelemetriaRepositoryPort {

    private final JpaTelemetriaRepository telemetriaRepo;
    private final JpaSessaoRepository sessaoRepo;
    // private final UsuarioRepository usuarioRepo;

    @Override
    public void salvarTudo(List<Telemetria> movimentos) {
        if (movimentos == null || movimentos.isEmpty()) return;

        String sId = movimentos.get(0).getSessionId();

        SessaoSimulacao sessao = sessaoRepo.findById(UUID.fromString(sId))
                .orElseThrow(() -> new RuntimeException("Sessão não encontrada: " + sId));

        for (Telemetria t : movimentos) {
            t.setSessao(sessao); // AGORA SIM o vínculo existe
            if (t.getTimestamp() == null) t.setTimestamp(LocalDateTime.now());
        }

        telemetriaRepo.saveAll(movimentos);
        System.out.println("PERSISTÊNCIA: " + movimentos.size() + " registros salvos com sucesso.");
    }

    @Override
    public SessaoSimulacao salvarSessao(SessaoSimulacao sessao) {
        return sessaoRepo.save(sessao);
    }

    
    @Override
    public Optional<SessaoSimulacao> buscarSessaoPorId(UUID id) {
        return sessaoRepo.findById(id);
    }

    @Override
    public List<Telemetria> buscarPorSessao(UUID sessaoId) {
        return telemetriaRepo.findBySessaoId(sessaoId);
    }
}