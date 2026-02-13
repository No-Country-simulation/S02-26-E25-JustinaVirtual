package br.com.justina.infrastructure.controller;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "E-mail obrigatório") @Email String email,
        @NotBlank(message = "Senha obrigatória") String password
) {}