package br.com.justina.application.dto;

import br.com.justina.domain.model.Role;
import br.com.justina.domain.model.Usuario;
import java.util.UUID;

public record UsuarioResponseDTO(UUID id, String name, String email, String role) {
    public UsuarioResponseDTO(Usuario usuario) {
        this(usuario.getId(), usuario.getName(), usuario.getEmail(), usuario.getRole().name());
    }
}