import os
import json
from typing import Optional, List, Dict
from datetime import datetime

# Detecta se está rodando no Render
IS_PRODUCTION = os.getenv("RENDER") is not None
DATABASE_URL = os.getenv("DATABASE_URL")

# PostgreSQL só é usado em produção
if IS_PRODUCTION and DATABASE_URL:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    
    def get_db_connection():
        """Cria conexão com PostgreSQL do Render"""
        return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    
    def init_database():
        """Inicializa tabelas no PostgreSQL"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Tabela principal de sessões
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                session_id VARCHAR(255) PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                procedure_type VARCHAR(100) NOT NULL,
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP,
                session_data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Índices para performance
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_user_id ON sessions(user_id);
            CREATE INDEX IF NOT EXISTS idx_procedure_type ON sessions(procedure_type);
            CREATE INDEX IF NOT EXISTS idx_created_at ON sessions(created_at);
        """)
        
        conn.commit()
        cursor.close()
        conn.close()
    
    def save_session_to_db(session_id: str, session_data: Dict):
        """Salva sessão no PostgreSQL"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        user_id = session_data.get("user_id")
        procedure_type = session_data.get("procedure_type")
        start_time = session_data.get("start_time")
        
        print(f"\n[SAVE DB] ========")
        print(f"[SAVE DB] session_id: {session_id}")
        print(f"[SAVE DB] user_id: '{user_id}' (tipo: {type(user_id)})")
        print(f"[SAVE DB] procedure_type: {procedure_type}")
        print(f"[SAVE DB] session_data keys: {list(session_data.keys())}")
        print(f"[SAVE DB] ========\n")
        
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
                    end_time = CASE 
                        WHEN EXCLUDED.session_data->>'status' = 'completed' 
                        THEN CURRENT_TIMESTAMP 
                        ELSE sessions.end_time 
                    END
            """, (
                session_id,
                user_id,
                procedure_type,
                start_time,
                json.dumps(session_data)
            ))
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()
    
    def get_all_sessions() -> List[Dict]:
        """Busca todas as sessões do PostgreSQL"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT session_id, user_id, procedure_type, session_data, created_at
            FROM sessions
            ORDER BY created_at DESC
        """)
        
        sessions = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return [dict(row) for row in sessions]
    
    def get_sessions_by_user(user_id: str) -> List[Dict]:
        """Busca sessões de um usuário específico"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        print(f"\n[GET DB] ======== QUERY ========")
        print(f"[GET DB] Buscando WHERE user_id = '{user_id}'")
        
        # Debug: Lista TODAS as sessões para ver o que tem
        cursor.execute("SELECT session_id, user_id FROM sessions ORDER BY created_at DESC LIMIT 5")
        all_sessions = cursor.fetchall()
        print(f"[GET DB] Últimas 5 sessões no banco:")
        for s in all_sessions:
            print(f"[GET DB]   - session_id={s['session_id']}, user_id={s['user_id']}")
        
        cursor.execute("""
            SELECT session_id, user_id, procedure_type, session_data, created_at
            FROM sessions
            WHERE user_id = %s
            ORDER BY created_at DESC
        """, (user_id,))
        
        sessions = cursor.fetchall()
        
        print(f"[GET DB] Query retornou {len(sessions)} sessões")
        if len(sessions) > 0:
            print(f"[GET DB] Primeira sessão: session_id={sessions[0].get('session_id')}, user_id={sessions[0].get('user_id')}")
        print(f"[GET DB] ======== FIM ========\n")
        
        cursor.close()
        conn.close()
        
        return [dict(row) for row in sessions]
    
    def get_session_count() -> int:
        """Conta total de sessões no banco"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) as count FROM sessions")
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return result['count'] if result else 0

else:
    # Modo local: funções placeholder (não usa PostgreSQL)
    def init_database():
        """No modo local, não precisa inicializar nada"""
        pass
    
    def save_session_to_db(session_id: str, session_data: Dict):
        """No modo local, essa função não é chamada (usa JSON)"""
        pass
    
    def get_all_sessions() -> List[Dict]:
        """No modo local, retorna lista vazia (usa arquivos JSON)"""
        return []
    
    def get_sessions_by_user(user_id: str) -> List[Dict]:
        """No modo local, retorna lista vazia (usa arquivos JSON)"""
        return []
    
    def get_session_count() -> int:
        """No modo local, retorna 0 (usa arquivos JSON)"""
        return 0
