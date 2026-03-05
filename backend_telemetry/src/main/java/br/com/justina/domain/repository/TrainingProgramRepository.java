package br.com.justina.domain.repository;

import br.com.justina.domain.model.training.TrainingProgram;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TrainingProgramRepository extends JpaRepository<TrainingProgram, UUID> {
}