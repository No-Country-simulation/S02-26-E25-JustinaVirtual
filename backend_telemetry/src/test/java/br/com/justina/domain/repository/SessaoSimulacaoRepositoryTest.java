package br.com.justina.domain.repository;

import br.com.justina.domain.model.Role;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.StatusSessao;
import br.com.justina.domain.model.Usuario;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class SessaoSimulacaoRepositoryTest {

    @Autowired
    private SessaoSimulacaoRepository sessaoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    @DisplayName("Deve persistir uma sessão e validar os valores automáticos")
    void deveSalvarSessaoEValidarCampos() {
        // 1. Criar um usuário teste
        Usuario medico = new Usuario();
        medico.setName("Dr. Justina");
        medico.setEmail("justina@hospital.com");
        medico.setPassword("hash_da_senha");
        medico.setRole(Role.ADMIN);
        usuarioRepository.save(medico);

        // 2. Criar a sessão
        SessaoSimulacao sessao = SessaoSimulacao.builder()
                .usuario(medico)
                .build();

        // 3. Salvar
        SessaoSimulacao salva = sessaoRepository.save(sessao);

        // 4. Verificar se funcionou
        assertThat(salva.getId()).isNotNull();
        assertThat(salva.getStatus()).isEqualTo(StatusSessao.EM_ANDAMENTO);
        assertThat(salva.getDataInicio()).isNotNull();
        assertThat(salva.getUsuario().getEmail()).isEqualTo("justina@hospital.com");
    }
}