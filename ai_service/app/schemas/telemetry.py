"""Schemas para telemetria e coleta de dados"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class Position3D(BaseModel):
    """Posição 3D de um instrumento"""
    x: float = Field(..., description="Coordenada X")
    y: float = Field(..., description="Coordenada Y")
    z: float = Field(..., description="Coordenada Z")


class TelemetryPoint(BaseModel):
    """Um ponto de telemetria em um instante"""
    timestamp: float = Field(..., description="Tempo em segundos desde início")
    position: Position3D
    instrument_id: str = Field(..., description="ID do instrumento (left/right)")
    velocity: Optional[float] = Field(None, description="Velocidade calculada")
    

class TrainingSession(BaseModel):
    """Sessão completa de treinamento"""
    session_id: str = Field(..., description="ID único da sessão")
    user_id: str = Field(..., description="ID do usuário/cirurgião")
    skill_level: Optional[str] = Field(None, description="expert, intermediate, novice")
    procedure_type: str = Field(default="suture", description="Tipo de procedimento")
    start_time: datetime = Field(default_factory=datetime.now)
    duration: Optional[float] = Field(None, description="Duração em segundos")
    telemetry_data: List[TelemetryPoint] = Field(default_factory=list)
    
    # Métricas calculadas automaticamente
    economy_of_motion: Optional[float] = None
    smoothness_score: Optional[float] = None
    avg_velocity: Optional[float] = None
    tremor_detected: Optional[bool] = None
    
    # Feedback do usuário
    user_feedback: Optional[str] = None
    difficulty_rating: Optional[int] = Field(None, ge=1, le=5)


class SessionStartRequest(BaseModel):
    """Iniciar nova sessão de coleta"""
    user_id: str
    skill_level: Optional[str] = None
    procedure_type: str = "suture"


class SessionCompleteRequest(BaseModel):
    """Finalizar sessão e salvar dados"""
    session_id: str
    user_feedback: Optional[str] = None
    difficulty_rating: Optional[int] = Field(None, ge=1, le=5)


class DatasetStats(BaseModel):
    """Estatísticas do dataset coletado"""
    total_sessions: int
    total_points: int
    users: List[str]
    skill_distribution: dict
    avg_session_duration: float
    date_range: dict
