package br.com.justina.application.usecases;

import br.com.justina.application.dto.FinalizarSessaoRequest;
import br.com.justina.application.dto.SessaoResponse;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.StatusSessao;
import br.com.justina.domain.repository.SessaoSimulacaoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FinalizarSessaoUseCaseTest {

    @Mock
    private SessaoSimulacaoRepository sessaoRepository;

    @Mock
    private GeminiService geminiService;

    @InjectMocks
    private FinalizarSessaoUseCase finalizarSessaoUseCase;

    @Test
    @DisplayName("Deve finalizar sessão com sucesso")
    void deveFinalizarSessaoComSucesso() {
        UUID sessaoId = UUID.randomUUID();
        FinalizarSessaoRequest request = new FinalizarSessaoRequest(10, 85.5);

        SessaoSimulacao sessao = SessaoSimulacao.builder()
                .id(sessaoId)
                .dataInicio(LocalDateTime.now().minusMinutes(10))
                .status(StatusSessao.EM_ANDAMENTO)
                .build();

        when(sessaoRepository.findById(sessaoId)).thenReturn(Optional.of(sessao));
        when(geminiService.gerarFeedback(anyInt(), anyDouble())).thenReturn("Bom trabalho");
        when(sessaoRepository.save(any(SessaoSimulacao.class))).thenReturn(sessao);

        SessaoResponse response = finalizarSessaoUseCase.executar(sessaoId, request);

        assertNotNull(response);
        assertEquals("FINALIZADA", response.status());
        verify(sessaoRepository).save(any());
    }

    @Test
    @DisplayName("Deve lançar exceção quando sessão não existe")
    void deveLancarExcecaoSessaoInexistente() {
        UUID sessaoId = UUID.randomUUID();
        FinalizarSessaoRequest request = new FinalizarSessaoRequest(0, 0.0);

        when(sessaoRepository.findById(sessaoId)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () ->
                finalizarSessaoUseCase.executar(sessaoId, request)
        );
    }
}