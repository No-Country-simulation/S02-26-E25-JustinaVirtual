package br.com.justina.application.usecases;

import br.com.justina.domain.model.Telemetria;
import br.com.justina.infrastructure.persistence.TelemetriaJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;


    @Service
    @RequiredArgsConstructor
    public class ConsultarTelemetriaUseCase {

        private final TelemetriaJpaRepository repository;

        public List<Telemetria> executar(UUID sessaoId) {
            return repository.findBySessaoIdOrderByTimestampAsc(sessaoId);
        }
    }

