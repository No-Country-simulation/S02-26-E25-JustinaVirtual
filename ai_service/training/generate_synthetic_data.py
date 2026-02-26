"""
Gerador de Dados Sintéticos para Aceleração de Treinamento

Gera sessões simuladas com características de diferentes níveis de habilidade.
Use apenas para MVP/prototipagem inicial - dados reais são sempre melhores!
"""

import json
import numpy as np
from pathlib import Path
from datetime import datetime
import uuid

def generate_trajectory(skill_level: str, num_points: int = 500):
    """
    Gera trajetória com características específicas do nível
    
    Args:
        skill_level: "novice", "intermediate", "expert"
        num_points: número de pontos na trajetória
    """
    t = np.linspace(0, 10, num_points)
    
    if skill_level == "novice":
        # Novato: movimento lento, tremulo, path longo
        base_x = np.sin(t * 0.5) * 50 + 100
        base_y = np.cos(t * 0.5) * 50 + 100
        
        # Adicionar tremor significativo
        noise_x = np.random.normal(0, 5, num_points)
        noise_y = np.random.normal(0, 5, num_points)
        
        x = base_x + noise_x
        y = base_y + noise_y
        
        velocity_factor = 0.3  # lento
        
    elif skill_level == "intermediate":
        # Intermediário: movimento moderado, algum tremor
        base_x = np.sin(t * 0.8) * 40 + 100
        base_y = np.cos(t * 0.8) * 40 + 100
        
        noise_x = np.random.normal(0, 2, num_points)
        noise_y = np.random.normal(0, 2, num_points)
        
        x = base_x + noise_x
        y = base_y + noise_y
        
        velocity_factor = 0.6
        
    else:  # expert
        # Expert: movimento rápido, suave, path direto
        base_x = np.sin(t * 1.2) * 30 + 100
        base_y = np.cos(t * 1.2) * 30 + 100
        
        noise_x = np.random.normal(0, 0.5, num_points)
        noise_y = np.random.normal(0, 0.5, num_points)
        
        x = base_x + noise_x
        y = base_y + noise_y
        
        velocity_factor = 1.0  # rápido
    
    # Criar pontos de telemetria
    telemetry = []
    for i in range(num_points):
        telemetry.append({
            "timestamp": float(t[i]),
            "position": {
                "x": float(x[i]),
                "y": float(y[i]),
                "z": 0.0
            },
            "instrument_id": "main",
            "velocity": None
        })
    
    return telemetry, velocity_factor


def calculate_realistic_metrics(telemetry, skill_level):
    """Calcula métricas realistas baseadas no skill level"""
    
    # Calcular distância total (economy of motion)
    total_dist = 0
    for i in range(1, len(telemetry)):
        p1 = telemetry[i-1]["position"]
        p2 = telemetry[i]["position"]
        dist = np.sqrt((p2["x"]-p1["x"])**2 + (p2["y"]-p1["y"])**2)
        total_dist += dist
    
    # Calcular smoothness (variação de velocidade)
    velocities = []
    for i in range(1, len(telemetry)):
        p1 = telemetry[i-1]["position"]
        p2 = telemetry[i]["position"]
        dt = telemetry[i]["timestamp"] - telemetry[i-1]["timestamp"]
        dist = np.sqrt((p2["x"]-p1["x"])**2 + (p2["y"]-p1["y"])**2)
        vel = dist / dt if dt > 0 else 0
        velocities.append(vel)
    
    smoothness = 1.0 / (1.0 + np.std(velocities))
    
    # Detectar tremor (FFT)
    positions_x = [p["position"]["x"] for p in telemetry]
    fft = np.fft.fft(positions_x)
    power = np.abs(fft) ** 2
    high_freq_power = np.sum(power[len(power)//4:])
    tremor = high_freq_power > 1000
    
    avg_velocity = np.mean(velocities)
    
    return {
        "economy_of_motion": float(total_dist),
        "smoothness_score": float(smoothness),
        "avg_velocity": float(avg_velocity),
        "tremor_detected": bool(tremor)
    }


def generate_session(skill_level: str, user_id: str, procedure_type: str = "suture"):
    """Gera uma sessão completa"""
    
    telemetry, velocity_factor = generate_trajectory(skill_level, num_points=500)
    metrics = calculate_realistic_metrics(telemetry, skill_level)
    
    session_id = f"sess_synthetic_{uuid.uuid4().hex[:8]}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Duração baseada no skill (expert mais rápido)
    duration_map = {"novice": 60.0, "intermediate": 45.0, "expert": 30.0}
    duration = duration_map[skill_level] + np.random.normal(0, 5)
    
    session = {
        "session_id": session_id,
        "user_id": user_id,
        "skill_level": skill_level,
        "procedure_type": procedure_type,
        "start_time": datetime.now().isoformat(),
        "duration": float(duration),
        "telemetry_data": telemetry,
        **metrics,
        "user_feedback": f"Sessão sintética - {skill_level}",
        "difficulty_rating": np.random.randint(1, 6),
        "synthetic": True  # Marcar como sintético
    }
    
    return session


def generate_dataset(
    num_sessions_per_level: int = 20,
    output_dir: Path = None
):
    """
    Gera dataset completo com múltiplas sessões
    
    Args:
        num_sessions_per_level: Quantas sessões por nível (novice, intermediate, expert)
        output_dir: Diretório de saída
    """
    if output_dir is None:
        output_dir = Path(__file__).parent.parent / "dataset" / "collected_data"
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    skill_levels = ["novice", "intermediate", "expert"]
    
    total = 0
    for skill in skill_levels:
        print(f"\n🔄 Gerando {num_sessions_per_level} sessões de {skill}...")
        
        for i in range(num_sessions_per_level):
            user_id = f"synthetic_user_{skill}_{i+1:03d}"
            session = generate_session(skill, user_id)
            
            # Salvar JSON
            filepath = output_dir / f"{session['session_id']}.json"
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(session, f, indent=2)
            
            total += 1
            if (i+1) % 5 == 0:
                print(f"  ✅ {i+1}/{num_sessions_per_level} sessões criadas")
    
    print(f"\n✅ Dataset sintético gerado!")
    print(f"📁 Total: {total} sessões")
    print(f"📍 Local: {output_dir}")
    print("\n⚠️  IMPORTANTE: Dados sintéticos são para MVP/teste.")
    print("   Para produção, coletar dados reais!")


if __name__ == "__main__":
    # Gerar 60 sessões (20 de cada nível) em ~10 segundos
    generate_dataset(num_sessions_per_level=20)
    
    print("\n🚀 Próximo passo:")
    print("   python training/train.py")
