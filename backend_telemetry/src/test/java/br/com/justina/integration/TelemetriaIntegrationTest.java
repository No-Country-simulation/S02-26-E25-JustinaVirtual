package br.com.justina.integration;

import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.StatusSessao;
import br.com.justina.infrastructure.dto.FinalizarCirurgiaDTO;
import br.com.justina.infrastructure.dto.TelemetriaDTO;
import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.domain.model.Usuario;
import br.com.justina.domain.model.Role;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Testes de Integração - Módulo Telemetria")
@Transactional
class TelemetriaIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ITelemetriaRepositoryPort repository;

    @Test
    @DisplayName("Deve registrar um batch de movimentos com sucesso (201 Created)")
    void shouldRegisterMovementsSuccessfully() throws Exception {
        UUID sessaoId = UUID.randomUUID();
        // Create dummy session and user for FK constraints if needed, though integration test might use H2
        // Assuming loose coupling or mocking repository isn't used here directly, but strict integration
        // might require existing session. Let's try to create one.
        
        Usuario user = new Usuario();
        user.setId(UUID.randomUUID());
        user.setEmail("test@test.com");
        user.setPassword("123456");
        user.setName("Test User");
        user.setRole(Role.USER);
        user.setCrm("12345");
        // repository.salvarUsuario(user); // Method not available in ITelemetriaRepositoryPort

        SessaoSimulacao sessao = SessaoSimulacao.builder()
                .id(sessaoId)
                .usuario(user) // Use .usuario(user) instead of .usuarioId(id)
                .status(StatusSessao.EM_ANDAMENTO)
                .dataInicio(LocalDateTime.now())
                .build();
        repository.salvarSessao(sessao);

        TelemetriaDTO movimento = new TelemetriaDTO(
            10.5, 20.5, 30.5, 90.0, 
            "E01", LocalDateTime.now().toString(), sessaoId.toString()
        );

        List<TelemetriaDTO> payload = List.of(movimento);

        mockMvc.perform(post("/api/telemetria/movimentos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Deve retornar 400 Bad Request ao enviar lista vazia")
    void shouldValidateInvalidPayload() throws Exception {
        mockMvc.perform(post("/api/telemetria/movimentos")
                .contentType(MediaType.APPLICATION_JSON)
                .content("[]"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve finalizar uma cirurgia com sucesso")
    void shouldFinalizeSurgerySuccessfully() throws Exception {
        // 1. Prepara o cenário: cria uma sessão em andamento no banco (em memória)
        UUID sessaoId = UUID.randomUUID();
        
        Usuario user = new Usuario();
        user.setId(UUID.randomUUID());
        user.setEmail("test2@test.com");
        user.setPassword("123456");
        user.setName("Test User 2");
        user.setRole(Role.USER);
        user.setCrm("54321");
        // repository.salvarUsuario(user); // Method not available in ITelemetriaRepositoryPort

        SessaoSimulacao sessao = SessaoSimulacao.builder()
                .id(sessaoId)
                .usuario(user) // Use .usuario(user) instead of .usuarioId(id)
                .status(StatusSessao.EM_ANDAMENTO)
                .dataInicio(LocalDateTime.now().minusMinutes(30))
                .build();
        repository.salvarSessao(sessao);

        // 2. Envia requisição de finalização
        FinalizarCirurgiaDTO dto = new FinalizarCirurgiaDTO(sessaoId);

        mockMvc.perform(post("/api/telemetria/finalizar")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FINALIZADA"));
        
        // 3. Validação no banco
        SessaoSimulacao sessaoAtualizada = repository.buscarSessaoPorId(sessaoId).orElseThrow();
        assertEquals(StatusSessao.FINALIZADA, sessaoAtualizada.getStatus());
    }

    @Test
    @DisplayName("Deve rejeitar finalização se ID da sessão não existir")
    void shouldFailToFinalizeUnknownSession() throws Exception {
        FinalizarCirurgiaDTO dto = new FinalizarCirurgiaDTO(UUID.randomUUID());

        mockMvc.perform(post("/api/telemetria/finalizar")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isInternalServerError());
    }
}
