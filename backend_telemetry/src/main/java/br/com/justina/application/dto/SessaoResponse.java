package br.com.justina.application.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record SessaoResponse(
        UUID id,
        String status,
        LocalDateTime dataInicio,
        Double pontuacaoGeral,
        Integer totalErros,
        Long tempoTotalSegundos
) {}