FROM python:3.11-slim

WORKDIR /app

# Instala ferramentas essenciais
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# Copia as dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o conteúdo da pasta ai_service para dentro de /app no container
COPY . .

ENV PYTHONPATH=/app

# Expõe a porta do FastAPI
EXPOSE 8000

# Comando ajustado para encontrar o arquivo main dentro da pasta app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]