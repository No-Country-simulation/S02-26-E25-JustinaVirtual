"""
Script de teste para validar sistema de coleta
Execute com: python test_collection.py
"""

import sys
import json
from pathlib import Path

# Adicionar path do projeto
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.data_collector import data_collector
from app.schemas.telemetry import TelemetryPoint, Position3D


def test_data_collection():
    """Testa fluxo completo de coleta de dados"""
    
    print("\n" + "="*70)
    print("🧪 TESTE DO SISTEMA DE COLETA DE DADOS")
    print("="*70)
    
    # 1. Iniciar sessão
    print("\n1️⃣  Iniciando nova sessão...")
    session_id = data_collector.start_session(
        user_id="test_user_001",
        skill_level="intermediate",
        procedure_type="suture"
    )
    print(f"   ✅ Sessão criada: {session_id}")
    
    # 2. Simular telemetria (trajetória em linha reta)
    print("\n2️⃣  Simulando telemetria...")
    telemetry_points = []
    for i in range(50):
        point = TelemetryPoint(
            timestamp=i * 0.1,  # 10 Hz
            position=Position3D(x=10 + i*0.5, y=20 + i*0.3, z=5 + i*0.1),
            instrument_id="left"
        )
        telemetry_points.append(point)
    
    data_collector.add_telemetry_batch(session_id, telemetry_points)
    print(f"   ✅ {len(telemetry_points)} pontos adicionados")
    
    # 3. Finalizar sessão
    print("\n3️⃣  Finalizando sessão...")
    filepath = data_collector.complete_session(
        session_id=session_id,
        user_feedback="Teste automatizado",
        difficulty_rating=3
    )
    print(f"   ✅ Arquivo salvo: {filepath}")
    
    # 4. Verificar arquivo salvo
    print("\n4️⃣  Verificando arquivo salvo...")
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"   📊 Pontos: {len(data['telemetry_data'])}")
    print(f"   📏 Economy: {data['economy_of_motion']:.2f}")
    print(f"   🌊 Smoothness: {data['smoothness_score']:.3f}")
    print(f"   ⏱️  Duration: {data['duration']:.1f}s")
    
    # 5. Estatísticas do dataset
    print("\n5️⃣  Estatísticas do dataset...")
    stats = data_collector.get_dataset_stats()
    print(f"   Total de sessões: {stats['total_sessions']}")
    print(f"   Total de pontos: {stats['total_points']}")
    print(f"   Usuários únicos: {stats['unique_users']}")
    
    print("\n" + "="*70)
    print("✅ TESTE CONCLUÍDO COM SUCESSO!")
    print("="*70)
    print("\n💡 Próximos passos:")
    print("   1. Integrar com frontend para coletar dados reais")
    print("   2. Coletar 50+ sessões")
    print("   3. Treinar modelo: python training/train.py")
    print()


if __name__ == "__main__":
    try:
        test_data_collection()
    except Exception as e:
        print(f"\n❌ Erro durante teste: {e}")
        import traceback
        traceback.print_exc()
