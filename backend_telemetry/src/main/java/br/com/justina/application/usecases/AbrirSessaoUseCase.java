package br.com.justina.application.usecases;

import br.com.justina.application.dto.SessaoResponse;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.StatusSessao;
import br.com.justina.domain.model.Usuario;
import br.com.justina.domain.repository.SessaoSimulacaoRepository;
import br.com.justina.domain.repository.UsuarioRepository;
import br.com.justina.infrastructure.exception.AuthenticationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Import do Log
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AbrirSessaoUseCase {

    private final SessaoSimulacaoRepository sessaoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public SessaoResponse executar() {

        UUID userId = (UUID) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("Usuário não encontrado: {}", userId);
                    return new AuthenticationException("Usuário não encontrado.");
                });

        if (sessaoRepository.existsByUsuarioAndStatus(usuario, StatusSessao.EM_ANDAMENTO)) {
            log.warn("Bloqueada tentativa de múltiplas sessões para o usuário: {}", userId);
            throw new IllegalStateException("O usuário já possui uma simulação em andamento.");
        }

        SessaoSimulacao novaSessao = SessaoSimulacao.builder()
                .usuario(usuario)
                .build();

        SessaoSimulacao salva = sessaoRepository.save(novaSessao);

        log.info("Sessão iniciada com sucesso. ID: {} | Usuário: {}", salva.getId(), userId);

        return new SessaoResponse(
                salva.getId(),
                salva.getStatus().name(),
                salva.getDataInicio(),
                salva.getPontuacaoGeral(),
                salva.getTotalErros(),
                salva.getTempoTotalSegundos()
        );
    }
}