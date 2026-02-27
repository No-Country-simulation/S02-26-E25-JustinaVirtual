package br.com.justina.application.usecases;

import br.com.justina.application.ports.output.IAiClientPort;
import br.com.justina.application.ports.output.ITelemetriaRepositoryPort;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.StatusSessao;
import br.com.justina.infrastructure.dto.FinalizarCirurgiaDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
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

    @Captor
    private ArgumentCaptor<SessaoSimulacao> sessaoCaptor;

    private SessaoSimulacao sessao;
    private UUID sessaoId;
    private FinalizarCirurgiaDTO dto;

    @BeforeEach
    void setUp() {
        sessaoId = UUID.randomUUID();
        dto = new FinalizarCirurgiaDTO(sessaoId);
        
        sessao = new SessaoSimulacao();
        sessao.setId(sessaoId);
        sessao.setStatus(StatusSessao.EM_ANDAMENTO);
        sessao.setDataInicio(LocalDateTime.now().minusMinutes(10));
    }

    @Test
    void deveFinalizarSessaoComSucesso() {
        when(repository.buscarSessaoPorId(sessaoId)).thenReturn(Optional.of(sessao));
        // Configura o mock para retornar a sessão que foi passada para salvar
        when(repository.salvarSessao(any(SessaoSimulacao.class))).thenAnswer(i -> i.getArguments()[0]);

        // Executa
        SessaoSimulacao resultado = useCase.executar(sessaoId, dto);

        // Validações
        assertEquals(StatusSessao.FINALIZADA, resultado.getStatus());
        assertNotNull(resultado.getDataFim());

        // Verifica persistência usando o Captor da equipe (Mais robusto)
        verify(repository).salvarSessao(sessaoCaptor.capture());
        assertEquals(StatusSessao.FINALIZADA, sessaoCaptor.getValue().getStatus());

        
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

        SessaoSimulacao resultado = useCase.executar(sessaoId, dto);

        assertEquals(StatusSessao.FINALIZADA, resultado.getStatus());
        
        
        verify(repository, never()).salvarSessao(any());
    }
}