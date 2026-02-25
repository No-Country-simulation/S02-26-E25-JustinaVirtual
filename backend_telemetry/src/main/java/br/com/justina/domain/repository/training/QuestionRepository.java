package br.com.justina.domain.repository.training;
import br.com.justina.domain.model.training.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {}