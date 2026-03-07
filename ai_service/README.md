# Serviço de IA - Justina Virtual

## Funcionalidades

- **Coleta de Telemetria em Tempo Real**: Coleta dados de trajetória cirúrgica durante sessões de simulação
- **Avaliação de Qualidade Baseada em LSTM**: Modelo de deep learning analisa padrões de movimento
- **Persistência em PostgreSQL**: Armazenamento de dados de nível profissional no Render
- **API RESTful**: Endpoints completos para gerenciamento de sessões e predições
- **Cálculo Automático de Métricas**: Economia de movimento, suavidade, velocidade, detecção de tremor
- **Histórico de Sessões**: Dados históricos completos para acompanhamento da evolução do usuário

## Arquitetura

```
┌─────────────┐
│   Frontend  │ → React + Three.js
└──────┬──────┘
       │ HTTP/REST
       ↓
┌─────────────┐
│   FastAPI   │ → Python 3.11
└──────┬──────┘
       │
       ├─→ Modelo LSTM (PyTorch)
       ├─→ Coletor de Dados
       ├─→ Serviço de Predição
       └─→ PostgreSQL (Render)
```

## Stack Tecnológico

- **Framework**: FastAPI 0.110.0
- **Framework ML**: PyTorch 2.2.1
- **Banco de Dados**: PostgreSQL 14 (psycopg2-binary)
- **Servidor**: Uvicorn (ASGI)
- **Computação Numérica**: NumPy
- **Cloud**: Render.com

## Instalação

### Pré-requisitos

- Python 3.11+
- PostgreSQL (para produção)
- Ambiente virtual (recomendado)

### Configuração Local

```bash
# Navegar para o diretório ai_service
cd ai_service

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Executar servidor de desenvolvimento
uvicorn app.main:app --reload --port 8000
```

## Estrutura do Projeto

```
ai_service/
├── app/
│   ├── __init__.py
│   ├── main.py                    # Aplicação FastAPI e endpoints
│   ├── database.py                # Operações PostgreSQL
│   ├── models/
│   │   └── lstm_model.pt          # Pesos treinados da LSTM
│   ├── schemas/
│   │   ├── telemetry.py           # Modelos Pydantic
│   │   └── __init__.py
│   └── services/
│       ├── data_collector.py      # Gerenciamento de sessões e métricas
│       └── prediction_service.py  # Inferência LSTM
├── dataset/
│   └── collected_data/            # Sessões JSON locais (somente dev)
├── training/
│   ├── train_lstm.py              # Script de treinamento do modelo
│   ├── model.py                   # Arquitetura LSTM
│   ├── dataset_loader.py          # Pré-processamento de dados
│   └── prepare_dataset.py         # Preparação do dataset
├── requirements.txt
├── Dockerfile
└── README.md
```

## Documentação da API

### URL Base

- **Produção**: `https://s02-26-e25-justinavirtual.onrender.com`
- **Local**: `http://localhost:8000`

### Endpoints Principais

#### Gerenciamento de Sessões

**Iniciar Sessão**
```http
POST /sessions/start
Content-Type: application/json

{
  "procedure_type": "renal_surgery_3d",
  "user_id": "usuario@exemplo.com",
  "skill_level": "intermediário"
}

Resposta: 200 OK
{
  "session_id": "sess_8705fdcd_20260306_131551",
  "message": "Sessão iniciada"
}
```

**Adicionar Telemetria**
```http
POST /sessions/{session_id}/telemetry
Content-Type: application/json

{
  "points": [
    {
      "position": {"x": 40.97, "y": 27.31, "z": 40.97},
      "timestamp": 0.085,
      "instrument_id": "surgical_tool"
    }
  ]
}

Resposta: 200 OK
{
  "message": "224 pontos adicionados",
  "total_points": 224
}
```

**Completar Sessão**
```http
POST /sessions/{session_id}/complete
Content-Type: application/json

{
  "user_feedback": "Boa sessão de prática",
  "difficulty_rating": 3
}

Resposta: 200 OK
{
  "session_id": "sess_8705fdcd_20260306_131551",
  "duration": 27.443,
  "total_points": 95,
  "economy_of_motion": 845.32,
  "smoothness_score": 0.78,
  "avg_velocity": 440.15,
  "tremor_detected": false,
  "ai_prediction": {
    "quality_level": "excelente",
    "smoothness_score": -0.004923,
    "interpretation": "Movimento muito suave e controlado!",
    "model_confidence": 1.0,
    "num_points": 95
  }
}
```

#### Status do Modelo

**Verificar Modelo**
```http
GET /model/status

Resposta: 200 OK
{
  "loaded": true,
  "device": "cpu",
  "max_sequence_length": 1000,
  "ready": true
}
```

## Modelo LSTM

### Arquitetura

