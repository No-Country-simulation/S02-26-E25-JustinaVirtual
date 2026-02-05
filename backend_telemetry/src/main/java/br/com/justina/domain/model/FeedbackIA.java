package br.com.justina.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeedbackIA {
    private String status;
    private String mensagem;
    private Double precisao;
}