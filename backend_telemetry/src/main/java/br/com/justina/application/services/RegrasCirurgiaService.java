package br.com.justina.application.services;

import br.com.justina.domain.exception.RegraCirurgiaException;
import br.com.justina.domain.model.Cirurgia;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.Telemetria;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class RegrasCirurgiaService {

    public void analisarMovimento(Telemetria telemetria, SessaoSimulacao sessao) {
        if (sessao.isFinalizada()) {
            throw new RegraCirurgiaException("Não é possível registrar telemetria: a sessão já foi finalizada.");
        }

        Cirurgia cirurgia = sessao.getCirurgia();
        if (cirurgia == null) {
            throw new RegraCirurgiaException("Sessão inválida: Cirurgia não vinculada.");
        }

        verificarColisaoAnatomica(telemetria, sessao, cirurgia);
        verificarTempoExcedido(telemetria, sessao, cirurgia);
    }

    private void verificarColisaoAnatomica(Telemetria telemetria, SessaoSimulacao sessao, Cirurgia cirurgia) {
        if (cirurgia.getZonasProibidas() == null || cirurgia.getZonasProibidas().isEmpty()) {
            return;
        }

        boolean houveColisao = cirurgia.getZonasProibidas().stream()
                .anyMatch(zona -> zona.contem(telemetria.getEixoX(), telemetria.getEixoY(), telemetria.getEixoZ()));

        if (houveColisao) {
            int errosAtuais = sessao.getTotalErros() == null ? 0 : sessao.getTotalErros();
            sessao.setTotalErros(errosAtuais + 1);

            // Penalidade de colisão: perde 5 pontos a cada erro grave
            reduzirPontuacao(sessao, 5.0);
        }
    }

    private void verificarTempoExcedido(Telemetria telemetria, SessaoSimulacao sessao, Cirurgia cirurgia) {
        if (cirurgia.getTempoEstimadoSegundos() == null || sessao.getDataInicio() == null) {
            return;
        }

        long tempoDecorrido = Duration.between(sessao.getDataInicio(), telemetria.getTimestamp()).getSeconds();

        // Se passou do tempo estimado, penaliza
        if (tempoDecorrido > cirurgia.getTempoEstimadoSegundos()) {
            long segundosExtras = tempoDecorrido - cirurgia.getTempoEstimadoSegundos();

            // Penalidade de tempo: perde 0.1 ponto por cada segundo extra
            double penalidadeTempo = segundosExtras * 0.1;
            reduzirPontuacao(sessao, penalidadeTempo);
        }
    }

    private void reduzirPontuacao(SessaoSimulacao sessao, double valorPenalidade) {
        double pontuacaoAtual = sessao.getPontuacaoGeral() == null ? 100.0 : sessao.getPontuacaoGeral();
        sessao.setPontuacaoGeral(Math.max(0.0, pontuacaoAtual - valorPenalidade));
    }
}