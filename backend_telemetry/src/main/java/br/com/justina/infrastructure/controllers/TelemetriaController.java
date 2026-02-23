package br.com.justina.infrastructure.controllers;

import br.com.justina.application.dto.AnaliseRequest;
import br.com.justina.application.usecases.FinalizarCirurgiaUseCase;
import br.com.justina.application.usecases.RegistrarMovimentoUseCase;
import br.com.justina.domain.model.FeedbackIA;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.infrastructure.dto.FinalizarCirurgiaDTO;
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
public class TelemetriaController {

    private final RegistrarMovimentoUseCase registrarMovimentoUseCase;
    private final FinalizarCirurgiaUseCase finalizarCirurgiaUseCase;

    // --- ENDPOINT PRINCIPAL ---
    @PostMapping("/analisar")
    public ResponseEntity<FeedbackIA> receberMovimentos(@RequestBody AnaliseRequest request) {
        // Validação básica
        if (request == null || request.getUsuarioId() == null || request.getMovimentos() == null) {
            log.warn("Payload inválido recebido em /analisar");
            return ResponseEntity.badRequest().build();
        }

        // Log estruturado 
        MDC.put("usuarioId", request.getUsuarioId().toString());
        
        try {
            log.info("Recebendo batch de {} movimentos para o usuário {}", 
                    request.getMovimentos().size(), request.getUsuarioId());

            // Chama UseCase passando o ID e a Lista
            FeedbackIA feedback = registrarMovimentoUseCase.executar(
                request.getUsuarioId(), 
                request.getMovimentos()
            );
            
            return ResponseEntity.ok(feedback);
            
        } finally {
            MDC.remove("usuarioId");
        }
    }

    
    @PostMapping("/finalizar")
    public ResponseEntity<SessaoSimulacao> finalizarCirurgia(@RequestBody FinalizarCirurgiaDTO dto) {
        if (dto == null || dto.getSessaoId() == null) {
            log.error("Tentativa de finalizar cirurgia com payload inválido");
            return ResponseEntity.badRequest().build();
        }

        MDC.put("sessionId", dto.getSessaoId().toString());
        try {
            log.info("Requisição de finalização recebida");
            
            SessaoSimulacao sessao = finalizarCirurgiaUseCase.executar(dto.getSessaoId(), dto);
            return ResponseEntity.ok(sessao);
        } finally {
            MDC.remove("sessionId");
        }
    }
}