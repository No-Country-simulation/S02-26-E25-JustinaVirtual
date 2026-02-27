package br.com.justina.application.usecases;

import br.com.justina.application.dto.SessaoResponse;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.StatusSessao;
import br.com.justina.domain.model.Usuario;
import br.com.justina.domain.repository.SessaoSimulacaoRepository;
import br.com.justina.domain.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AbrirSessaoUseCase {

    private final SessaoSimulacaoRepository sessaoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public SessaoResponse executar() {
        // Obtendo a autenticação do contexto (Task 4)
        var auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof UUID)) {
            log.error("Tentativa de abrir sessão sem usuário autenticado no contexto.");
            throw new RuntimeException("Usuário não autenticado.");
        }

        UUID userId = (UUID) auth.getPrincipal();

        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("Usuário ID {} não encontrado no banco.", userId);
                    return new RuntimeException("Erro: Usuário do token não existe no banco.");
                });

        // Lógica da Task 4: Impedir mais de uma sessão ativa simultânea
        boolean jaPossuiSessaoAtiva = sessaoRepository.existsByUsuarioAndStatus(usuario, StatusSessao.EM_ANDAMENTO);

        if (jaPossuiSessaoAtiva) {
            log.warn("Usuário {} tentou abrir nova sessão já possuindo uma ativa.", userId);
            throw new RuntimeException("Você já possui uma sessão em andamento.");
        }

        SessaoSimulacao novaSessao = SessaoSimulacao.builder()
                .usuario(usuario)
                .status(StatusSessao.EM_ANDAMENTO)
                .dataInicio(LocalDateTime.now())
                .build();

        SessaoSimulacao salva = sessaoRepository.save(novaSessao);
        log.info("Nova sessão de simulação aberta com sucesso para o usuário: {}", userId);

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