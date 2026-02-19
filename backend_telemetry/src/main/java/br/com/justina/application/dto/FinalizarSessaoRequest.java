package br.com.justina.application.dto;

import jakarta.validation.constraints.NotNull;

public record FinalizarSessaoRequest(
        @NotNull(message = "O total de erros é obrigatório")
        Integer totalErros,

        @NotNull(message = "A pontuação geral é obrigatória")
        Double pontuacaoGeral
) {}