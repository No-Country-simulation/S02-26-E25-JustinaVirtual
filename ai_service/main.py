
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import random

app = FastAPI()


class TelemetriaDTO(BaseModel):
    eixoX: float
    eixoY: float
    eixoZ: float
    tempo: Optional[str] = None

class FeedbackIADTO(BaseModel):
    status: str
    mensagem: str
    precisao: float

@app.post("/analisar", response_model=FeedbackIADTO)
def analisar_movimentos(movimentos: List[TelemetriaDTO]):
    print(f" PYTHON: Recebi {len(movimentos)} pontos de telemetria.")
    
    # --- AQUI ENTRARÁ O PYTORCH ---
    # Por enquanto, simulamos a inteligência:
    
    score = random.uniform(0.7, 1.0) # Simula uma precisão aleatória
    if score > 0.85:
        status = "APROVADO"
        msg = "Movimento suave e preciso."
    else:
        status = "ALERTA"
        msg = "Detectamos tremor excessivo."

    return {
        "status": status,
        "mensagem": msg,
        "precisao": round(score, 4)
    }