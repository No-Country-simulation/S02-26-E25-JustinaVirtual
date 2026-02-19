package br.com.justina.application.usecases;

import br.com.justina.application.dto.SessaoResponse;
import br.com.justina.domain.model.Usuario;
import br.com.justina.domain.repository.SessaoSimulacaoRepository;
import br.com.justina.domain.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ListarHistoricoUseCase {

    private final SessaoSimulacaoRepository sessaoRepository;
    private final UsuarioRepository usuarioRepository;

    public List<SessaoResponse> executar() {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();

        Usuario usuario = usuarioRepository.findByEmail(emailLogado)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        return sessaoRepository.findByUsuarioIdOrderByDataInicioDesc(usuario.getId())
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