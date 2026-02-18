package br.com.justina.infrastructure.controllers;

import br.com.justina.application.services.TelemetryEngine;
import br.com.justina.application.usecases.FinalizarCirurgiaUseCase;
import br.com.justina.application.usecases.RegistrarMovimentoUseCase;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.Telemetria;
import br.com.justina.infrastructure.dto.FinalizarCirurgiaDTO;
import br.com.justina.infrastructure.dto.TelemetriaDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TelemetriaController {

    private final RegistrarMovimentoUseCase registrarMovimentoUseCase;
    private final FinalizarCirurgiaUseCase finalizarCirurgiaUseCase;
    private final TelemetryEngine telemetryEngine;

    @PostMapping("/movimentos")
    public ResponseEntity<Void> receberMovimentos(@RequestBody @Valid List<TelemetriaDTO> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        List<Telemetria> movimentosValidos = new ArrayList<>();

        for (TelemetriaDTO dto : dtos) {
            // Processa via Engine (Normalização + Throttling)
            Telemetria telemetria = telemetryEngine.process(dto);
            
            // Se não foi throttled (retornou objeto), adiciona na lista para salvar
            if (telemetria != null) {
                movimentosValidos.add(telemetria);
            }
        }

        if (!movimentosValidos.isEmpty()) {
            // Envia apenas os válidos para o UseCase (Persistência + IA realtime se houver)
            registrarMovimentoUseCase.executar(movimentosValidos);
        } else {
            log.warn("Todos os movimentos do batch foram descartados/throttled ou inválidos.");
        }

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/finalizar")
    public ResponseEntity<SessaoSimulacao> finalizarCirurgia(@RequestBody FinalizarCirurgiaDTO dto) {
        if (dto == null || dto.getSessaoId() == null) {
            return ResponseEntity.badRequest().build();
        }

        SessaoSimulacao sessao = finalizarCirurgiaUseCase.executar(dto.getSessaoId());
        return ResponseEntity.ok(sessao);
    }
}
