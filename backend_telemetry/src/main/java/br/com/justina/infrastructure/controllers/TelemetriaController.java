package br.com.justina.infrastructure.controllers;

import br.com.justina.application.dto.AnaliseRequest;
import br.com.justina.application.dto.FinalizarSessaoRequest;
import br.com.justina.application.dto.SessaoResponse;
import br.com.justina.application.usecases.FinalizarSessaoUseCase;
import br.com.justina.application.usecases.RegistrarMovimentoUseCase;
import br.com.justina.domain.model.FeedbackIA;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/telemetria")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Telemetria", description = "Gerenciamento de movimentos e sessões cirúrgicas simuladas")
public class TelemetriaController {

    private final RegistrarMovimentoUseCase registrarMovimentoUseCase;
    private final FinalizarSessaoUseCase finalizarSessaoUseCase; // Trocamos para o motor novo

    @Operation(summary = "Receber movimentos de telemetria")
    @PostMapping("/analisar")
    public ResponseEntity<FeedbackIA> receberMovimentos(@RequestBody AnaliseRequest request) {
        if (request == null || request.getUsuarioId() == null || request.getMovimentos() == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(registrarMovimentoUseCase.executar(request.getUsuarioId(), request.getMovimentos()));
    }

    @Operation(summary = "Finalizar cirurgia")
    @PostMapping("/finalizar")
    public ResponseEntity<SessaoResponse> finalizarCirurgia(@RequestBody FinalizarSessaoRequest request, @RequestParam java.util.UUID sessaoId) {
        log.info("Finalizando sessão via telemetria para o ID: {}", sessaoId);
        SessaoResponse response = finalizarSessaoUseCase.executar(sessaoId, request);
        return ResponseEntity.ok(response);
    }
}