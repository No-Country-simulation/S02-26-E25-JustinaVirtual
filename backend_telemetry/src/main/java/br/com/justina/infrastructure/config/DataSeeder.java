package br.com.justina.infrastructure.config;

import br.com.justina.domain.model.Cirurgia;
import br.com.justina.domain.model.ZonaProibida;
import br.com.justina.domain.repository.CirurgiaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CirurgiaRepository cirurgiaRepository;

    @Override
    public void run(String... args) throws Exception {
        if (cirurgiaRepository.count() == 0) {
            log.info("Banco vazio. Semeando dados iniciais de Cirurgia...");

            // Criamos a zona de colisão (ex: a veia principal do rim)
            ZonaProibida zonaPerigosa = ZonaProibida.builder()
                    .minX(200.0).maxX(600.0)
                    .minY(100.0).maxY(250.0) // Coordenadas aproximadas baseadas no seu Canvas!
                    .minZ(-50.0).maxZ(50.0)
                    .build();

            // Cadastramos a cirurgia padrão
            Cirurgia cirurgia = Cirurgia.builder()
                    .nomeProcedimento("Nefrectomia Parcial (Simulação Base)")
                    .nivelDificuldade("TREINAMENTO")
                    .dataCriacao(LocalDateTime.now())
                    .tempoEstimadoSegundos(120) // 2 minutos para terminar
                    .zonasProibidas(List.of("Coração", "Pulmão"))
                    .build();

            cirurgiaRepository.save(cirurgia);
            log.info("Cirurgia base cadastrada com sucesso!");
        }
    }
}