package br.com.justina.application.dto;

import br.com.justina.domain.model.training.Question;
import java.util.List; 
import java.util.UUID;

public record QuestionResponse(
        UUID id,
        String type,
        String text,
        List<String> options, 
        Integer correctIndex,
        String hint,
        String topic,
        String mediaUrl
) {
    public QuestionResponse(Question q) {
        this(
                q.getId(),
                q.getType().name(), // Converte o Enum para String
                q.getText(),
                q.getOptions(),     
                q.getCorrectIndex(),
                q.getHint(),
                q.getTopic(),
                q.getMediaUrl()
        );
    }
}