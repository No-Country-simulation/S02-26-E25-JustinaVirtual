# 📄 Contrato de Integração - API Justina

Este documento define como o **Frontend (Simulador/Interface)** deve se comunicar com o **Backend (Java)**.

## 📡 Informações Gerais
*   **Base URL (Local):** `http://localhost:8081`
*   **Protocolo:** HTTP REST
*   **Formato de Dados:** JSON (`application/json`)

---

## 🚀 Endpoint: Analisar Movimento
Envia uma sequência de coordenadas capturadas durante o movimento cirúrgico para análise da Inteligência Artificial.

*   **Rota:** `/api/telemetria/analisar`
*   **Método:** `POST`

### 📥 Requisição (O que o Frontend envia)
O corpo da requisição deve ser uma **Lista (Array)** de objetos de telemetria.

**Exemplo de JSON:**
```json
[
  {
    "eixoX": 10.5,
    "eixoY": 20.1,
    "eixoZ": -0.5,
    "tempo": "2026-02-10T19:30:00Z"
  },
  {
    "eixoX": 10.6,
    "eixoY": 20.2,
    "eixoZ": -0.5,
    "tempo": "2026-02-10T19:30:01Z"
  }
]