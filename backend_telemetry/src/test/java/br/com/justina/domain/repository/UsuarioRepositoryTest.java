package br.com.justina.domain.repository; // Ajuste o package se necessário

import br.com.justina.domain.model.Usuario;
import br.com.justina.domain.model.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("dev")
class UsuarioRepositoryTest {

    @Autowired
    private UsuarioRepository repository;

    @Test
    @DisplayName("Deveria salvar um novo usuário e buscá-lo por e-mail no H2")
    void deveriaSalvarEBuscarUsuario() {
        // 1. Arrange (Preparar os dados)
        Usuario novoUsuario = new Usuario(
                "Dr. Gregory House",
                "house@diagnostico.com",
                "vicioemvicodin",
                Role.ADMIN
        );

        Usuario salvo = repository.save(novoUsuario);

        assertNotNull(salvo.getId());

        Optional<Usuario> buscado = repository.findByEmail("house@diagnostico.com");
        assertTrue(buscado.isPresent());
        assertEquals("Dr. Gregory House", buscado.get().getName());
        assertNotNull(buscado.get().getCreatedAt());
    }
}