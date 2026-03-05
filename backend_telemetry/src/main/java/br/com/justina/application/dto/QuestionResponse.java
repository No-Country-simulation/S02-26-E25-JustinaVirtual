package br.com.justina.application.dto;

import br.com.justina.domain.model.training.Question;

import java.util.UUID;

public record QuestionResponse(
        UUID id,
        String type,
        String text,
        String options,
        Integer correctIndex,
        String hint,
        String topic,
        String mediaUrl
) {
    public QuestionResponse(Question q) {
        this(
                q.getId(),
                q.getType().name(),
                q.getText(),
                q.getOptions(),
                q.getCorrectIndex(),
                q.getHint(),
                q.getTopic(),
                q.getMediaUrl()
        );
    }
}