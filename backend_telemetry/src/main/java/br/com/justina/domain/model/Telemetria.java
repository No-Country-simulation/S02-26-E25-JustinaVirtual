package br.com.justina.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Telemetria {
    
    private Double eixoX;
    private Double eixoY;
    private Double eixoZ;    
    private String tempo; 
    
    
}