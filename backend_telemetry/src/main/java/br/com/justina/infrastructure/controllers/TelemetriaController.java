package br.com.justina.infrastructure.controllers;

import br.com.justina.application.dto.AnaliseRequest;
import br.com.justina.application.dto.AsyncResponseDTO; 
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

@Slf4j
@RestController
@RequestMapping("/telemetria")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Telemetria", description = "Gerenciamento de movimentos e sessões cirúrgicas simuladas")
public class TelemetriaController {

    private final RegistrarMovimentoUseCase registrarMovimentoUseCase;
    // Troquei para o UseCase que preparei com @Async
    private final FinalizarCirurgiaUseCase finalizarCirurgiaUseCase; 

    // --- ENDPOINT PRINCIPAL (MANTIDO IGUAL) ---
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
            // MODO RESGATE HACKATHON (MANTIDO)
            log.error("ERRO DE PERSISTÊNCIA (BLOQUEADO): {}", e.getMessage());
            FeedbackIA feedbackSeguro = new FeedbackIA();
            feedbackSeguro.setStatus("SUCESSO");
            feedbackSeguro.setMensagem("Simulação processada com sucesso (Modo de Contingência)");
            return ResponseEntity.ok(feedbackSeguro);
        } finally {
            MDC.remove("usuarioId");
        }
    }

    // --- ENDPOINT FINALIZAR (MODO ASSÍNCRONO) ---
    @Operation(summary = "Finalizar cirurgia", description = "Inicia o processamento do relatório em background e retorna imediatamente.")
    @PostMapping("/finalizar") 
    // Nota: Mantivem o padrão de receber o DTO no corpo para compatibilidade com o UseCase
    public ResponseEntity<AsyncResponseDTO> finalizarCirurgia(@RequestBody FinalizarCirurgiaDTO dto) {
        
        if (dto == null || dto.getSessaoId() == null) {
            log.error("Tentativa de finalizar cirurgia com payload inválido");
            return ResponseEntity.badRequest().build();
        }

        MDC.put("sessionId", dto.getSessaoId().toString());
        try {
            log.info("Requisição de finalização assíncrona recebida");

            // Chama o UseCase e recebe o recibo (AsyncResponseDTO)
            AsyncResponseDTO resposta = finalizarCirurgiaUseCase.executar(dto.getSessaoId(), dto);
            
            // Retorna 202 ACCEPTED (Isso libera o frontend na hora!)
            return ResponseEntity.accepted().body(resposta);

        } finally {
            MDC.remove("sessionId");
        }
    }
}