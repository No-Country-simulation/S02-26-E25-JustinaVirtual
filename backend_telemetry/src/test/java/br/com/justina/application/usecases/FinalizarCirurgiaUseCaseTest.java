package br.com.justina.application.usecases;

import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.StatusSessao;
import br.com.justina.infrastructure.dto.FinalizarCirurgiaDTO;
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

    @InjectMocks
    private FinalizarCirurgiaUseCase useCase;

    private SessaoSimulacao sessao;
    private UUID sessaoId;
    private FinalizarCirurgiaDTO dto;

    @BeforeEach
    void setUp() {
        sessaoId = UUID.randomUUID();
        dto = new FinalizarCirurgiaDTO(sessaoId);
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

        SessaoSimulacao resultado = useCase.executar(sessaoId, dto);

        assertEquals(StatusSessao.FINALIZADA, resultado.getStatus());
        assertNotNull(resultado.getDataFim());

        verify(repository).salvarSessao(sessao);
    }

    @Test
    void deveLancarExcecaoSeSessaoNaoExiste() {
        when(repository.buscarSessaoPorId(sessaoId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> useCase.executar(sessaoId, dto));
        
        verify(repository, never()).salvarSessao(any());
    }

    @Test
    void naoDeveFinalizarNovamenteSeJaEstiverFinalizada() {
        sessao.setStatus(StatusSessao.FINALIZADA);
        sessao.setDataFim(LocalDateTime.now().minusMinutes(1));
        
        when(repository.buscarSessaoPorId(sessaoId)).thenReturn(Optional.of(sessao));
        when(repository.salvarSessao(any(SessaoSimulacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SessaoSimulacao resultado = useCase.executar(sessaoId, dto);

        assertEquals(StatusSessao.FINALIZADA, resultado.getStatus());
        
        verify(repository).salvarSessao(any());
    }
}
