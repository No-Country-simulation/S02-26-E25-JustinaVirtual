package br.com.justina.infrastructure.controllers;

// 1. Atualize o Import
import br.com.justina.application.usecases.RegistrarMovimentoUseCase; 
import br.com.justina.domain.model.FeedbackIA;
import br.com.justina.domain.model.Telemetria;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/telemetria")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TelemetriaController {

    // 2. Atualize a variável injetada
    private final RegistrarMovimentoUseCase useCase; // <--- Mudou o tipo aqui

    @PostMapping("/analisar")
    public ResponseEntity<FeedbackIA> receberMovimentos(@RequestBody List<Telemetria> movimentos) {
        
        // 3. O uso continua igual (pois o método executar não mudou de nome)
        FeedbackIA feedback = useCase.executar(movimentos);
        
        return ResponseEntity.ok(feedback);
    }
}