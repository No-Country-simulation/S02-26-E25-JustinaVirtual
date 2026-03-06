package br.com.justina.domain.repository.training;

import br.com.justina.domain.model.training.TrainingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface TrainingSessionRepository extends JpaRepository<TrainingSession, UUID> {
    // Método extra para buscar histórico de um aluno específico
    List<TrainingSession> findByTraineeId(String traineeId);
}