```python
class SurgicalLSTM(nn.Module):
    Entrada: Trajetória 3D (coordenadas x, y, z)
    ├─ Camada LSTM 1 (128 unidades ocultas)
    ├─ Camada LSTM 2 (128 unidades ocultas)
    ├─ Camada Densa (128 → saída)
    └─ Saída: Classificação de qualidade
```

**Parâmetros:**
- Tamanho de entrada: 3 (coordenadas x, y, z)
- Tamanho oculto: 128
- Número de camadas: 2
- Comprimento da sequência: Variável (até 1000 pontos)
- Saída: Nível de qualidade + score de suavidade

### Treinamento

O modelo é treinado em sessões de simulação cirúrgica com as seguintes características:
- Trajetórias de posição 3D (normalizadas)
- Informação de sequência temporal
- Rótulo: Avaliação de qualidade

**Script de treinamento:**
```bash
cd ai_service/training
python train_lstm.py
```

**Localização do modelo:** `app/models/lstm_model.pt`

### Inferência

O modelo fornece:
- **quality_level**: Classificação ('excelente', 'bom', 'médio', 'ruim')
- **smoothness_score**: Métrica numérica de suavidade
- **interpretation**: Feedback legível
- **model_confidence**: Confiança da predição (0.0-1.0)
- **num_points**: Pontos de dados analisados

## Métricas Explicadas

### Métricas Básicas (Calculadas)

**Economia de Movimento**
- Definição: Distância total percorrida pela ferramenta cirúrgica
- Unidade: Unidades da cena 3D
- Cálculo: Soma das distâncias euclidianas entre pontos consecutivos
- Interpretação: Menor é melhor (caminho mais eficiente)

**Velocidade Média**
- Definição: Velocidade média do movimento da ferramenta
- Unidade: Distância por segundo
- Cálculo: Média de (distância / diferença_tempo) para todos os segmentos
- Interpretação: Valores moderados indicam movimento controlado

**Detecção de Tremor**
- Definição: Detecção de oscilações involuntárias
- Algoritmo: Identifica mudanças de velocidade de alta frequência
- Limiar: >10% dos pontos com mudanças bruscas de velocidade
- Interpretação: Indicador booleano de estabilidade da mão

**Score de Suavidade (Básico)**
- Definição: Fluidez do movimento baseada no jerk
- Cálculo: 1 / (1 + desvio_padrão(jerk))
- Faixa: 0.0 a 1.0
- Interpretação: Maior é mais suave

### Métricas da IA (Preditas pela LSTM)

**Nível de Qualidade**
- Classificação pela rede neural
- Categorias: 'excelente', 'bom', 'médio', 'ruim'
- Baseada em padrões aprendidos dos dados de treinamento

**Score de Suavidade (IA)**
- Saída da rede neural
- Faixa: Valores negativos a positivos
- Valores negativos indicam movimento mais suave
- Mais refinado que o cálculo básico

**Interpretação**
- Feedback em linguagem natural
- Gerado com base no nível de qualidade
- Fornece orientação acionável

**Confiança do Modelo**
- Certeza da predição
- Faixa: 0.0 (0%) a 1.0 (100%)
- Baseada no número de pontos de dados disponíveis

## Desenvolvimento

### Executando Testes

```bash
# Teste básico de endpoints
pytest tests/

# Testes manuais
python -m pytest -v
```

### Adicionando Novos Endpoints

1. Definir schemas Pydantic em `app/schemas/`
2. Adicionar endpoint em `app/main.py`

### Retreinando o Modelo

```bash
cd training

# Preparar dataset
python prepare_dataset.py

# Treinar modelo
python train_lstm.py

# Modelo salvo em: app/models/lstm_model.pt
```

## Considerações de Desempenho

**Consultas ao Banco de Dados:**
- Indexado em `user_id` para recuperação rápida de sessões do usuário
- JSONB para schema flexível sem migrações

**Inferência do Modelo:**
- Executa em CPU (otimizado para produção)
- Tempo médio de inferência: <100ms para 200 pontos
- Comprimento máximo de sequência: 1000 pontos

**Caching:**
- Cache de bytecode Python desabilitado em produção
- Modelo carregado uma vez na inicialização (padrão singleton)

## Solução de Problemas

**Modelo não carrega:**
- Verificar se `app/models/lstm_model.pt` existe
- Verificar instalação do PyTorch
- Checar logs para erros de carregamento

**Problemas de conexão ao banco:**
- Verificar variável de ambiente `DATABASE_URL`
- Checar status do serviço PostgreSQL no Render
- Garantir que a string de conexão interna está sendo usada

**Erros de importação:**
- Limpar diretórios `__pycache__`
- Reiniciar serviço
- Verificar compatibilidade da versão do Python

---

**Última Atualização:** 6 de março de 2026  
**Versão:** 1.0.0  
**Status:** Produção
