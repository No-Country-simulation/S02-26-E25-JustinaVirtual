package br.com.justina.infrastructure.controllers;

import br.com.justina.application.dto.AnaliseRequest;
import br.com.justina.application.usecases.RegistrarMovimentoUseCase;
import br.com.justina.domain.model.FeedbackIA;
import br.com.justina.domain.model.Telemetria;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TelemetriaControllerTest {

    @Mock
    private RegistrarMovimentoUseCase registrarMovimentoUseCase;

    @InjectMocks
    private TelemetriaController controller;

    @Test
    void deveRetornarFeedbackQuandoReceberMovimentosValidos() {
        // Arrange
        UUID usuarioId = UUID.randomUUID();
        Telemetria t = new Telemetria();
        List<Telemetria> movimentos = Collections.singletonList(t);

        AnaliseRequest request = new AnaliseRequest();
        request.setUsuarioId(usuarioId);
        request.setMovimentos(movimentos);

        // Ajustado para usar o construtor ou apenas os setters que existem
        FeedbackIA feedbackEsperado = new FeedbackIA();
        feedbackEsperado.setStatus("APROVADO");
        feedbackEsperado.setMensagem("Movimento preciso");

        when(registrarMovimentoUseCase.executar(eq(usuarioId), any())).thenReturn(feedbackEsperado);

        // Act
        ResponseEntity<?> response = controller.receberMovimentos(request);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        FeedbackIA corpoResposta = (FeedbackIA) response.getBody();
        assertEquals("APROVADO", corpoResposta.getStatus());
    }
}