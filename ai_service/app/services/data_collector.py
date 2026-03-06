"""
Sistema de coleta de dados de telemetria
Salva sessões de treinamento para criar dataset
"""

import json
import uuid
import os
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional
import importlib
import sys

from app.schemas.telemetry import TrainingSession, TelemetryPoint
import numpy as np

# Importa database apenas se necessário
try:
    import app.database as database_module
    # FORCE RELOAD: Invalida cache
    if 'app.database' in sys.modules:
        database_module = importlib.reload(database_module)
    
    IS_PRODUCTION = database_module.IS_PRODUCTION
    save_session_to_db = database_module.save_session_to_db
except ImportError as e:
    print(f"[DATA COLLECTOR] Erro ao importar database: {e}")
    IS_PRODUCTION = False
    save_session_to_db = None


class DataCollector:
    """Gerencia coleta de dados"""
    
    def __init__(self, data_dir: str = "dataset/collected_data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        self.active_sessions: Dict[str, TrainingSession] = {}
    
    def start_session(
        self, 
        user_id: str, 
        skill_level: Optional[str] = None,
        procedure_type: str = "suture"
    ) -> str:
        """Inicia nova sessão"""
        session_id = f"sess_{uuid.uuid4().hex[:8]}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        session = TrainingSession(
            session_id=session_id,
            user_id=user_id,
            skill_level=skill_level,
            procedure_type=procedure_type,
            start_time=datetime.now(),
            telemetry_data=[]
        )
        
        self.active_sessions[session_id] = session
        
        return session_id
    
    def add_telemetry_point(self, session_id: str, point: TelemetryPoint):
        """Adiciona ponto de telemetria"""
        if session_id not in self.active_sessions:
            raise ValueError(f"Sessão {session_id} não encontrada")
        
        self.active_sessions[session_id].telemetry_data.append(point)
    
    def add_telemetry_batch(self, session_id: str, points: List[TelemetryPoint]):
        if session_id not in self.active_sessions:
            raise ValueError(f"Sessão {session_id} não encontrada")
        
        self.active_sessions[session_id].telemetry_data.extend(points)
    
    def calculate_metrics(self, session: TrainingSession) -> TrainingSession:
        """Calcula métricas"""
        if len(session.telemetry_data) < 2:
            return session
        
        # extrair posicoes
        trajectory = np.array([
            [p.position.x, p.position.y, p.position.z] 
            for p in session.telemetry_data
        ])
        
        distances = np.sqrt(np.sum(np.diff(trajectory, axis=0)**2, axis=1))
        session.economy_of_motion = float(np.sum(distances))
        
        timestamps = np.array([p.timestamp for p in session.telemetry_data])
        time_diffs = np.diff(timestamps)
        velocities = distances / (time_diffs + 1e-6)
        session.avg_velocity = float(np.mean(velocities))
        
        # smoothness baseado no jerk
        if len(velocities) > 2:
            accelerations = np.diff(velocities)
            jerk = np.diff(accelerations)
            smoothness = 1 / (1 + np.std(jerk))
            session.smoothness_score = float(smoothness)
        
        # detectar tremor (oscilações rápidas)
        if len(trajectory) > 10:
            velocity_changes = np.abs(np.diff(velocities))
            high_freq_changes = np.sum(velocity_changes > np.percentile(velocity_changes, 90))
            session.tremor_detected = bool(high_freq_changes > len(velocities) * 0.1)
        
        if len(timestamps) > 0:
            session.duration = float(timestamps[-1] - timestamps[0])
        
        return session
    
    def complete_session(
        self, 
        session_id: str,
        user_feedback: Optional[str] = None,
        difficulty_rating: Optional[int] = None
    ) -> tuple[Optional[Path], Dict]:
        """
        Finaliza sessão, calcula métricas e salva
        
        - Local: Salva em JSON (dataset/collected_data/)
        - Render: Salva em PostgreSQL (permanente)
        
        Returns:
            Tuple (filepath, session_data)
            filepath: Path do arquivo salvo (ou None se só PostgreSQL)
            session_data: Dict com todos os dados da sessão
        """
        if session_id not in self.active_sessions:
            raise ValueError(f"Sessão {session_id} não encontrada")
        
        session = self.active_sessions.pop(session_id)
        
        # Adicionar feedback
        session.user_feedback = user_feedback
        session.difficulty_rating = difficulty_rating
        
        # Calcular métricas
        session = self.calculate_metrics(session)
        
        # Serializar dados
        session_data = session.model_dump()
        
        # MODO HÍBRIDO: Local = JSON, Render = PostgreSQL
        if IS_PRODUCTION and save_session_to_db:
            # Produção: Salva no PostgreSQL (permanente)
            try:
                save_session_to_db(session_id, session_data)
                print(f"✅ Sessão {session_id} salva no PostgreSQL")
            except Exception as e:
                print(f"❌ Erro ao salvar no PostgreSQL: {e}")
                # Fallback: salva em JSON mesmo em produção
                filename = f"{session_id}.json"
                filepath = self.data_dir / filename
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(session_data, f, indent=2, default=str)
                return filepath, session_data
            
            # Retorna None pois não há arquivo local
            return None, session_data
        else:
            # Local: Salva em arquivo JSON (como sempre)
            filename = f"{session_id}.json"
            filepath = self.data_dir / filename
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(session_data, f, indent=2, default=str)
            
            print(f"✅ Sessão {session_id} salva em {filepath}")
            return filepath, session_data
    
    def get_dataset_stats(self) -> dict:
        """Estatísticas do dataset coletado"""
        json_files = list(self.data_dir.glob("*.json"))
        
        if not json_files:
            return {
                "total_sessions": 0,
                "total_points": 0,
                "message": "Nenhuma sessão coletada ainda"
            }
        
        sessions = []
        for file in json_files:
            with open(file, 'r', encoding='utf-8') as f:
                sessions.append(json.load(f))
        
        total_points = sum(len(s.get("telemetry_data", [])) for s in sessions)
        users = list(set(s["user_id"] for s in sessions))
        
        skill_dist = {}
        for s in sessions:
            skill = s.get("skill_level", "unknown")
            skill_dist[skill] = skill_dist.get(skill, 0) + 1
        
        durations = [s.get("duration", 0) for s in sessions if s.get("duration")]
        avg_duration = np.mean(durations) if durations else 0
        
        return {
            "total_sessions": len(sessions),
            "total_points": total_points,
            "unique_users": len(users),
            "users": users,
            "skill_distribution": skill_dist,
            "avg_session_duration": round(avg_duration, 2),
            "avg_points_per_session": round(total_points / len(sessions), 2) if sessions else 0
        }
    
    def load_all_sessions(self) -> List[TrainingSession]:
        """Carrega todas as sessões salvas"""
        json_files = list(self.data_dir.glob("*.json"))
        sessions = []
        
        for file in json_files:
            with open(file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                sessions.append(TrainingSession(**data))
        
        return sessions


# Instância global
data_collector = DataCollector()
