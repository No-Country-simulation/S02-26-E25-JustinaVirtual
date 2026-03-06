package br.com.justina.application.usecases;

import br.com.justina.application.dto.SessaoResponse;
import br.com.justina.domain.model.StatusSessao;
import br.com.justina.domain.model.Usuario;
import br.com.justina.domain.repository.SessaoSimulacaoRepository;
import br.com.justina.domain.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ObterEvolucaoUseCase {

    private final SessaoSimulacaoRepository sessaoRepository;
    private final UsuarioRepository usuarioRepository;

    public List<SessaoResponse> executar() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        UUID userId = (UUID) auth.getPrincipal();

        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        return sessaoRepository.findAllByUsuarioAndStatusOrderByDataInicioAsc(usuario, StatusSessao.FINALIZADA)
                .stream()
                .map(sessao -> new SessaoResponse(
                        sessao.getId(),
                        sessao.getStatus().name(),
                        sessao.getDataInicio(),
                        sessao.getPontuacaoGeral(),
                        sessao.getTotalErros(),
                        sessao.getTempoTotalSegundos()
                ))
                .collect(Collectors.toList());
    }
}