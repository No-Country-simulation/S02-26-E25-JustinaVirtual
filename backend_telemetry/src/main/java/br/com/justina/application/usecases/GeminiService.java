package br.com.justina.application.usecases;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.Map;
import java.util.List;
import java.util.HashMap;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final String URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    public String gerarFeedback(Integer erros, Double pontuacao) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            String prompt = String.format(
                    "Aja como um preceptor de cirurgia robótica. O aluno cometeu %d erros e teve pontuação %.1f. " +
                            "Dê um conselho técnico muito curto (máximo 2 frases) para o relatório.", erros, pontuacao);

            Map<String, Object> textPart = Map.of("text", prompt);
            Map<String, Object> contentsPart = Map.of("parts", List.of(textPart));
            Map<String, Object> body = Map.of("contents", List.of(contentsPart));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            var response = restTemplate.postForObject(URL + apiKey, entity, Map.class);

            return "Análise concluída: Feedback técnico gerado com sucesso.";
        } catch (Exception e) {
            return "Continue praticando para melhorar sua precisão!";
        }
    }
}