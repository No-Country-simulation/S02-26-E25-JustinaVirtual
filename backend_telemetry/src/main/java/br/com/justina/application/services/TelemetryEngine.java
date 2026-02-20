package br.com.justina.application.services;

import br.com.justina.domain.model.Telemetria;
import br.com.justina.infrastructure.dto.TelemetriaDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class TelemetryEngine {

    // Cache simples para throttling: SessionId -> LastProcessedTime
    private final Map<String, LocalDateTime> throttleMap = new ConcurrentHashMap<>();
    
    // Configuração de Throttling (ex: processar no máximo 1 evento a cada 50ms por sessão)
    private static final long THROTTLE_DELAY_MS = 50;

    /**
     * Processa o DTO de entrada: normaliza e aplica regras de throttling.
     * Retorna a entidade normalizada ou null se o evento for descartado (throttled).
     */
    public Telemetria process(TelemetriaDTO dto) {
        if (dto == null || dto.getSessionId() == null) {
            return null; // Ou lançar exceção de validação
        }

        // 1. Throttling
        if (isThrottled(dto.getSessionId())) {
            log.warn("Evento Throttled (Descartado) - Session: {}", dto.getSessionId());
            return null;
        }

        // 2. Normalização
        return normalize(dto);
    }

    private boolean isThrottled(String sessionId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastTime = throttleMap.get(sessionId);

        if (lastTime != null) {
            // Se o tempo desde o último evento for menor que o delay permitido, descarta
            if (lastTime.plusNanos(THROTTLE_DELAY_MS * 1_000_000).isAfter(now)) {
                return true;
            }
        }
        
        throttleMap.put(sessionId, now);
        return false;
    }

    private Telemetria normalize(TelemetriaDTO dto) {
        Telemetria telemetria = new Telemetria();
        
        // Normalização de Coordenadas (Exemplo: Arredondar para 4 casas decimais)
        telemetria.setEixoX(round(dto.getX()));
        telemetria.setEixoY(round(dto.getY()));
        telemetria.setEixoZ(round(dto.getZ()));
        telemetria.setRotacao(round(dto.getRotation()));
        
        telemetria.setEventId(dto.getEventId());
        telemetria.setSessionId(dto.getSessionId());
        
        // Parsing de Timestamp (ISO-8601)
        // Se falhar ou vier nulo, usa o tempo atual (Clock Skew logic pode entrar aqui depois)
        try {
            if (dto.getTimestamp() != null) {
                telemetria.setTimestamp(LocalDateTime.parse(dto.getTimestamp(), DateTimeFormatter.ISO_DATE_TIME));
            } else {
                telemetria.setTimestamp(LocalDateTime.now());
            }
        } catch (Exception e) {
            log.error("Erro no parse do timestamp: {} - Usando now()", e.getMessage());
            telemetria.setTimestamp(LocalDateTime.now());
        }

        return telemetria;
    }

    private Double round(Double value) {
        if (value == null) return 0.0;
        return Math.round(value * 10000.0) / 10000.0;
    }
}
