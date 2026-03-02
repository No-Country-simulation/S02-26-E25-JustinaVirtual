package br.com.justina.domain.repository;

import br.com.justina.domain.model.Cirurgia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CirurgiaRepository extends JpaRepository<Cirurgia, UUID> {
    // Aqui podemos adicionar métodos de consulta personalizados se necessário, mas
    // o JpaRepository já oferece os métodos básicos como findAll(), findById(),
    // save(), etc.
}