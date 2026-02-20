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
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@RequestMapping
@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TelemetriaController {

    private final RegistrarMovimentoUseCase registrarMovimentoUseCase;
    private final FinalizarCirurgiaUseCase finalizarCirurgiaUseCase;
    private final TelemetryEngine telemetryEngine;
    private final ConsultarTelemetriaUseCase consultarTelemetriaUseCase;

    @PostMapping("/movimentos")
    public ResponseEntity<Void> receberMovimentos(@RequestBody @Valid List<TelemetriaDTO> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            log.warn("Recebido batch de movimentos vazio ou nulo");
            return ResponseEntity.badRequest().build();
        }

        // Tenta extrair sessionId do primeiro item para log
        String sessionId = dtos.get(0).getSessionId();
        MDC.put("sessionId", sessionId != null ? sessionId : "UNKNOWN");

        try {
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
                log.info("Processando batch com {} movimentos válidos (Total recebido: {})", movimentosValidos.size(), dtos.size());
                registrarMovimentoUseCase.executar(movimentosValidos);
            } else {
                log.warn("Todos os {} movimentos do batch foram descartados/throttled ou inválidos.", dtos.size());
            }

            return ResponseEntity.status(HttpStatus.CREATED).build();
        } finally {
            MDC.remove("sessionId");
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
            SessaoSimulacao sessao = finalizarCirurgiaUseCase.executar(dto.getSessaoId());
            return ResponseEntity.ok(sessao);
        } finally {
            MDC.remove("sessionId");
        }
    }

    @Operation(summary = "Busca telemetria de uma sessão", description = "Retorna todos os pontos de movimento ordenados para construção de gráficos.")
    @GetMapping("/movimentos/{sessaoId}")
    public ResponseEntity<List<Telemetria>> obterTelemetria(@PathVariable UUID sessaoId) {
        List<Telemetria> dados = consultarTelemetriaUseCase.executar(sessaoId);
        return ResponseEntity.ok(dados);
    }
}
