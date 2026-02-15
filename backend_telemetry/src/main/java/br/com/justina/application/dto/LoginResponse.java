package br.com.justina.application.dto;

public record LoginResponse(
        String name,
        String email,
        String role
) {}
