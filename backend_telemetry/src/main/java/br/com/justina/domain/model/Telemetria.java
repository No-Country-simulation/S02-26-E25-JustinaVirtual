package br.com.justina.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Telemetria {
    private Double x;
    private Double y;
    private Double z;
    private Long timestamp;
    private String idInstrumento;
}