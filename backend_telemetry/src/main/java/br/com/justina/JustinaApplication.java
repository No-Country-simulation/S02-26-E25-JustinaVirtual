package br.com.justina;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "br.com.justina")
public class JustinaApplication {

    public static void main(String[] args) {
        SpringApplication.run(JustinaApplication.class, args);
        System.out.println("--- Justina Backend iniciado com sucesso! ---");
    }
}