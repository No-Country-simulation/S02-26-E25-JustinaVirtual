package br.com.justina;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableAsync; 

@SpringBootApplication
@ComponentScan(basePackages = "br.com.justina")
@EnableAsync 
public class JustinaApplication {

    public static void main(String[] args) {
        SpringApplication.run(JustinaApplication.class, args);
        System.out.println("--- Justina Backend iniciado com sucesso! ---");
    }
}