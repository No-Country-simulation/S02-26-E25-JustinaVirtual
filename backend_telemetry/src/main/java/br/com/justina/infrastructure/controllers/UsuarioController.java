package br.com.justina.infrastructure.controller;

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
    public ResponseEntity<Usuario> register(@RequestBody @Valid Usuario usuario) {
        // chama método em inglês do Service
        Usuario saved = usuarioService.register(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody @Valid LoginRequest request) {
        Usuario usuario = usuarioService.authenticate(request.email(), request.password());
        return ResponseEntity.ok("Login realizado com sucesso para: " + usuario.getName());
    }
}
