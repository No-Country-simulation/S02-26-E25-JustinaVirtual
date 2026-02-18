package br.com.justina.infrastructure.controllers;

import br.com.justina.application.services.TelemetryEngine;
import br.com.justina.application.usecases.FinalizarCirurgiaUseCase;
import br.com.justina.application.usecases.RegistrarMovimentoUseCase;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.Telemetria;
import br.com.justina.infrastructure.dto.FinalizarCirurgiaDTO;
import br.com.justina.infrastructure.dto.TelemetriaDTO;
import org.junit.jupiter.api.BeforeEach;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TelemetriaControllerTest {

    @Mock
    private RegistrarMovimentoUseCase registrarMovimentoUseCase;

    @Mock
    private FinalizarCirurgiaUseCase finalizarCirurgiaUseCase;

    @Mock
    private TelemetryEngine telemetryEngine;

    @InjectMocks
    private TelemetriaController controller;

    @Test
    void deveReceberMovimentosComSucesso() {
        TelemetriaDTO dto = new TelemetriaDTO();
        Telemetria telemetria = new Telemetria();
        
        when(telemetryEngine.process(any())).thenReturn(telemetria);

        ResponseEntity<Void> response = controller.receberMovimentos(List.of(dto));

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(registrarMovimentoUseCase).executar(anyList());
    }

    @Test
    void deveIgnorarMovimentosThrottled() {
        TelemetriaDTO dto = new TelemetriaDTO();
        
        // Simula que a engine descartou o evento (throttling)
        when(telemetryEngine.process(any())).thenReturn(null);

        ResponseEntity<Void> response = controller.receberMovimentos(List.of(dto));

        assertEquals(HttpStatus.CREATED, response.getStatusCode()); // Ainda retorna 201 pois o batch foi aceito
        verify(registrarMovimentoUseCase, never()).executar(anyList()); // Mas não chama o use case
    }

    @Test
    void deveRetornarBadRequestSeListaVazia() {
        ResponseEntity<Void> response = controller.receberMovimentos(Collections.emptyList());
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void deveFinalizarCirurgiaComSucesso() {
        UUID sessaoId = UUID.randomUUID();
        FinalizarCirurgiaDTO dto = new FinalizarCirurgiaDTO(sessaoId);
        SessaoSimulacao sessao = new SessaoSimulacao();
        
        when(finalizarCirurgiaUseCase.executar(sessaoId)).thenReturn(sessao);

        ResponseEntity<SessaoSimulacao> response = controller.finalizarCirurgia(dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(sessao, response.getBody());
    }
}
