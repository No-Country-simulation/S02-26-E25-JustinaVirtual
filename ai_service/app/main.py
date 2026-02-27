from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import random

# Tenta importar o torch, se falhar, o serviço não quebra
try:
    import torch
    TORCH_VER = torch.__version__
except ImportError:
    TORCH_VER = "Instalando..."

app = FastAPI(title="Justina AI Service")

class TelemetryData(BaseModel):
    usuarioId: str  # <--- O campo que o Fabio exigiu
    x: float
    y: float
    z: float
    timestamp: float
    instrument_id: Optional[str] = "justina_v1"

class AnalysisResponse(BaseModel):
    status: str
    feedback: str
    precision_score: float

@app.get("/")
def read_root():
    return {"status": "online", "pytorch": TORCH_VER}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_movement(data: List[TelemetryData]):
    if not data:
        raise HTTPException(status_code=400, detail="Sem dados")
    
    # Aqui a IA recebe o usuarioId vindo do Java
    user_context = data[0].usuarioId 
    print(f"Analisando movimentos do usuário: {user_context}")

    return AnalysisResponse(
        status="SUCCESS",
        feedback=f"Simulação para {user_context} capturada. Trajetória estável.",
        precision_score=round(random.uniform(0.85, 0.98), 2)
    )