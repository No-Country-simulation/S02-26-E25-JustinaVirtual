package br.com.justina.application.dto;

import br.com.justina.domain.model.training.QuestionType;
import java.util.List;

public record CreateQuestionRequest(
        QuestionType type,
        String text,
        List<String> options, // Lista de Strings
        Integer correctIndex,
        String hint,
        String topic,
        String mediaUrl
) {}