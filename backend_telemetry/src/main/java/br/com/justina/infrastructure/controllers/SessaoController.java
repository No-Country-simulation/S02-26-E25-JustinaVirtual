package br.com.justina.infrastructure.controllers;

import br.com.justina.application.dto.FinalizarSessaoRequest;
import br.com.justina.application.dto.SessaoResponse;
import br.com.justina.application.usecases.AbrirSessaoUseCase;
import br.com.justina.application.usecases.FinalizarSessaoUseCase;
import br.com.justina.application.usecases.ListarHistoricoUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessoes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SessaoController {

    private final AbrirSessaoUseCase abrirSessaoUseCase;
    private final FinalizarSessaoUseCase finalizarSessaoUseCase;
    private final ListarHistoricoUseCase listarHistoricoUseCase;

    @PostMapping("/iniciar")
    public ResponseEntity<SessaoResponse> iniciarSessao() {
        SessaoResponse response = abrirSessaoUseCase.executar();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}/finalizar")
    public ResponseEntity<SessaoResponse> finalizar(
            @PathVariable UUID id,
            @RequestBody @Valid FinalizarSessaoRequest request
    ) {
        return ResponseEntity.ok(finalizarSessaoUseCase.executar(id, request));
    }

    @GetMapping("/historico")
    public ResponseEntity<List<SessaoResponse>> obterHistorico() {
        return ResponseEntity.ok(listarHistoricoUseCase.executar());
    }
}