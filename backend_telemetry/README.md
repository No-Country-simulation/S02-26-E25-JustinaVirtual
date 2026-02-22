# Justina Backend Telemetry

Microsserviço responsável pelo processamento de telemetria da plataforma **Justina**, integrando simulação cirúrgica, métricas de desempenho e análise via Inteligência Artificial.

Este serviço é parte da fase inicial do projeto, cujo objetivo é validar decisões de design, UX e integração humano–sistema antes da construção de hardware físico. O backend atua como núcleo de ingestão, validação, persistência e orquestração da análise de dados de simulação.

---

## Arquitetura Geral

A plataforma é composta por:

- Frontend (Simulador Web)
- Backend Telemetry (este serviço)
- AI Service (análise de métricas)

Frontend disponível em:
https://s02-26-e25-justina-virtual.vercel.app/

---

## Stack

- Java 21  
- Spring Boot 3.2.4  
- Spring Data JPA  
- Spring Security  
- Spring Cloud OpenFeign  
- Jakarta Validation  
- SpringDoc OpenAPI (Swagger)  
- PostgreSQL (produção)  
- H2 (desenvolvimento)  
- Docker / Docker Compose  
- Maven  

---

## Arquitetura

O projeto segue **Arquitetura Hexagonal (Ports and Adapters)**:

- **Domain** → Entidades e regras de negócio  
- **Application** → Casos de uso e portas (interfaces)  
- **Infrastructure** → Controllers REST, persistência (JPA) e integrações externas  

Essa estrutura mantém o domínio desacoplado de frameworks e facilita evolução e testabilidade.

---

## Configuração

### Porta e Context Path
```bash
- Porta padrão: `8081`  
- Context path: `/api`  
```
Base URL:
```bash
http://localhost:8081/api
```
---

### Banco de Dados

Gerenciado via Spring Data JPA.

#### Desenvolvimento
- H2 em memória (opcional)

#### Produção
PostgreSQL configurado via variáveis de ambiente:
```bash
- DB_URL  
- DB_USER  
- DB_PASSWORD  
```
Exemplo:
```bash
spring.datasource.url=${DB_URL}  
spring.datasource.username=${DB_USER}  
spring.datasource.password=${DB_PASSWORD}
```
---

### Integração com IA

Comunicação via OpenFeign.

Propriedade:
```bash
app.ai-service.url=${AI_SERVICE_URL}
```
Em ambiente Docker:
```bash
AI_SERVICE_URL=http://ai-service:8000
```
---

## Segurança

Spring Security configurado para permitir ingestão automatizada.

Endpoints sob:
```bash
/api/telemetria/**
```
estão liberados (permitAll) para permitir envio direto de dados pelo simulador, sem autenticação JWT.

---

## Endpoint Principal

### POST /api/telemetria/movimentos

Recebe um batch de movimentos simulados para processamento e análise.

### Exemplo de Payload
```bash
[
  {
    "x": 10.5,
    "y": 20.0,
    "z": 50.2,
    "rotation": 0.0,
    "eventId": "evt-001",
    "timestamp": "2026-02-22T01:00:00Z",
    "sessionId": "65a5c427-4d1b-4782-828d-50b209ee38bb"
  }
]
```
### Regras de Validação

- x: obrigatório, entre -100 e 100  
- y: obrigatório, entre -100 e 100  
- z: obrigatório, deve ser positivo  
- timestamp: obrigatório (ISO-8601)  
- sessionId: obrigatório  

---

## Fluxo de Processamento

1. Recebimento via Controller  
2. Validação com Jakarta Validation  
3. Processamento via TelemetryEngine  
4. Persistência no banco  
5. Envio síncrono ao serviço de IA para geração de score/feedback  

---

## Documentação da API

Swagger disponível em:
```bash
http://localhost:8081/api/swagger-ui.html
```
---

## Execução

### Docker
```bash
docker compose up --build
```
### Maven
```bash
mvn spring-boot:run
```
---

## Estrutura de Pacotes
```bash
br.com.justina  
├── domain  
├── application  
└── infrastructure  
```
---

