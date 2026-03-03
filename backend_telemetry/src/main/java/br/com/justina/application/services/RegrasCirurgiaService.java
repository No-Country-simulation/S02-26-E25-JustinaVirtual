package br.com.justina.application.services;

import br.com.justina.domain.model.Cirurgia;
import br.com.justina.domain.model.SessaoSimulacao;
import br.com.justina.domain.model.Telemetria;
import br.com.justina.infrastructure.exception.RegraCirurgiaException;

import org.springframework.stereotype.Service;
import java.time.Duration;

@Service
public class RegrasCirurgiaService {

    public void analisarMovimento(Telemetria telemetria, SessaoSimulacao sessao) {
        if (sessao.isFinalizada()) {
            throw new RegraCirurgiaException("Sessão finalizada.");
        }

        Cirurgia cirurgia = sessao.getCirurgia();
        if (cirurgia == null) return;

        verificarColisaoAnatomica(telemetria, sessao, cirurgia);
        verificarTempoExcedido(telemetria, sessao, cirurgia);
    }

    private void verificarColisaoAnatomica(Telemetria telemetria, SessaoSimulacao sessao, Cirurgia cirurgia) {
        if (cirurgia.getZonasProibidas() == null) return;

        for (String zonaRaw : cirurgia.getZonasProibidas()) {
            try {
                // Formato esperado no banco: "NOME:minX:maxX:minY:maxY:minZ:maxZ"
                String[] partes = zonaRaw.split(":");
                if (partes.length < 7) continue;

                double minX = Double.parseDouble(partes[1]);
                double maxX = Double.parseDouble(partes[2]);
                double minY = Double.parseDouble(partes[3]);
                double maxY = Double.parseDouble(partes[4]);
                double minZ = Double.parseDouble(partes[5]);
                double maxZ = Double.parseDouble(partes[6]);

                if (estaDentroDosLimites(telemetria, minX, maxX, minY, maxY, minZ, maxZ)) {
                    registrarErroColisao(sessao);
                    break;
                }
            } catch (Exception e) {
                // Se a string não estiver no formato com coordenadas, ignora
                continue;
            }
        }
    }

    private boolean estaDentroDosLimites(Telemetria t, double minX, double maxX, double minY, double maxY, double minZ, double maxZ) {
        return (t.getEixoX() >= minX && t.getEixoX() <= maxX) &&
                (t.getEixoY() >= minY && t.getEixoY() <= maxY) &&
                (t.getEixoZ() >= minZ && t.getEixoZ() <= maxZ);
    }

    private void registrarErroColisao(SessaoSimulacao sessao) {
        int errosAtuais = sessao.getTotalErros() == null ? 0 : sessao.getTotalErros();
        sessao.setTotalErros(errosAtuais + 1);
        reduzirPontuacao(sessao, 5.0);
    }

    private void reduzirPontuacao(SessaoSimulacao sessao, double valorPenalidade) {
        double pontuacaoAtual = sessao.getPontuacaoGeral() == null ? 100.0 : sessao.getPontuacaoGeral();
        sessao.setPontuacaoGeral(Math.max(0.0, pontuacaoAtual - valorPenalidade));
    }

    private void verificarTempoExcedido(Telemetria telemetria, SessaoSimulacao sessao, Cirurgia cirurgia) {
        if (cirurgia.getTempoEstimadoSegundos() == null || sessao.getDataInicio() == null) return;
        long tempoDecorrido = Duration.between(sessao.getDataInicio(), telemetria.getTimestamp()).getSeconds();

        if (tempoDecorrido > cirurgia.getTempoEstimadoSegundos()) {
            long segundosExtras = tempoDecorrido - cirurgia.getTempoEstimadoSegundos();
            reduzirPontuacao(sessao, segundosExtras * 0.1);
        }
    }
}