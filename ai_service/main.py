from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("justina-ai")

app = FastAPI(title="Justina AI Service", version="1.0.0")

@app.post("/analisar")
async def analisar_movimentos(request: Request):
    try:
        dados_lista = await request.json()
        
        # Log de recepção com contexto
        count = len(dados_lista)
        logger.info(f"Recebidos {count} registros para processamento.")

        if count > 0:
            # Extração segura dos dados
            telemetria = dados_lista[0]
            x = float(telemetria.get("eixoX", 0.0))
            y = float(telemetria.get("eixoY", 0.0))
            z = float(telemetria.get("eixoZ", 0.0))
            session_id = telemetria.get("sessionId", "N/A")

            # Cálculo de score (Lógica de Negócio)
            soma_eixos = abs(x) + abs(y) + abs(z)
            # Normalização: estabilidade perfeita = 1.0
            score = 1.0 - min(0.5, soma_eixos / 100.0) if soma_eixos > 0 else 1.0
            
            logger.info(f"Sessão: {session_id} | Score: {score:.4f} | Eixos: X={x}, Y={y}, Z={z}")
        else:
            score = 0.0
            logger.warning("Lote de telemetria vazio recebido.")

        # Determinação do status e recomendações profissionais
        is_stable = score > 0.7
        
        return {
            "status": "APROVADO" if is_stable else "ATENÇÃO",
            "mensagem": "Processamento de telemetria realizado com sucesso",
            "precisao": round(score, 4),
            "recomendacao": "Condições de movimento dentro dos parâmetros normais" if is_stable 
                            else "Alerta: Instabilidade detectada acima do limite de segurança"
        }

    except Exception as e:
        logger.error(f"Erro no processamento: {str(e)}")
        return {
            "status": "ERRO",
            "mensagem": f"Falha interna no motor de análise: {str(e)}",
            "precisao": 0.0,
            "recomendacao": "Reinicie a coleta de dados"
        }