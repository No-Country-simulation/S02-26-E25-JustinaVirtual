from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import torch

from app.schemas.telemetry import (
    TelemetryPoint, 
    SessionStartRequest, 
    SessionCompleteRequest,
    DatasetStats
)
from app.services.data_collector import data_collector
from app.services.prediction_service import get_prediction_service

app = FastAPI(
    title="Justina AI Service",
    description="API de IA para análise e coleta de telemetria cirúrgica",
    version="1.0.0"
)

# Configurar CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== LEGACY ENDPOINTS (compatibilidade) =====

class TelemetryData(BaseModel):
    x: float
    y: float
    z: float
    timestamp: str
    sessionId: str

class AnalysisResponse(BaseModel):
    status: str
    feedback: str
    precision_score: float


@app.get("/")
def read_root():
    """Status e informações do serviço"""
    stats = data_collector.get_dataset_stats()
    return {
        "status": "online",
        "pytorch": torch.__version__,
        "dataset": stats
    }


@app.post("/analisar", response_model=AnalysisResponse)
async def analyze_movement(data: List[TelemetryData]):
    """[LEGACY] Análise básica de movimento (mock)"""
    if not data:
        raise HTTPException(status_code=400, detail="Sem dados")
    
    return AnalysisResponse(
        status="SUCCESS",
        feedback="Simulação capturada. IA processando trajetória...",
        precision_score=0.95
    )


# ===== DATA COLLECTION ENDPOINTS =====

@app.post("/sessions/start")
async def start_session(request: SessionStartRequest):
    """
    Inicia nova sessão de coleta
    """
    try:
        session_id = data_collector.start_session(
            user_id=request.user_id,
            skill_level=request.skill_level,
            procedure_type=request.procedure_type
        )
        return {
            "status": "success",
            "session_id": session_id,
            "message": "Sessão de coleta iniciada"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/sessions/{session_id}/telemetry")
async def add_telemetry(session_id: str, points: List[TelemetryPoint]):
    """
    Adiciona pontos de telemetria
    """
    try:
        data_collector.add_telemetry_batch(session_id, points)
        return {
            "status": "success",
            "points_received": len(points),
            "message": "Telemetria adicionada"
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/sessions/{session_id}/complete")
async def complete_session(session_id: str, request: SessionCompleteRequest):
    """
    Finaliza sessão e salva dataset
    
    Calcula métricas automaticamente e salva arquivo JSON
    """
    try:
        filepath = data_collector.complete_session(
            session_id=session_id,
            user_feedback=request.user_feedback,
            difficulty_rating=request.difficulty_rating
        )
        return {
            "status": "success",
            "session_id": session_id,
            "saved_to": str(filepath),
            "message": "Sessão finalizada e salva com sucesso"
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/dataset/stats", response_model=DatasetStats)
async def get_dataset_statistics():
    """
    Estatísticas do dataset coletado
    
    Útil para dashboard de progresso
    """
    stats = data_collector.get_dataset_stats()
    return stats


@app.get("/sessions/active")
async def get_active_sessions():
    """Lista sessões ativas (em coleta)"""
    active = list(data_collector.active_sessions.keys())
    return {
        "active_sessions": active,
        "count": len(active)
    }


# ===== AI PREDICTION ENDPOINTS =====

class PredictionRequest(BaseModel):
    """Request para predição de qualidade"""
    telemetry_data: List[TelemetryPoint]
    session_id: Optional[str] = None


class PredictionResponse(BaseModel):
    """Response com predição de smoothness"""
    smoothness_score: Optional[float]
    quality_level: Optional[str]
    num_points: int
    model_confidence: Optional[float]
    interpretation: Optional[str]
    error: Optional[str] = None


@app.post("/predict", response_model=PredictionResponse)
async def predict_quality(request: PredictionRequest):
    """Predição de qualidade cirúrgica"""
    try:
        # converter pontos pro formato esperado
        trajectory = []
        for point in request.telemetry_data:
            trajectory.append({
                "position": {
                    "x": point.position.x,
                    "y": point.position.y,
                    "z": point.position.z
                },
                "timestamp": point.timestamp
            })
        
        prediction_service = get_prediction_service()
        result = prediction_service.predict(trajectory)
        
        return PredictionResponse(**result)
        
    except Exception as e:
        return PredictionResponse(
            smoothness_score=None,
            quality_level=None,
            num_points=len(request.telemetry_data),
            model_confidence=None,
            interpretation=None,
            error=f"Erro na predição: {str(e)}"
        )


@app.post("/sessions/{session_id}/predict")
async def predict_active_session(session_id: str):
    """Predição em tempo real"""
    try:
        if session_id not in data_collector.active_sessions:
            raise HTTPException(
                status_code=404,
                detail=f"Sessão {session_id} não encontrada"
            )
        
        session = data_collector.active_sessions[session_id]
        telemetry = session.get("telemetry_data", [])
        
        if len(telemetry) < 2:
            return {
                "error": "Dados insuficientes (mínimo 2 pontos)",
                "num_points": len(telemetry),
                "message": "Continue movendo o instrumento..."
            }
        
        prediction_service = get_prediction_service()
        result = prediction_service.predict(telemetry)
        
        result["session_id"] = session_id
        result["session_duration"] = session.get("duration", 0)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/model/status")
async def get_model_status():
    """Status do modelo LSTM"""
    try:
        prediction_service = get_prediction_service()
        
        is_loaded = prediction_service.model is not None
        
        return {
            "loaded": is_loaded,
            "device": str(prediction_service.device),
            "stats": prediction_service.stats if is_loaded else {},
            "max_sequence_length": prediction_service.max_seq_len,
            "model_type": "LSTM" if is_loaded else None,
            "ready": is_loaded
        }
    except Exception as e:
        return {
            "loaded": False,
            "error": str(e)
        }
