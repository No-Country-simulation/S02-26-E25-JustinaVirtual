package br.com.justina.infrastructure.controllers;

import br.com.justina.application.dto.SessaoResponse;
import br.com.justina.application.usecases.AbrirSessaoUseCase;
import br.com.justina.application.usecases.FinalizarSessaoUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessoes")
@RequiredArgsConstructor
public class SessaoController {

    private final AbrirSessaoUseCase abrirSessaoUseCase;

    @PostMapping("/iniciar")
    public ResponseEntity<SessaoResponse> iniciarSessao() {
        SessaoResponse response = abrirSessaoUseCase.executar();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private final FinalizarSessaoUseCase finalizarSessaoUseCase;

    @PutMapping("/{id}/finalizar")
    public ResponseEntity<SessaoResponse> finalizarSessao(@PathVariable UUID id) {
        SessaoResponse response = finalizarSessaoUseCase.executar(id);
        return ResponseEntity.ok(response);
    }
}