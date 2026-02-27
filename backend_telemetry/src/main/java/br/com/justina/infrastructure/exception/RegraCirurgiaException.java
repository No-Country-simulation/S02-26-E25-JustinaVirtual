package br.com.justina.infrastructure.exception;

public class RegraCirurgiaException extends RuntimeException {

    public RegraCirurgiaException(String mensagem) {
        super(mensagem);
    }

    public RegraCirurgiaException(String mensagem, Throwable causa) {
        super(mensagem, causa);
    }
}