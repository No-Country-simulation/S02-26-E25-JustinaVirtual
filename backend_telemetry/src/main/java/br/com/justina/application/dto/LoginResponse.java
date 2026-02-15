package br.com.justina.application.dto;

public record LoginResponse(
        String token,
        String name,
        String email,
        String role
) {}
