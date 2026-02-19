package br.com.justina.infrastructure.controllers;

import br.com.justina.application.dto.FinalizarSessaoRequest;
import br.com.justina.application.dto.SessaoResponse;
import br.com.justina.application.usecases.AbrirSessaoUseCase;
import br.com.justina.application.usecases.FinalizarSessaoUseCase;
import br.com.justina.application.usecases.ListarHistoricoUseCase;
import br.com.justina.application.usecases.ObterEvolucaoUseCase;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/sessoes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SessaoController {

    private final AbrirSessaoUseCase abrirSessaoUseCase;
    private final FinalizarSessaoUseCase finalizarSessaoUseCase;
    private final ListarHistoricoUseCase listarHistoricoUseCase;
    private final ObterEvolucaoUseCase obterEvolucaoUseCase;

    @Operation(summary = "Inicia uma nova sessão", description = "Cria uma sessão vinculada ao usuário logado se não houver outra em andamento.")
    @PostMapping("/iniciar")
    public ResponseEntity<SessaoResponse> iniciarSessao() {
        SessaoResponse response = abrirSessaoUseCase.executar();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Finaliza uma sessão ativa", description = "Calcula o tempo total, salva erros e pontuação, mudando o status para FINALIZADA.")
    @PatchMapping("/{id}/finalizar")
    public ResponseEntity<SessaoResponse> finalizar(
            @PathVariable UUID id,
            @RequestBody @Valid FinalizarSessaoRequest request
    ) {
        return ResponseEntity.ok(finalizarSessaoUseCase.executar(id, request));
    }

    @Operation(summary = "Histórico de sessões", description = "Retorna todas as sessões do usuário logado, da mais recente para a mais antiga.")
    @GetMapping("/historico")
    public ResponseEntity<List<SessaoResponse>> obterHistorico() {
        return ResponseEntity.ok(listarHistoricoUseCase.executar());
    }

    @Operation(summary = "Dados de evolução", description = "Retorna sessões finalizadas em ordem cronológica para montagem de gráficos de desempenho.")
    @GetMapping("/evolucao")
    public ResponseEntity<List<SessaoResponse>> obterEvolucao() {
        return ResponseEntity.ok(obterEvolucaoUseCase.executar());
    }
}