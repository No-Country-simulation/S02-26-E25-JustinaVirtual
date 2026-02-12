# Justina Backend Telemetry

Este é o microsserviço de backend do projeto Justina, responsável pelo processamento de telemetria e integração com o serviço de Inteligência Artificial.

## 🚀 Tecnologias Utilizadas

- **Java 21**
- **Spring Boot 3.2.4**
- **Maven**
- **Spring Cloud OpenFeign** (para comunicação com o serviço de IA)
- **H2 Database** (banco em memória para desenvolvimento/testes)
- **PostgreSQL Driver** (preparado para produção)
- **Lombok**

## 🏗️ Arquitetura

O projeto segue a **Arquitetura Hexagonal (Ports and Adapters)** para garantir desacoplamento e testabilidade:

- **Application**: Contém os casos de uso (`usecases`) e portas (`ports`). É o coração da aplicação.
- **Domain**: Contém as entidades e modelos de domínio (`model`).
- **Infrastructure**: Contém as implementações das portas, como controladores REST (`controllers`), persistência (`persistence`) e clientes externos (`clients`).

## ⚙️ Configuração

As configurações principais estão no arquivo `src/main/resources/application.properties`:

- **Porta do Servidor**: `8081`
- **URL do Serviço de IA**: `http://localhost:5000`
- **Banco de Dados**: H2 em memória (console habilitado em `/h2-console`)

## 🏃‍♂️ Como Executar

### Pré-requisitos
- JDK 21 instalado
- Maven instalado

### Passos
1. Clone o repositório.
2. Navegue até a pasta `backend_telemetry`.
3. Execute o comando:

```bash
mvn spring-boot:run ou docker compose up --build
```

A aplicação estará disponível em `http://localhost:8081`.

## 🔌 API Endpoints

### Telemetria

- **POST** `/api/telemetria/analisar`
    - Recebe uma lista de dados de telemetria (movimentos).
    - Envia para o serviço de IA para análise.
    - Persiste os dados.
    - Retorna o feedback da IA.

    **Exemplo de Payload:**
    ```json
    [
      {
        "timestamp": "2024-02-05T10:00:00",
        "eixoX": 10.5,
        "eixoY": 20.0,
        "eixoZ": 5.0
      },
      {
        "timestamp": "2024-02-05T10:00:01",
        "eixoX": 11.0,
        "eixoY": 21.0,
        "eixoZ": 5.2
      }
    ]
    ```

## 🐳 Docker

O projeto possui um `Dockerfile` na raiz. Para construir e rodar com Docker:

```bash
docker build -t justina-backend .
docker run -p 8081:8081 justina-backend
```
