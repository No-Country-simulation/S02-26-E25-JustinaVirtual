from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import torch
import json
import zipfile
from io import BytesIO
import importlib
import sys

from app.schemas.telemetry import (
    TelemetryPoint, 
    SessionStartRequest, 
    SessionCompleteRequest,
    DatasetStats
)
from app.services.data_collector import data_collector
from app.services.prediction_service import get_prediction_service

# Database (PostgreSQL no Render)
try:
    from app import database
    # FORCE RELOAD: Invalida cache de bytecode
    if 'app.database' in sys.modules:
        print("[MAIN INIT] Forçando reload do módulo database para invalidar cache...")
        database = importlib.reload(database)
    
    IS_PRODUCTION = database.IS_PRODUCTION
    init_database = database.init_database
    get_all_sessions = database.get_all_sessions
    get_sessions_by_user = database.get_sessions_by_user
except ImportError as e:
    print(f"[MAIN INIT] Erro ao importar database: {e}")
    IS_PRODUCTION = False
    init_database = lambda: None
    get_all_sessions = lambda: []
    get_sessions_by_user = lambda user_id: []

app = FastAPI(
    title="Justina AI Service",
    description="API de IA para análise e coleta de telemetria cirúrgica",
    version="1.0.0"
)

# Handler para erros de validação (422)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """
    Handler customizado para erros 422 - mostra exatamente qual campo está errado
    """
    errors = exc.errors()
    print("[ERRO] Validação 422:")
    print(f"[URL] {request.url}")
    print(f"[DETALHES] Erros: {errors}")
    
    return JSONResponse(
        status_code=422,
        content={
            "detail": errors,
            "message": "Erro de validação: verifique o formato dos dados enviados. Esperado: List[TelemetryPoint] com campos {timestamp, position: {x, y, z}, instrument_id, velocity}"
        }
    )

# Inicializa banco de dados (PostgreSQL no Render)
@app.on_event("startup")
async def startup_event():
    """Inicializa recursos na inicialização"""
    if IS_PRODUCTION:
        print("[PROD] Iniciando em modo PRODUÇÃO (Render)")
        print("[DB] Inicializando PostgreSQL...")
        try:
            init_database()
            print("[OK] PostgreSQL inicializado com sucesso")
        except Exception as e:
            print(f"[ERRO] Erro ao inicializar PostgreSQL: {e}")
    else:
        print("[LOCAL] Iniciando em modo LOCAL (desenvolvimento)")
        print("[DATASET] Dados serão salvos em dataset/collected_data/")

# Configurar CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://s02-26-e25-justina-virtual.vercel.app"
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
        # Debug: mostrar estrutura dos dados recebidos
        print(f"[TELEMETRIA] Recebendo para sessão {session_id}")
        print(f"[PONTOS] Total: {len(points)}")
        if points:
            print(f"[SAMPLE] Primeiro ponto: {points[0]}")
        
        data_collector.add_telemetry_batch(session_id, points)
        return {
            "status": "success",
            "points_received": len(points),
            "message": "Telemetria adicionada"
        }
    except ValueError as e:
        print(f"[ERRO] Sessão não encontrada - {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"[ERRO] Erro ao adicionar telemetria: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/sessions/{session_id}/complete")
async def complete_session(session_id: str, request: SessionCompleteRequest):
    """
    Finaliza sessão, calcula métricas, faz predição LSTM e salva
    """
    try:
        # Primeiro: completa a sessão (calcula métricas básicas e retorna dados)
        filepath, session_data = data_collector.complete_session(
            session_id=session_id,
            user_feedback=request.user_feedback,
            difficulty_rating=request.difficulty_rating
        )
        
        # Segundo: Faz predição LSTM com os dados de telemetria
        try:
            telemetry = session_data.get('telemetry_data', [])
            
            if len(telemetry) >= 2:
                prediction_service = get_prediction_service()
                prediction = prediction_service.predict(telemetry)
                
                print(f"[PREDIÇÃO] {session_id}: {prediction}")
                
                # Adiciona predição aos dados da sessão
                session_data['ai_prediction'] = prediction
                
                # Salva TUDO de uma vez no banco (agora com predição incluída)
                if IS_PRODUCTION:
                    # Import direto da função (sem cache)
                    from app.database import get_db_connection
                    import json as json_lib
                    
                    conn = get_db_connection()
                    cursor = conn.cursor()
                    
                    try:
                        cursor.execute("""
                            INSERT INTO sessions (session_id, user_id, procedure_type, start_time, session_data)
                            VALUES (%s, %s, %s, %s, %s)
                            ON CONFLICT (session_id) 
                            DO UPDATE SET 
                                user_id = EXCLUDED.user_id,
                                procedure_type = EXCLUDED.procedure_type,
                                start_time = EXCLUDED.start_time,
                                session_data = EXCLUDED.session_data,
                                end_time = CURRENT_TIMESTAMP
                        """, (
                            session_id,
                            session_data.get('user_id'),
                            session_data.get('procedure_type'),
                            session_data.get('start_time'),
                            json_lib.dumps(session_data, default=str)
                        ))
                        conn.commit()
                        print(f"✅ Sessão {session_id} salva no PostgreSQL (inline SQL)")
                    except Exception as db_error:
                        conn.rollback()
                        print(f"❌ Erro SQL: {db_error}")
                        import traceback
                        traceback.print_exc()
                    finally:
                        cursor.close()
                        conn.close()
                
                elif filepath:
                    # Modo local: salva com predição em arquivo
                    with open(filepath, 'w', encoding='utf-8') as f:
                        json.dump(session_data, f, indent=2, default=str)
                    print(f"✅ Predição salva em {filepath}")
                
                return {
                    "status": "success",
                    "session_id": session_id,
                    "saved_to": str(filepath) if filepath else "PostgreSQL",
                    "prediction": prediction,
                    "message": "Sessão finalizada, predição calculada e salva"
                }
            else:
                print(f"[AVISO] {session_id}: Dados insuficientes para predição ({len(telemetry)} pontos)")
        
        except Exception as pred_error:
            print(f"[ERRO] Falha ao calcular predição para {session_id}: {pred_error}")
            import traceback
            traceback.print_exc()
        
        # Retorna sucesso mesmo sem predição
        return {
            "status": "success",
            "session_id": session_id,
            "saved_to": str(filepath) if filepath else "PostgreSQL",
            "message": "Sessão finalizada e salva (predição não disponível)"
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"[ERRO] Falha ao completar sessão: {e}")
        import traceback
        traceback.print_exc()
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


@app.get("/sessions/user/{user_id}")
async def get_user_sessions(user_id: str):
    """
    Busca sessões de um usuário específico
    
    Retorna análise completa incluindo predição da IA quando disponível
    """
    if IS_PRODUCTION:
        # Busca do PostgreSQL
        sessions = get_sessions_by_user(user_id)
    else:
        # Busca dos arquivos JSON locais
        import glob
        session_files = glob.glob(str(data_collector.data_dir / "*.json"))
        sessions = []
        
        for filepath in session_files:
            try:
                with open(filepath, 'r') as f:
                    session_data = json.load(f)
                    if session_data.get("user_id") == user_id:
                        sessions.append({
                            "session_id": session_data.get("session_id"),
                            "user_id": session_data.get("user_id"),
                            "procedure_type": session_data.get("procedure_type"),
                            "session_data": session_data,
                            "created_at": session_data.get("start_time")
                        })
            except Exception as e:
                print(f"Erro ao ler {filepath}: {e}")
                continue
        
        # Ordena por data (mais recente primeiro)
        sessions.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    
    # Processa cada sessão e adiciona análise da IA
    results = []
    for session in sessions:
        try:
            session_data = session.get("session_data", {})
            
            # Extrai métricas básicas do session_data
            economy = session_data.get("economy_of_motion") or 0
            smoothness = session_data.get("smoothness_score") or 0
            avg_velocity = session_data.get("avg_velocity") or 0
            duration = session_data.get("duration")
            tremor_detected = session_data.get("tremor_detected", False)
            num_points = session_data.get("num_points", 0)
            
            # Pega a predição COMPLETA que foi salva pelo LSTM
            ai_prediction = session_data.get("ai_prediction")
            
            if not ai_prediction:
                # Fallback: calcula agora se não tiver predição salva
                telemetry = session_data.get("telemetry_data", [])
                if len(telemetry) >= 10:
                    try:
                        prediction_service = get_prediction_service()
                        if prediction_service.model is not None:
                            ai_prediction = prediction_service.predict(telemetry)
                            # Atualiza smoothness se veio da predição
                            if ai_prediction.get("smoothness_score") is not None:
                                smoothness = ai_prediction["smoothness_score"]
                    except Exception as e:
                        print(f"Erro na predição LSTM: {e}")
                        ai_prediction = None
            else:
                # Se tem predição salva, usa o smoothness dela
                if ai_prediction.get("smoothness_score") is not None:
                    smoothness = ai_prediction["smoothness_score"]
            
            # Determina status baseado nas métricas
            status = "Good Performance"
            predicted_skill = ai_prediction.get("quality_level") if ai_prediction else None
            
            if smoothness > 0.02:
                status = "Needs Improvement"
            elif economy > 1000:
                status = "Check Efficiency"
            
            # Calcula score seguro
            score_value = max(0, min(100, (1 - smoothness * 10) * 100)) if smoothness else 50
            
            # Converte datetime para string
            created_at = session.get("created_at")
            date_str = "N/A"
            if created_at:
                if isinstance(created_at, str):
                    date_str = created_at[:10]
                else:  # datetime object
                    date_str = created_at.strftime("%Y-%m-%d")
            
            results.append({
                "session_id": session.get("session_id"),
                "date": date_str,
                "procedure_type": session.get("procedure_type", "unknown"),
                "mode": "3D Surgery" if "3d" in str(session.get("procedure_type", "")).lower() else "2D Simulator",
                "score": f"{int(score_value)}%",
                "status": status,
                "duration": round(duration, 1) if duration else None,
                "num_points": num_points,
                "tremor_detected": tremor_detected,
                "metrics": {
                    "economy_of_motion": round(economy, 2),
                    "smoothness_score": round(smoothness, 4),
                    "avg_velocity": round(avg_velocity, 2),
                    "duration": round(duration, 1) if duration else None,
                    "tremor_detected": tremor_detected,
                    "num_points": num_points
                },
                "ai_prediction": ai_prediction  # Retorna o objeto COMPLETO do LSTM
            })
        except Exception as e:
            print(f"Erro ao processar sessão: {e}")
            continue
    
    return {
        "user_id": user_id,
        "total_sessions": len(results),
        "sessions": results
    }


@app.get("/sessions/all")
async def get_all_sessions():
    """
    Busca TODAS as sessões de TODOS os usuários
    
    Útil para:
    - Dashboard administrativo
    - Leaderboards globais
    - Estatísticas gerais
    - Listagem completa
    """
    # PostgreSQL em produção
    if IS_PRODUCTION:
        from app.database import get_sessions_all
        sessions = get_sessions_all()
    else:
        # Local: retorna vazio (dados estão em arquivos JSON)
        sessions = []
    
    # Processa cada sessão (mesma lógica do endpoint por usuário)
    results = []
    for session in sessions:
        try:
            session_data = session.get("session_data", {})
            
            # Extrai métricas básicas
            economy = session_data.get("economy_of_motion") or 0
            smoothness = session_data.get("smoothness_score") or 0
            avg_velocity = session_data.get("avg_velocity") or 0
            duration = session_data.get("duration")
            tremor_detected = session_data.get("tremor_detected", False)
            num_points = session_data.get("num_points", 0)
            
            # Pega predição LSTM salva
            ai_prediction = session_data.get("ai_prediction")
            
            if ai_prediction and ai_prediction.get("smoothness_score") is not None:
                smoothness = ai_prediction["smoothness_score"]
            
            # Determina status
            status = "Good Performance"
            if smoothness > 0.02:
                status = "Needs Improvement"
            elif economy > 1000:
                status = "Check Efficiency"
            
            score_value = max(0, min(100, (1 - smoothness * 10) * 100)) if smoothness else 50
            
            # Converte datetime para string
            created_at = session.get("created_at")
            date_str = "N/A"
            if created_at:
                if isinstance(created_at, str):
                    date_str = created_at[:10]
                else:
                    date_str = created_at.strftime("%Y-%m-%d")
            
            results.append({
                "session_id": session.get("session_id"),
                "user_id": session.get("user_id"),  # IMPORTANTE: inclui user_id
                "date": date_str,
                "procedure_type": session.get("procedure_type", "unknown"),
                "mode": "3D Surgery" if "3d" in str(session.get("procedure_type", "")).lower() else "2D Simulator",
                "score": f"{int(score_value)}%",
                "status": status,
                "duration": round(duration, 1) if duration else None,
                "num_points": num_points,
                "tremor_detected": tremor_detected,
                "metrics": {
                    "economy_of_motion": round(economy, 2),
                    "smoothness_score": round(smoothness, 4),
                    "avg_velocity": round(avg_velocity, 2),
                    "duration": round(duration, 1) if duration else None,
                    "tremor_detected": tremor_detected,
                    "num_points": num_points
                },
                "ai_prediction": ai_prediction
            })
        except Exception as e:
            print(f"Erro ao processar sessão: {e}")
            continue
    
    return {
        "total_sessions": len(results),
        "sessions": results
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


@app.get("/sessions/export")
async def export_all_sessions():
    """
    Exporta todas as sessões do PostgreSQL como ZIP com arquivos JSON
    
    **Uso:** Baixar dados do Render para treinar modelo localmente
    
    - No Render: Busca do PostgreSQL
    - Local: Retorna erro (dados já estão em dataset/)
    """
    if not IS_PRODUCTION:
        raise HTTPException(
            status_code=400, 
            detail="Exportação disponível apenas no Render. Localmente, acesse: dataset/collected_data/"
        )
    
    try:
        # Busca todas as sessões do PostgreSQL
        sessions = get_all_sessions()
        
        if not sessions:
            raise HTTPException(status_code=404, detail="Nenhuma sessão encontrada")
        
        # Cria ZIP em memória
        zip_buffer = BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for session in sessions:
                # session_data já é um dict vindo do PostgreSQL
                session_data = session.get('session_data', {})
                
                # Garante formato consistente
                if isinstance(session_data, str):
                    session_data = json.loads(session_data)
                
                # Nome do arquivo
                session_id = session.get('session_id')
                filename = f"{session_id}.json"
                
                # Adiciona ao ZIP
                json_content = json.dumps(session_data, indent=2, default=str)
                zip_file.writestr(filename, json_content)
        
        # Prepara para download
        zip_buffer.seek(0)
        
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={
                "Content-Disposition": f"attachment; filename=justina_sessions_export.zip",
                "X-Total-Sessions": str(len(sessions))
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao exportar: {str(e)}")
