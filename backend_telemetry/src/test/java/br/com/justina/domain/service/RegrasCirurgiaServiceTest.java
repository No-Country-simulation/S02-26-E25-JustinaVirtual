package br.com.justina.domain.service;

import br.com.justina.application.services.RegrasCirurgiaService;
import br.com.justina.domain.model.Cirurgia;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.StatusSessao;
import br.com.justina.domain.model.Telemetria;
import br.com.justina.domain.model.ZonaProibida;
import br.com.justina.infrastructure.exception.RegraCirurgiaException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RegrasCirurgiaServiceTest {

    private RegrasCirurgiaService regrasService;
    private SessaoSimulacao sessao;
    private Cirurgia cirurgia;

    @BeforeEach
    void setUp() {
        regrasService = new RegrasCirurgiaService();

        ZonaProibida veiaRenal = ZonaProibida.builder()
                .minX(10.0).maxX(20.0)
                .minY(10.0).maxY(20.0)
                .minZ(0.0).maxZ(5.0)
                .build();

        cirurgia = Cirurgia.builder()
                .tempoEstimadoSegundos(60) // Cirurgia deve durar 1 minuto
                .zonasProibidas(List.of("VEIA_RENAL:10.0:20.0:10.0:20.0:0.0:5.0"))
                .build();

        sessao = SessaoSimulacao.builder()
                .status(StatusSessao.EM_ANDAMENTO)
                .dataInicio(LocalDateTime.now().minusSeconds(30)) // Começou há 30 segundos
                .totalErros(0)
                .pontuacaoGeral(100.0)
                .cirurgia(cirurgia)
                .build();
    }

    @Test
    void devePassarSemErrosEmMovimentoSeguro() {
        Telemetria movimentoSeguro = Telemetria.builder()
                .eixoX(5.0).eixoY(5.0).eixoZ(1.0) // Fora da zona proibida
                .timestamp(LocalDateTime.now())
                .build();

        regrasService.analisarMovimento(movimentoSeguro, sessao);

        assertEquals(0, sessao.getTotalErros());
        assertEquals(100.0, sessao.getPontuacaoGeral());
    }

    @Test
    void deveRegistrarErroEPenalizarAoEntrarEmZonaProibida() {
        Telemetria movimentoFatal = Telemetria.builder()
                .eixoX(15.0).eixoY(15.0).eixoZ(2.0) // Exatamente DENTRO da zona proibida
                .timestamp(LocalDateTime.now())
                .build();

        regrasService.analisarMovimento(movimentoFatal, sessao);

        assertEquals(1, sessao.getTotalErros());
        assertEquals(95.0, sessao.getPontuacaoGeral()); // Perdeu 5 pontos
    }

    @Test
    void devePenalizarPorTempoExcedido() {
        // Simulando que o movimento ocorreu 70 segundos após o início (limite era 60)
        Telemetria movimentoAtrasado = Telemetria.builder()
                .eixoX(0.0).eixoY(0.0).eixoZ(0.0)
                .timestamp(sessao.getDataInicio().plusSeconds(70))
                .build();

        regrasService.analisarMovimento(movimentoAtrasado, sessao);

        // 10 segundos extras * 0.1 = 1 ponto de penalidade
        assertEquals(99.0, sessao.getPontuacaoGeral());
        assertEquals(0, sessao.getTotalErros()); // Não houve colisão, apenas atraso
    }

    @Test
    void deveLancarExcecaoSeSessaoFinalizada() {
        sessao.setStatus(StatusSessao.FINALIZADA);
        Telemetria movimento = Telemetria.builder().build();

        assertThrows(RegraCirurgiaException.class, () -> {
            regrasService.analisarMovimento(movimento, sessao);
        });
    }
}