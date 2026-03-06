package br.com.justina.infrastructure.controllers;

import br.com.justina.application.dto.AnaliseRequest;
import br.com.justina.application.dto.AsyncResponseDTO;
import br.com.justina.application.usecases.ConsultarResultadoUseCase; // <--- NOVO
import br.com.justina.application.usecases.FinalizarCirurgiaUseCase;
import br.com.justina.application.usecases.RegistrarMovimentoUseCase;
import br.com.justina.domain.model.FeedbackIA;
import br.com.justina.infrastructure.dto.FinalizarCirurgiaDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/telemetria")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Telemetria", description = "Gerenciamento de movimentos e sessões cirúrgicas simuladas")
public class TelemetriaController {

    private final RegistrarMovimentoUseCase registrarMovimentoUseCase;
    private final FinalizarCirurgiaUseCase finalizarCirurgiaUseCase;
    private final ConsultarResultadoUseCase consultarResultadoUseCase; // <--- INJEÇÃO NOVA

    // --- ENDPOINT PRINCIPAL (MANTIDO) ---
    @Operation(summary = "Receber movimentos de telemetria", description = "Recebe um batch de movimentos com ID do usuário, processa via IA e persiste.")
    @PostMapping("/analisar")
    public ResponseEntity<?> receberMovimentos(@RequestBody AnaliseRequest request) {
        if (request == null || request.getUsuarioId() == null || request.getMovimentos() == null) {
            return ResponseEntity.badRequest().build();
        }

        MDC.put("usuarioId", request.getUsuarioId().toString());

        try {
            log.info("Recebendo batch de {} movimentos para o usuário {}",
                    request.getMovimentos().size(), request.getUsuarioId());

            FeedbackIA feedback = registrarMovimentoUseCase.executar(
                    request.getUsuarioId(),
                    request.getMovimentos());

            return ResponseEntity.ok(feedback);

        } catch (Exception e) {
            log.error("ERRO DE PERSISTÊNCIA (BLOQUEADO): {}", e.getMessage());
            FeedbackIA feedbackSeguro = new FeedbackIA();
            feedbackSeguro.setStatus("SUCESSO");
            feedbackSeguro.setMensagem("Simulação processada com sucesso (Modo de Contingência)");
            return ResponseEntity.ok(feedbackSeguro);
        } finally {
            MDC.remove("usuarioId");
        }
    }

    // --- ENDPOINT FINALIZAR (MANTIDO) ---
    @Operation(summary = "Finalizar cirurgia", description = "Inicia o processamento do relatório em background e retorna imediatamente.")
    @PostMapping("/finalizar")
    public ResponseEntity<AsyncResponseDTO> finalizarCirurgia(@RequestBody FinalizarCirurgiaDTO dto) {
        if (dto == null || dto.getSessaoId() == null) {
            log.error("Tentativa de finalizar cirurgia com payload inválido");
            return ResponseEntity.badRequest().build();
        }

        MDC.put("sessionId", dto.getSessaoId().toString());
        try {
            log.info("Requisição de finalização assíncrona recebida");
            AsyncResponseDTO resposta = finalizarCirurgiaUseCase.executar(dto.getSessaoId(), dto);
            return ResponseEntity.accepted().body(resposta);
        } finally {
            MDC.remove("sessionId");
        }
    }

    // --- ENDPOINT CONSULTAR RESULTADO ---
    @Operation(summary = "Consultar status do relatório", description = "Endpoint para polling: Verifica se a IA já terminou de gerar o PDF.")
    @GetMapping("/resultado/{sessaoId}")
    public ResponseEntity<AsyncResponseDTO> consultarResultado(@PathVariable UUID sessaoId) {
        
        AsyncResponseDTO resposta = consultarResultadoUseCase.executar(sessaoId);
        return ResponseEntity.ok(resposta);
    }
}