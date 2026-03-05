package br.com.justina.application.dto;

import br.com.justina.domain.model.training.QuestionType;

public record CreateQuestionRequest(
        QuestionType type,
        String text,
        String options, // JSON string
        Integer correctIndex,
        String hint,
        String topic,
        String mediaUrl
) {}