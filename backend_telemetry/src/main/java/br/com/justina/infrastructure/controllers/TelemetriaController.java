package br.com.justina.infrastructure.controllers;

import br.com.justina.application.dto.AnaliseRequest;
import br.com.justina.application.usecases.RegistrarMovimentoUseCase;
import br.com.justina.domain.model.FeedbackIA;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/telemetria")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TelemetriaController {

    private final RegistrarMovimentoUseCase useCase;

    @PostMapping("/analisar")
    public ResponseEntity<FeedbackIA> receberMovimentos(@RequestBody AnaliseRequest request) {
        // Passamos o ID e a lista para o UseCase
        FeedbackIA feedback = useCase.executar(request.getUsuarioId(), request.getMovimentos());
        return ResponseEntity.ok(feedback);
    }
}