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
        // 1. Arrange (Preparar)
        UUID usuarioId = UUID.randomUUID();
        Telemetria telemetria = new Telemetria();
        telemetria.setEixoX(10.0);
        List<Telemetria> movimentos = Collections.singletonList(telemetria);

        // Criamos o objeto "Envelope" que o Controller espera agora
        AnaliseRequest request = new AnaliseRequest();
        request.setUsuarioId(usuarioId);
        request.setMovimentos(movimentos);

        FeedbackIA feedbackEsperado = new FeedbackIA("APROVADO", "Movimento OK", 0.95);

        // Ensinamos o Mock a aceitar (UUID, List)
        when(registrarMovimentoUseCase.executar(eq(usuarioId), any())).thenReturn(feedbackEsperado);

        // 2. Act (Executar)
        ResponseEntity<FeedbackIA> response = controller.receberMovimentos(request);

        // 3. Assert (Validar)
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("APROVADO", response.getBody().getStatus());
    }

    
}