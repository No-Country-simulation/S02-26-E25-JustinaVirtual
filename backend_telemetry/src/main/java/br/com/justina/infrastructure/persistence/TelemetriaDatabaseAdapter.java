package br.com.justina.infrastructure.persistence;

import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.StatusSessao;
import br.com.justina.domain.model.Telemetria;
import br.com.justina.domain.model.Usuario;
// import br.com.justina.domain.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Component
@Primary
@RequiredArgsConstructor
public class TelemetriaDatabaseAdapter implements ITelemetriaRepositoryPort {

    private final JpaTelemetriaRepository telemetriaRepo;
    private final JpaSessaoRepository sessaoRepo;
    // private final UsuarioRepository usuarioRepo;

    @Override
    public void salvarTudo(List<Telemetria> movimentos) {
        if (movimentos.isEmpty()) return;

        // Usuario usuarioFake = new Usuario(); 
        
        SessaoSimulacao sessao = new SessaoSimulacao();
        // sessao.setUsuario(usuarioFake); 
        sessao.setDataInicio(LocalDateTime.now());
        sessao.setStatus(StatusSessao.EM_ANDAMENTO);
        sessao.setStatusIa("PROCESSADO"); 
        
        // sessao = sessaoRepo.save(sessao); 

        for (Telemetria t : movimentos) {
            t.setSessao(sessao);
            if (t.getTimestamp() == null) {
                t.setTimestamp(LocalDateTime.now());
            }
        }
        
        // telemetriaRepo.saveAll(movimentos);
        System.out.println("COMPILAÇÃO: Dados recebidos (Persistência pausada para ajuste de Usuário)");
    }

    @Override
    public SessaoSimulacao salvarSessao(SessaoSimulacao sessao) {
        return sessaoRepo.save(sessao);
    }

    
    @Override
    public Optional<SessaoSimulacao> buscarSessaoPorId(UUID id) {
        return sessaoRepo.findById(id);
    }
}