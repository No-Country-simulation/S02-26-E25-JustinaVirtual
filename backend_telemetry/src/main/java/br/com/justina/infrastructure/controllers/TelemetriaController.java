package br.com.justina.infrastructure.controllers;

import br.com.justina.application.usecases.ConsultarTelemetriaUseCase;
import br.com.justina.application.services.TelemetryEngine;
import br.com.justina.application.usecases.FinalizarCirurgiaUseCase;
import br.com.justina.application.usecases.RegistrarMovimentoUseCase;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.Telemetria;
import br.com.justina.infrastructure.dto.FinalizarCirurgiaDTO;
import br.com.justina.infrastructure.dto.TelemetriaDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Tag(name = "Telemetria", description = "Gerenciamento de movimentos e sessões cirúrgicas simuladas")
@Slf4j
@RequestMapping("/telemetria")
@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TelemetriaController {

    private final RegistrarMovimentoUseCase registrarMovimentoUseCase;
    private final FinalizarCirurgiaUseCase finalizarCirurgiaUseCase;
    private final TelemetryEngine telemetryEngine;
    private final ConsultarTelemetriaUseCase consultarTelemetriaUseCase;

    @Operation(
            summary = "Receber movimentos de telemetria",
            description = "Recebe um batch de movimentos, processa via TelemetryEngine e persiste apenas os válidos."
    )
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

    @Operation(
            summary = "Finalizar cirurgia",
            description = "Finaliza a sessão de simulação com base no ID informado."
    )
    @PostMapping("/finalizar")
    public ResponseEntity<SessaoSimulacao> finalizarCirurgia(@RequestBody FinalizarCirurgiaDTO dto) {
        if (dto == null || dto.getSessaoId() == null) {
            return ResponseEntity.badRequest().build();
        }

        SessaoSimulacao sessao = finalizarCirurgiaUseCase.executar(dto.getSessaoId());
        return ResponseEntity.ok(sessao);
    }

    @Operation(summary = "Busca telemetria de uma sessão", description = "Retorna todos os pontos de movimento ordenados para construção de gráficos.")
    @GetMapping("/movimentos/{sessaoId}")
    public ResponseEntity<List<Telemetria>> obterTelemetria(@PathVariable UUID sessaoId) {
        List<Telemetria> dados = consultarTelemetriaUseCase.executar(sessaoId);
        return ResponseEntity.ok(dados);
    }
}
