package br.com.justina.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class AsyncResponseDTO {
    private UUID sessaoId;
    private String status;   
    private String mensagem; 
}