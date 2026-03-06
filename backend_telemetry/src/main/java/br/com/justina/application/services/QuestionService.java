package br.com.justina.application.services;

import br.com.justina.application.dto.CreateQuestionRequest;
import br.com.justina.domain.model.training.Question;
import br.com.justina.domain.repository.training.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository repository;

    public Question create(CreateQuestionRequest request) {
        Question question = new Question();
        question.setType(request.type());
        question.setText(request.text());
        
        // Agora isso funciona, pois request.options() retorna List<String>
        question.setOptions(request.options()); 
        
        question.setCorrectIndex(request.correctIndex());
        question.setHint(request.hint());
        question.setTopic(request.topic());
        question.setMediaUrl(request.mediaUrl());

        return repository.save(question);
    }

    public List<Question> findAll() {
        return repository.findAll();
    }

    public Question findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pergunta não encontrada"));
    }
}