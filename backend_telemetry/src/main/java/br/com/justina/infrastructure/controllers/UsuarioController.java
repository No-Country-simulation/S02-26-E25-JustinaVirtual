package br.com.justina.infrastructure.controllers;

import br.com.justina.application.dto.*;
import br.com.justina.application.usecases.UsuarioService;
import br.com.justina.domain.model.Usuario;
import br.com.justina.domain.repository.UsuarioRepository;
import br.com.justina.infrastructure.security.TokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
@Tag(name = "Usuários", description = "Endpoints para autenticação e gestão de perfil")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final TokenService tokenService;
    private final UsuarioRepository usuarioRepository;

    @Operation(summary = "Cadastra um novo usuário", description = "Cria uma conta no sistema.")
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
                usuario.getId(),
                usuario.getName(),
                usuario.getEmail(),
                usuario.getRole().name()
        ));
    }

    @Operation(summary = "Obtém o perfil do usuário logado", description = "Retorna os dados do usuário a partir do Token JWT.")
    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> obterMeuPerfil() {
        var auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof UUID userId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return usuarioRepository.findById(userId)
                .map(usuario -> ResponseEntity.ok(new UsuarioResponseDTO(usuario)))
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Lista todos os usuários", description = "Endpoint administrativo para visualizar todos os cadastros.")
    @GetMapping
    public ResponseEntity<java.util.List<UsuarioResponseDTO>> listarTodos() {
        var usuarios = usuarioRepository.findAll()
                .stream()
                .map(UsuarioResponseDTO::new)
                .toList();
        return ResponseEntity.ok(usuarios);
    }

    @Operation(summary = "Busca usuário por ID", description = "Retorna os detalhes de um usuário específico via UUID.")
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> buscarPorId(@PathVariable UUID id) {
        return usuarioRepository.findById(id)
                .map(usuario -> ResponseEntity.ok(new UsuarioResponseDTO(usuario)))
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Atualiza o perfil do usuário logado", description = "Permite ao usuário alterar seu nome ou senha.")
    @PutMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> atualizarPerfil(@RequestBody UpdateUsuarioRequest request) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UUID userId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return usuarioRepository.findById(userId).map(usuario -> {
            if (request.name() != null && !request.name().isBlank()) {
                usuario.setName(request.name());
            }
            if (request.password() != null && !request.password().isBlank()) {
                usuario.setPassword(usuarioService.encodePassword(request.password()));
            }
            usuarioRepository.save(usuario);
            return ResponseEntity.ok(new UsuarioResponseDTO(usuario));
        }).orElse(ResponseEntity.notFound().build());
    }
}