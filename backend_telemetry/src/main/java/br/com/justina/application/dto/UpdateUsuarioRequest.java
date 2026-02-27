package br.com.justina.application.dto;

import java.util.Optional;

public record UpdateUsuarioRequest(
        String name,
        String password
) {}