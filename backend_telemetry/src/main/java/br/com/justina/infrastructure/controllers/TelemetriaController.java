package br.com.justina.infrastructure.controllers;

import br.com.justina.application.dto.AnaliseRequest;
import br.com.justina.application.usecases.FinalizarCirurgiaUseCase;
import br.com.justina.application.usecases.RegistrarMovimentoUseCase;
import br.com.justina.domain.model.FeedbackIA;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.infrastructure.dto.FinalizarCirurgiaDTO;
// Imports da equipe (Swagger/Docs)
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/telemetria") // Mantemos o /api por padrão REST
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Telemetria", description = "Gerenciamento de movimentos e sessões cirúrgicas simuladas")
public class TelemetriaController {

    private final RegistrarMovimentoUseCase registrarMovimentoUseCase;
    private final FinalizarCirurgiaUseCase finalizarCirurgiaUseCase;

    // --- ENDPOINT PRINCIPAL ---
    @Operation(
        summary = "Receber movimentos de telemetria",
        description = "Recebe um batch de movimentos com ID do usuário, processa via IA e persiste."
    )
    @PostMapping("/analisar") // Mantemos /analisar para compatibilidade com seu frontend
    public ResponseEntity<FeedbackIA> receberMovimentos(@RequestBody AnaliseRequest request) {
        // Validação básica
        if (request == null || request.getUsuarioId() == null || request.getMovimentos() == null) {
            log.warn("Payload inválido recebido em /analisar: Usuário ou movimentos nulos");
            return ResponseEntity.badRequest().build();
        }

        // Log estruturado (MDC) trazido pela equipe
        MDC.put("usuarioId", request.getUsuarioId().toString());
        
        try {
            log.info("Recebendo batch de {} movimentos para o usuário {}", 
                    request.getMovimentos().size(), request.getUsuarioId());

            // Chama UseCase passando o ID e a Lista (Sua lógica correta)
            FeedbackIA feedback = registrarMovimentoUseCase.executar(
                request.getUsuarioId(), 
                request.getMovimentos()
            );
            
            return ResponseEntity.ok(feedback);
            
        } finally {
            MDC.remove("usuarioId");
        }
    }

    // --- ENDPOINT FINALIZAR ---
    @Operation(
        summary = "Finalizar cirurgia",
        description = "Finaliza a sessão de simulação com base no ID informado."
    )
    @PostMapping("/finalizar")
    public ResponseEntity<SessaoSimulacao> finalizarCirurgia(@RequestBody FinalizarCirurgiaDTO dto) {
        if (dto == null || dto.getSessaoId() == null) {
            log.error("Tentativa de finalizar cirurgia com payload inválido");
            return ResponseEntity.badRequest().build();
        }

        MDC.put("sessionId", dto.getSessaoId().toString());
        try {
            log.info("Requisição de finalização recebida");
            
            // Chama o UseCase corrigido
            SessaoSimulacao sessao = finalizarCirurgiaUseCase.executar(dto.getSessaoId(), dto);
            return ResponseEntity.ok(sessao);
        } finally {
            MDC.remove("sessionId");
        }
    }
}