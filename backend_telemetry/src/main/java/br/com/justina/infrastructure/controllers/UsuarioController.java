package br.com.justina.infrastructure.controller;

import br.com.justina.application.dto.LoginRequest;
import br.com.justina.application.dto.LoginResponse;
import br.com.justina.application.dto.RegisterRequest;
import br.com.justina.application.usecases.UsuarioService;
import br.com.justina.domain.model.Usuario;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody @Valid RegisterRequest request) {
        usuarioService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Usuário registrado com sucesso!");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        Usuario usuario = usuarioService.authenticate(request.email(), request.password());

        return ResponseEntity.ok(new LoginResponse(
                "MEU_TOKEN_DE_TESTE",
                usuario.getName(),
                usuario.getEmail(),
                usuario.getRole().name()
        ));
    }
}