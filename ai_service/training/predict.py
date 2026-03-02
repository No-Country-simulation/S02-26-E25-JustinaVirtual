"""
Script de Predição - Justina Virtual
Faz inferência com modelo treinado
"""

import torch
import json
from pathlib import Path
import numpy as np
from typing import List, Dict, Tuple

from model import SurgeryLSTM, SurgeryTransformer


class SurgeryPredictor:
    """Preditor de performance cirúrgica"""
    
    def __init__(self, model_path: str):
        """
        Args:
            model_path: Caminho para modelo .pt
        """
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Carregar checkpoint
        checkpoint = torch.load(model_path, map_location=self.device)
        self.model_type = checkpoint['model_type']
        self.stats = checkpoint['stats']
        
        # Criar modelo
        if self.model_type == "lstm":
            self.model = SurgeryLSTM(
                input_size=3,
                hidden_size=128,
                num_layers=2,
                output_size=1,
                dropout=0.2
            )
        else:
            self.model = SurgeryTransformer(
                input_size=3,
                d_model=64,
                nhead=4,
                num_layers=2,
                output_size=1,
                dropout=0.2
            )
        
        # Carregar pesos
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model.to(self.device)
        self.model.eval()
        
        print(f"✅ Modelo carregado: {self.model_type.upper()}")
        print(f"📱 Device: {self.device}")
    
    def normalize(self, sequence: np.ndarray) -> np.ndarray:
        """Normaliza sequência usando stats do treinamento"""
        sequence_norm = np.copy(sequence)
        
        # Stats são salvos como x_mean, y_mean, z_mean, etc
        means = [
            self.stats.get('x_mean', 0),
            self.stats.get('y_mean', 0),
            self.stats.get('z_mean', 0)
        ]
        stds = [
            self.stats.get('x_std', 1),
            self.stats.get('y_std', 1),
            self.stats.get('z_std', 1)
        ]
        
        for i in range(3):  # x, y, z
            if stds[i] > 0:
                sequence_norm[:, i] = (sequence[:, i] - means[i]) / stds[i]
        
        return sequence_norm
    
    def predict_from_sequence(self, sequence: np.ndarray) -> float:
        """
        Prediz smoothness de uma sequência
        
        Args:
            sequence: Array (N, 3) com [x, y, z]
        
        Returns:
            smoothness_score predito
        """
        # Normalizar
        sequence_norm = self.normalize(sequence)
        
        # Converter para tensor
        sequence_tensor = torch.FloatTensor(sequence_norm).unsqueeze(0)
        sequence_tensor = sequence_tensor.to(self.device)
        
        # Predição
        with torch.no_grad():
            prediction = self.model(sequence_tensor)
        
        return prediction.item()
    
    def predict_from_json(self, json_path: str) -> Dict:
        """
        Prediz smoothness de um arquivo JSON
        
        Args:
            json_path: Caminho para JSON de sessão
        
        Returns:
            Dict com predição e ground truth
        """
        with open(json_path, 'r') as f:
            data = json.load(f)
        
        # Extrair telemetria (usando telemetry_data)
        telemetry = data.get('telemetry_data', [])
        if not telemetry:
            return {
                'session_id': data.get('session_id', 'unknown'),
                'predicted': 0.0,
                'actual': 0.0,
                'error': 0.0
            }
        
        # Estrutura: {position: {x, y, z}, timestamp}
        sequence = np.array([
            [p['position']['x'], p['position']['y'], p['position']['z']] 
            for p in telemetry
        ])
        
        # Predição
        predicted = self.predict_from_sequence(sequence)
        
        # Ground truth (direto no JSON raiz)
        actual = data.get('smoothness_score', 0.0)
        if actual is None:
            actual = 0.0
        
        return {
            'session_id': data.get('session_id', 'unknown'),
            'predicted': float(predicted),
            'actual': float(actual),
            'error': abs(float(predicted) - float(actual))
        }
    
    def predict_trajectory_incremental(
        self,
        trajectory: np.ndarray,
        window_size: int = 10
    ) -> List[float]:
        """
        Predição em tempo real durante simulação
        
        Args:
            trajectory: Lista de dicts com {x, y, z, timestamp}
        
        Returns:
            (smoothness_score, performance_level)
        """
        if len(trajectory) < 3:
            return 0.0, "Poucos dados"
        
        # Converter para array
        sequence = np.array([[p['x'], p['y'], p['z']] for p in trajectory])
        
        # Predição
        smoothness = self.predict_from_sequence(sequence)
        
        # Classificar performance
        if smoothness < 0.0005:
            level = "🌟 Excelente"
        elif smoothness < 0.001:
            level = "✅ Bom"
        elif smoothness < 0.002:
            level = "⚠️ Regular"
        else:
            level = "❌ Precisa melhorar"
        
        return smoothness, level
    
    def batch_predict(self, data_dir: str) -> List[Dict]:
        """
        Prediz todas as sessões de uma pasta
        
        Args:
            data_dir: Pasta com JSONs
        
        Returns:
            Lista de resultados
        """
        data_path = Path(data_dir)
        json_files = list(data_path.glob("*.json"))
        
        if not json_files:
            print(f"❌ Nenhum JSON encontrado em {data_dir}")
            return []
        
        print(f"\n📊 Processando {len(json_files)} sessões...\n")
        
        results = []
        total_error = 0
        
        for json_file in json_files:
            result = self.predict_from_json(str(json_file))
            results.append(result)
            total_error += result['error']
            
            print(f"Sessão: {result['session_id'][:8]}... | "
                  f"Pred: {result['predicted']:.6f} | "
                  f"Real: {result['actual']:.6f} | "
                  f"Erro: {result['error']:.6f}")
        
        # Estatísticas
        mean_error = total_error / len(results)
        print(f"\n📈 Erro médio: {mean_error:.6f}")
        
        return results


