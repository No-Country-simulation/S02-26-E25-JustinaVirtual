package br.com.justina.domain.repository;

import br.com.justina.domain.model.training.ProgramQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProgramQuestionRepository extends JpaRepository<ProgramQuestion, UUID> {

    List<ProgramQuestion> findByProgramIdOrderByOrderIndexAsc(UUID programId);
}