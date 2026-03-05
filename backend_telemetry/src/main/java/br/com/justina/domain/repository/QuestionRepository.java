package br.com.justina.domain.repository;

import br.com.justina.domain.model.training.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface QuestionRepository extends JpaRepository<Question, UUID> {
}