package br.com.justina.application.services;

import br.com.justina.domain.model.Telemetria;
import br.com.justina.infrastructure.dto.TelemetriaDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class TelemetryEngine {

    // Cache simples para throttling: SessionId -> LastProcessedTime
    private final Map<String, LocalDateTime> throttleMap = new ConcurrentHashMap<>();
    
    // Configurações
    private static final long THROTTLE_DELAY_MS = 50;
    
    // TASK #30: Tolerância de 5 segundos para o futuro (Clock Skew)
    private static final long MAX_FUTURE_SKEW_MS = 5000; 

    public Telemetria process(TelemetriaDTO dto) {
        if (dto == null || dto.getSessionId() == null) {
            return null;
        }

        // 1. Throttling
        if (isThrottled(dto.getSessionId())) {
            return null;
        }

        // 2. Normalização e Ajuste de Relógio
        return normalizeAndAdjustClock(dto);
    }

    private boolean isThrottled(String sessionId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastTime = throttleMap.get(sessionId);

        if (lastTime != null) {
            if (lastTime.plusNanos(THROTTLE_DELAY_MS * 1_000_000).isAfter(now)) {
                return true;
            }
        }
        throttleMap.put(sessionId, now);
        return false;
    }

    private Telemetria normalizeAndAdjustClock(TelemetriaDTO dto) {
        Telemetria telemetria = new Telemetria();
        
        // Copia dados básicos e arredonda
        telemetria.setEixoX(round(dto.getX()));
        telemetria.setEixoY(round(dto.getY()));
        telemetria.setEixoZ(round(dto.getZ()));
        telemetria.setRotacao(round(dto.getRotation()));
        telemetria.setEventId(dto.getEventId());
        
        // --- LÓGICA DA TASK #30: Clock Skew ---
        LocalDateTime serverTime = LocalDateTime.now();
        LocalDateTime clientTime;

        try {
            if (dto.getTimestamp() != null) {
                // Tenta ler a data que veio do frontend
                clientTime = LocalDateTime.parse(dto.getTimestamp(), DateTimeFormatter.ISO_DATE_TIME);
            } else {
                clientTime = serverTime;
            }
        } catch (Exception e) {
            log.warn("Erro no parse do timestamp: {} - Usando Server Time", e.getMessage());
            clientTime = serverTime;
        }

        // Verifica a diferença: (Tempo Cliente) - (Tempo Servidor)
        long diferencaFuturo = ChronoUnit.MILLIS.between(serverTime, clientTime);

        if (diferencaFuturo > MAX_FUTURE_SKEW_MS) {
            // Se o cliente diz que é amanhã, usamos o tempo de agora do servidor
            log.warn("Clock Skew detectado! Cliente está {}ms no futuro. Ajustando para Server Time.", diferencaFuturo);
            telemetria.setTimestamp(serverTime);
        } else {
            // Se estiver dentro da tolerância (ou no passado), aceitamos o tempo do cliente
            telemetria.setTimestamp(clientTime);
        }

        return telemetria;
    }

    private Double round(Double value) {
        if (value == null) return 0.0;
        return Math.round(value * 10000.0) / 10000.0;
    }
}