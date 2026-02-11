package br.com.justina.infrastructure.controllers;

import br.com.justina.application.usecases.ProcessarTelemetriaUseCase;
import br.com.justina.domain.model.FeedbackIA;
import br.com.justina.domain.model.Telemetria;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/telemetria")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TelemetriaController {

    private final ProcessarTelemetriaUseCase useCase;

    @PostMapping("/analisar")
    public ResponseEntity<FeedbackIA> receberMovimentos(@RequestBody List<Telemetria> movimentos) {
        
        // Chama o UseCase (Coração da aplicação)
        FeedbackIA feedback = useCase.executar(movimentos);
        
        return ResponseEntity.ok(feedback);
    }
}