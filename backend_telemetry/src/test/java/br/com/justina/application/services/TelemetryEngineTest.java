package br.com.justina.application.services;

import br.com.justina.domain.model.Telemetria;
import br.com.justina.infrastructure.dto.TelemetriaDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class TelemetryEngineTest {

    private TelemetryEngine engine;

    @BeforeEach
    void setUp() {
        engine = new TelemetryEngine();
    }

    @Test
    void shouldProcessValidTelemetry() {
        TelemetriaDTO dto = new TelemetriaDTO(10.12345, 20.54321, 5.0, 90.0, "event1", "2023-10-27T10:00:00", "session1");
        
        Telemetria result = engine.process(dto);
        
        assertNotNull(result);
        assertEquals(10.1235, result.getEixoX(), 0.0001); // Rounded to 4 decimals
        assertEquals(20.5432, result.getEixoY(), 0.0001);
        assertEquals(LocalDateTime.parse("2023-10-27T10:00:00"), result.getTimestamp());
        assertEquals("session1", result.getSessionId());
    }

    @Test
    void shouldThrottleFastRequests() {
        TelemetriaDTO dto1 = new TelemetriaDTO(10.0, 20.0, 5.0, 90.0, "evt1", null, "session2");
        TelemetriaDTO dto2 = new TelemetriaDTO(10.1, 20.1, 5.1, 91.0, "evt2", null, "session2");

        Telemetria result1 = engine.process(dto1);
        Telemetria result2 = engine.process(dto2); // Should be throttled (within 50ms)

        assertNotNull(result1);
        assertNull(result2, "Second request should be throttled");
    }

    @Test
    void shouldHandleNullTimestamp() {
        TelemetriaDTO dto = new TelemetriaDTO(10.0, 20.0, 5.0, 90.0, "evt3", null, "session3");
        
        Telemetria result = engine.process(dto);
        
        assertNotNull(result);
        assertNotNull(result.getTimestamp()); // Should default to now()
    }
}
