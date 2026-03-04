package br.com.justina.application.dto;

import br.com.justina.domain.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(

        @NotBlank String name,
        @Email @NotBlank String email,
        @NotBlank String password,
        Role role,
        String crm

) {}
