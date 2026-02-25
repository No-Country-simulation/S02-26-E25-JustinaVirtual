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

@Slf4j
@Service
@RequiredArgsConstructor
public class AbrirSessaoUseCase {

    private final SessaoSimulacaoRepository sessaoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public SessaoResponse executar() {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();

        Usuario usuario = usuarioRepository.findByEmail(emailLogado)
                .orElseThrow(() -> {
                    log.error("Tentativa de abrir sessão para usuário inexistente: {}", emailLogado);
                    return new AuthenticationException("Usuário não encontrado.");
                });

        if (sessaoRepository.existsByUsuarioAndStatus(usuario, StatusSessao.EM_ANDAMENTO)) {
            log.warn("Bloqueada tentativa de múltiplas sessões para o usuário: {}", emailLogado);
            throw new IllegalStateException("O usuário já possui uma simulação em andamento.");
        }

        SessaoSimulacao novaSessao = SessaoSimulacao.builder()
                .usuario(usuario)
                .build();

        SessaoSimulacao salva = sessaoRepository.save(novaSessao);

        log.info("Sessão iniciada com sucesso. ID: {} | Usuário: {}", salva.getId(), emailLogado);

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