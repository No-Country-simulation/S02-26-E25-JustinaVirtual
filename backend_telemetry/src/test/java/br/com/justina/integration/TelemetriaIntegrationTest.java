package br.com.justina.integration;

import br.com.justina.application.dto.AnaliseRequest;
import br.com.justina.application.dto.FinalizarSessaoRequest;
import br.com.justina.domain.model.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.test.context.support.WithMockUser;

import jakarta.persistence.EntityManager;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(username = "admin", roles = {"USER", "ADMIN"})
@DisplayName("Testes de Integração - Módulo Telemetria")
@Transactional
class TelemetriaIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EntityManager entityManager;

    @Test
    @DisplayName("Deve registrar movimentos com sucesso")
    void shouldRegisterMovementsSuccessfully() throws Exception {
        Usuario user = criarUsuarioPersistido();
        UUID sessaoId = UUID.randomUUID();
        SessaoSimulacao sessao = criarSessaoPersistida(sessaoId, user);

        Telemetria movimento = Telemetria.builder()
                .eixoX(10.5)
                .eixoY(20.5)
                .eixoZ(30.5)
                .rotacao(90.0)
                .eventId("E01")
                .timestamp(LocalDateTime.now())
                .sessao(sessao)
                .build();

        AnaliseRequest request = new AnaliseRequest();
        request.setUsuarioId(user.getId());
        request.setMovimentos(List.of(movimento));

        mockMvc.perform(post("/telemetria/analisar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Deve finalizar uma cirurgia com sucesso")
    void shouldFinalizeSurgerySuccessfully() throws Exception {
        Usuario user = criarUsuarioPersistido();

        SessaoSimulacao sessao = SessaoSimulacao.builder()
                .usuario(user)
                .status(StatusSessao.EM_ANDAMENTO)
                .dataInicio(LocalDateTime.now().minusMinutes(10))
                .build();

        sessao = entityManager.merge(sessao);
        entityManager.flush();
        entityManager.clear();

        UUID idReal = sessao.getId(); // Esse ID existe com certeza no H2

        FinalizarSessaoRequest request = new FinalizarSessaoRequest(10, 85.5);

        mockMvc.perform(post("/telemetria/finalizar")
                        .param("sessaoId", idReal.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FINALIZADA"));
    }

    private Usuario criarUsuarioPersistido() {
        Usuario user = new Usuario();
        user.setEmail("test-" + UUID.randomUUID() + "@test.com");
        user.setPassword("123456");
        user.setName("Test User");
        user.setRole(Role.USER);
        Usuario persistido = entityManager.merge(user);
        entityManager.flush();
        return persistido;
    }

    private SessaoSimulacao criarSessaoPersistida(UUID id, Usuario user) {
        SessaoSimulacao sessao = SessaoSimulacao.builder()
                .id(id)
                .usuario(user)
                .status(StatusSessao.EM_ANDAMENTO)
                .dataInicio(LocalDateTime.now().minusMinutes(10))
                .build();
        SessaoSimulacao persistida = entityManager.merge(sessao);
        entityManager.flush();
        return persistida;
    }
}