package br.com.justina.domain.exceptions;

public class RegraCirurgiaException extends RuntimeException {
    
    private final String codigoErro;

    public RegraCirurgiaException(String mensagem) {
        super(mensagem);
        this.codigoErro = "REGRA_VIOLADA";
    }

    public RegraCirurgiaException(String mensagem, String codigoErro) {
        super(mensagem);
        this.codigoErro = codigoErro;
    }

    public String getCodigoErro() {
        return codigoErro;
    }
}
