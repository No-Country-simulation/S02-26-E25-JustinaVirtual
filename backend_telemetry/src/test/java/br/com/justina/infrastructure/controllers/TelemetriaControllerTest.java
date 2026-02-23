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
        UUID usuarioId = UUID.randomUUID();
        List<Telemetria> movimentos = Collections.singletonList(new Telemetria());
        
        AnaliseRequest request = new AnaliseRequest();
        request.setUsuarioId(usuarioId);
        request.setMovimentos(movimentos);

        FeedbackIA feedbackEsperado = new FeedbackIA("APROVADO", "Bom", 0.9);

        when(registrarMovimentoUseCase.executar(eq(usuarioId), any())).thenReturn(feedbackEsperado);

        ResponseEntity<FeedbackIA> response = controller.receberMovimentos(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("APROVADO", response.getBody().getStatus());
    }
}