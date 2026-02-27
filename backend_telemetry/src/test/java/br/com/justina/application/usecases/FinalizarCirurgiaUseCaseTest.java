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

    // Adicionado o Captor para validar o estado exato do objeto salvo
    @Captor
    private ArgumentCaptor<SessaoSimulacao> sessaoCaptor;

    private SessaoSimulacao sessao;
    private UUID sessaoId;
    private FinalizarCirurgiaDTO dtoFinalizacao;

    @BeforeEach
    void setUp() {
        sessaoId = UUID.randomUUID();

        sessao = SessaoSimulacao.builder()
                .id(sessaoId)
                .status(StatusSessao.EM_ANDAMENTO)
                .dataInicio(LocalDateTime.now().minusMinutes(10)) // Começou há 10 min
                .build();

        // Instanciando o DTO com o ID da sessão
        dtoFinalizacao = new FinalizarCirurgiaDTO(sessaoId);
    }

    @Test
    void deveFinalizarSessaoComSucesso() {
        when(repository.buscarSessaoPorId(sessaoId)).thenReturn(Optional.of(sessao));
        when(repository.salvarSessao(any(SessaoSimulacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Passando o DTO como segundo argumento
        SessaoSimulacao resultado = useCase.executar(sessaoId, dtoFinalizacao);

        // Validações do retorno
        assertEquals(StatusSessao.FINALIZADA, resultado.getStatus());
        assertNotNull(resultado.getDataFim());
        assertNotNull(resultado.getTempoTotalSegundos());
        assertTrue(resultado.getTempoTotalSegundos() >= 600);

        // Captura o objeto exato que foi passado para o repository.salvarSessao()
        verify(repository).salvarSessao(sessaoCaptor.capture());
        SessaoSimulacao sessaoSalva = sessaoCaptor.getValue();

        // Garante que o status foi alterado ANTES de salvar no banco
        assertEquals(StatusSessao.FINALIZADA, sessaoSalva.getStatus());

        verify(aiClient).solicitarRelatorioFinal(sessaoId);
    }

    @Test
    void deveLancarExcecaoSeSessaoNaoExiste() {
        when(repository.buscarSessaoPorId(sessaoId)).thenReturn(Optional.empty());

        // Passando o DTO na asserção de exceção
        assertThrows(IllegalArgumentException.class, () -> useCase.executar(sessaoId, dtoFinalizacao));

        verify(repository, never()).salvarSessao(any());
        verify(aiClient, never()).solicitarRelatorioFinal(any());
    }

    @Test
    void naoDeveFinalizarNovamenteSeJaEstiverFinalizada() {
        sessao.setStatus(StatusSessao.FINALIZADA);
        sessao.setDataFim(LocalDateTime.now().minusMinutes(1));

        when(repository.buscarSessaoPorId(sessaoId)).thenReturn(Optional.of(sessao));

        // Passando o DTO
        SessaoSimulacao resultado = useCase.executar(sessaoId, dtoFinalizacao);

        assertEquals(StatusSessao.FINALIZADA, resultado.getStatus());
        assertEquals(sessao.getDataFim(), resultado.getDataFim());

        verify(repository, never()).salvarSessao(any());
        verify(aiClient, never()).solicitarRelatorioFinal(any());
    }
}