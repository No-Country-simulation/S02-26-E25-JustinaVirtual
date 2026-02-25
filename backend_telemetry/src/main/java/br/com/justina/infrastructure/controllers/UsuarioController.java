package br.com.justina.infrastructure.controllers;

import br.com.justina.application.dto.LoginRequest;
import br.com.justina.application.dto.LoginResponse;
import br.com.justina.application.dto.RegisterRequest;
import br.com.justina.application.usecases.UsuarioService;
import br.com.justina.domain.model.Usuario;
import br.com.justina.infrastructure.security.TokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Usuários", description = "Endpoints para autenticação e gestão de perfil")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final TokenService tokenService;

    @Operation(summary = "Cadastra um novo médico", description = "Cria uma conta no sistema. O CRM deve ser único.")
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody @Valid RegisterRequest request) {
        usuarioService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Usuário registrado com sucesso!");
    }

    @Operation(summary = "Realiza o login", description = "Autentica o usuário e devolve o token JWT.")
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        Usuario usuario = usuarioService.authenticate(request.email(), request.password());

        String tokenReal = tokenService.gerarToken(usuario);

        return ResponseEntity.ok(new LoginResponse(
                tokenReal,
                usuario.getName(),
                usuario.getEmail(),
                usuario.getRole().name()
        ));
    }
}