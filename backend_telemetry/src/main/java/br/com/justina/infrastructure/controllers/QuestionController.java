package br.com.justina.infrastructure.controllers;

import br.com.justina.application.dto.CreateQuestionRequest;
import br.com.justina.application.dto.QuestionResponse;
import br.com.justina.application.services.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/questions")
@RequiredArgsConstructor
@Tag(name = "Questions", description = "Gestão de perguntas do treinamento")
public class QuestionController {

    private final QuestionService service;

    @Operation(summary = "Criar pergunta (ADMIN)")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<QuestionResponse> create(@RequestBody CreateQuestionRequest request) {
        var question = service.create(request);
        return ResponseEntity.ok(new QuestionResponse(question));
    }

    @Operation(summary = "Listar perguntas (ADMIN e USER)")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping
    public ResponseEntity<List<QuestionResponse>> list() {
        var questions = service.findAll()
                .stream()
                .map(QuestionResponse::new)
                .toList();

        return ResponseEntity.ok(questions);
    }

    @Operation(summary = "Buscar pergunta por ID")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/{id}")
    public ResponseEntity<QuestionResponse> getById(@PathVariable UUID id) {
        var question = service.findById(id);
        return ResponseEntity.ok(new QuestionResponse(question));
    }
}