def demo_predicao():
    """Demo de predição"""
    
    # Encontrar modelo mais recente
    models_dir = Path(__file__).parent / "saved_models"
    
    if not models_dir.exists():
        print("❌ Pasta saved_models não encontrada!")
        print("💡 Rode train_lstm.py primeiro para treinar o modelo")
        return
    
    model_files = list(models_dir.glob("lstm_best_*.pt"))
    
    if not model_files:
        print("❌ Nenhum modelo treinado encontrado!")
        print("💡 Rode train_lstm.py primeiro")
        return
    
    # Modelo mais recente
    latest_model = max(model_files, key=lambda p: p.stat().st_mtime)
    print(f"🔍 Usando modelo: {latest_model.name}\n")
    
    # Criar preditor
    predictor = SurgeryPredictor(str(latest_model))
    
    # Testar em todas as sessões
    data_dir = Path(__file__).parent.parent / "dataset" / "collected_data"
    
    if not data_dir.exists():
        print(f"❌ Pasta de dados não encontrada: {data_dir}")
        return
    
    results = predictor.batch_predict(str(data_dir))
    
    # Exemplo de predição em tempo real
    print("\n" + "="*60)
    print("🎮 EXEMPLO: Predição em Tempo Real")
    print("="*60)
    
    if results:
        # Usar primeira sessão como exemplo
        first_session = results[0]
        json_path = data_dir / f"session_{first_session['session_id']}.json"
        
        with open(json_path, 'r') as f:
            data = json.load(f)
        
        # Simular predições incrementais
        telemetry = data['telemetry']
        
        print("\n📍 Predizendo durante a trajetória:\n")
        
        for i in range(5, len(telemetry) + 1, 5):
            partial_trajectory = telemetry[:i]
            smoothness, level = predictor.predict_realtime(partial_trajectory)
            print(f"  {i:2d} pontos → Smoothness: {smoothness:.6f} | {level}")
    
    print("\n" + "="*60)
    print("✅ Demo concluída!")
    print("="*60)


if __name__ == "__main__":
    demo_predicao()
