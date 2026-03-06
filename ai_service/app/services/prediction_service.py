"""
Serviço de Predição usando Modelo LSTM
Carrega modelo treinado e faz predições em tempo real
"""

import torch
import numpy as np
from pathlib import Path
from typing import List, Dict, Tuple
import sys

# Adicionar caminho do training para importar o modelo
sys.path.append(str(Path(__file__).parent.parent.parent / "training"))

try:
    from model import SurgeryLSTM
except ImportError:
    SurgeryLSTM = None


class PredictionService:
    """Serviço para predições LSTM"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self.model = None
        self.device = torch.device("cpu")
        self.stats = {}
        self.max_seq_len = 50
        self._initialized = True
        
        self.load_model()
    
    def load_model(self, model_path: str = None):
        """Carrega modelo LSTM treinado"""
        if model_path is None:
            model_path = Path(__file__).parent.parent / "models" / "lstm_model.pt"
        
        if not Path(model_path).exists():
            return False
        
        try:
            checkpoint = torch.load(model_path, map_location=self.device)
            
            self.stats = checkpoint.get('stats', {})
            
            if SurgeryLSTM is None:
                return False
            
            self.model = SurgeryLSTM(
                input_size=3,
                hidden_size=128,
                num_layers=2,
                output_size=1,
                dropout=0.2
            )
            
            self.model.load_state_dict(checkpoint['model_state_dict'])
            self.model.to(self.device)
            self.model.eval()
            
            return True
            
        except Exception as e:
            return False
    
    def normalize_sequence(self, sequence: np.ndarray) -> np.ndarray:
        """Normaliza usando stats do treinamento"""
        sequence_norm = np.copy(sequence)
        
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
    
    def prepare_sequence(self, trajectory: List[Dict]) -> np.ndarray:
        """Prepara sequência pra o modelo"""
        # pega as posições
        sequence = []
        for point in trajectory:
            pos = point.get('position', {})
            sequence.append([
                pos.get('x', 0),
                pos.get('y', 0),
                pos.get('z', 0)
            ])
        
        sequence = np.array(sequence, dtype=np.float32)
        
        if len(sequence) == 0:
            return np.zeros((self.max_seq_len, 3), dtype=np.float32)
        
        sequence = self.normalize_sequence(sequence)
        
        # padding ou truncar pra tamanho fixo
        seq_len = len(sequence)
        if seq_len < self.max_seq_len:
            padding = np.zeros((self.max_seq_len - seq_len, 3), dtype=np.float32)
            sequence = np.vstack([sequence, padding])
        else:
            # Truncate
            sequence = sequence[:self.max_seq_len]
        
        return sequence
    
    def predict(self, trajectory: List[Dict]) -> Dict:
        """Predição de smoothness"""
        if self.model is None:
            return {
                "error": "Modelo não carregado",
                "smoothness_score": None
            }
        
        if len(trajectory) < 2:
            return {
                "error": "Dados insuficientes (mínimo 2 pontos)",
                "smoothness_score": None,
                "num_points": len(trajectory)
            }
        
        try:
            sequence = self.prepare_sequence(trajectory)
            
            # pra tensor
            x = torch.tensor(sequence, dtype=torch.float32).unsqueeze(0)
            x = x.to(self.device)
            
            with torch.no_grad():
                output = self.model(x)
                smoothness = output.item()
            
            quality = self._classify_quality(smoothness)
            
            # confianca baseada no num de pontos
            confidence = min(len(trajectory) / 20.0, 1.0)
            
            return {
                "smoothness_score": float(smoothness),
                "quality_level": quality,
                "num_points": len(trajectory),
                "model_confidence": float(confidence),
                "interpretation": self._interpret_score(smoothness)
            }
            
        except Exception as e:
            return {
                "error": f"Erro na predição: {str(e)}",
                "smoothness_score": None
            }
    
    def _classify_quality(self, smoothness: float) -> str:
        """Classifica qualidade do movimento"""
        if smoothness < 0.002:
            return "excelente"
        elif smoothness < 0.005:
            return "bom"
        elif smoothness < 0.010:
            return "regular"
        else:
            return "precisa_melhorar"
    
    def _interpret_score(self, smoothness: float) -> str:
        """Interpretação textual do score"""
        if smoothness < 0.002:
            return "Movimento muito suave e controlado!"
        elif smoothness < 0.005:
            return "Boa suavidade no movimento."
        elif smoothness < 0.010:
            return "Movimento regular, mas pode melhorar."
        else:
            return "Movimento com tremores. Pratique mais!"
    
    def predict_incremental(
        self,
        trajectory: List[Dict],
        window_size: int = 10
    ) -> List[Tuple[int, float]]:
        """
        Predições incrementais à medida que a trajetória cresce
        
        Args:
            trajectory: Lista completa de pontos
            window_size: Intervalo de pontos para fazer predições
        
        Returns:
            Lista de tuplas (num_points, smoothness_score)
        """
        predictions = []
        
        for i in range(window_size, len(trajectory) + 1, window_size):
            partial_trajectory = trajectory[:i]
            result = self.predict(partial_trajectory)
            
            if "smoothness_score" in result and result["smoothness_score"] is not None:
                predictions.append((i, result["smoothness_score"]))
        
        return predictions


# Instância global do serviço
_prediction_service = PredictionService()


def get_prediction_service() -> PredictionService:
    """Retorna instância singleton do serviço de predição"""
    return _prediction_service
