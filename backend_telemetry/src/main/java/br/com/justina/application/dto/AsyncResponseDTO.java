package br.com.justina.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AsyncResponseDTO {
    private UUID sessaoId;
    private String status;   
    private String mensagem; 
}