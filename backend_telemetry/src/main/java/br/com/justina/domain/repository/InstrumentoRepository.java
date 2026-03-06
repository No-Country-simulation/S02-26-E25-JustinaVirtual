package br.com.justina.domain.repository;

import br.com.justina.domain.model.Instrumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InstrumentoRepository extends JpaRepository<Instrumento, UUID> {
}