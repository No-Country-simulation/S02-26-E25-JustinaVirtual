package br.com.justina.application.usecases;

import br.com.justina.application.ports.output.IAiClientPort;
import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.StatusSessao;
import org.junit.jupiter.api.BeforeEach;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FinalizarCirurgiaUseCaseTest {

    @Mock
    private ITelemetriaRepositoryPort repository;

    @Mock
    private IAiClientPort aiClient;

    @InjectMocks
    private FinalizarCirurgiaUseCase useCase;

    private SessaoSimulacao sessao;
    private UUID sessaoId;

    @BeforeEach
    void setUp() {
        sessaoId = UUID.randomUUID();
        sessao = SessaoSimulacao.builder()
                .id(sessaoId)
                .status(StatusSessao.EM_ANDAMENTO)
                .dataInicio(LocalDateTime.now().minusMinutes(10)) // Começou há 10 min
                .build();
    }

    @Test
    void deveFinalizarSessaoComSucesso() {
        when(repository.buscarSessaoPorId(sessaoId)).thenReturn(Optional.of(sessao));
        when(repository.salvarSessao(any(SessaoSimulacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SessaoSimulacao resultado = useCase.executar(sessaoId);

        assertEquals(StatusSessao.FINALIZADA, resultado.getStatus());
        assertNotNull(resultado.getDataFim());
        assertNotNull(resultado.getTempoTotalSegundos());
        assertTrue(resultado.getTempoTotalSegundos() >= 600); // Pelo menos 10 min (600s)

        verify(repository).salvarSessao(sessao);
        verify(aiClient).solicitarRelatorioFinal(sessaoId);
    }

    @Test
    void deveLancarExcecaoSeSessaoNaoExiste() {
        when(repository.buscarSessaoPorId(sessaoId)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> useCase.executar(sessaoId));
        
        verify(repository, never()).salvarSessao(any());
        verify(aiClient, never()).solicitarRelatorioFinal(any());
    }

    @Test
    void naoDeveFinalizarNovamenteSeJaEstiverFinalizada() {
        sessao.setStatus(StatusSessao.FINALIZADA);
        sessao.setDataFim(LocalDateTime.now().minusMinutes(1));
        
        when(repository.buscarSessaoPorId(sessaoId)).thenReturn(Optional.of(sessao));

        SessaoSimulacao resultado = useCase.executar(sessaoId);

        assertEquals(StatusSessao.FINALIZADA, resultado.getStatus());
        // Data fim não deve ter sido alterada para "agora", deve manter a antiga
        assertEquals(sessao.getDataFim(), resultado.getDataFim());

        verify(repository, never()).salvarSessao(any()); // Não salva se não mudou
        verify(aiClient, never()).solicitarRelatorioFinal(any()); // Não chama IA de novo
    }
}
