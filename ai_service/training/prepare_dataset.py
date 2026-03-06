"""
Preparação do dataset para treinamento
Converte JSONs coletados em formato PyTorch
"""

import json
import numpy as np
from pathlib import Path
from typing import List, Tuple
import torch
from torch.utils.data import Dataset


class JustinaTelemetryDataset(Dataset):
    """Dataset PyTorch de telemetria coletada"""
    
    def __init__(
        self, 
        data_dir: str = "dataset/collected_data",
        sequence_length: int = 100,
        normalize: bool = True
    ):
        """
        Args:
            data_dir: Pasta com arquivos JSON
            sequence_length: Tamanho fixo das sequências (padding/truncate)
            normalize: Normalizar coordenadas para [0, 1]
        """
        self.data_dir = Path(data_dir)
        self.sequence_length = sequence_length
        self.normalize = normalize
        
        # Carregar todos os arquivos JSON
        self.sessions = self._load_sessions()
        
        # Mapeamento de skill level para classes
        self.skill_to_label = {
            "expert": 0,
            "intermediate": 1,
            "novice": 2,
            None: 1,  # Default: intermediate
            "unknown": 1
        }
        
        print(f"\n📊 Dataset carregado:")
        print(f"   Total de sessões: {len(self.sessions)}")
        print(f"   Sequence length: {sequence_length}")
        print(f"   Normalização: {normalize}")
        
        # Estatísticas por classe
        labels = [self.skill_to_label[s.get("skill_level")] for s in self.sessions]
        unique, counts = np.unique(labels, return_counts=True)
        for label, count in zip(unique, counts):
            skill_name = [k for k, v in self.skill_to_label.items() if v == label][0]
            print(f"   {skill_name}: {count} sessões")
    
    def _load_sessions(self) -> List[dict]:
        """Carrega todas as sessões do disco"""
        json_files = list(self.data_dir.glob("*.json"))
        sessions = []
        
        for file in json_files:
            with open(file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Filtrar sessões com dados suficientes
                if len(data.get("telemetry_data", [])) >= 10:
                    sessions.append(data)
        
        return sessions
    
    def _preprocess_trajectory(self, telemetry_data: List[dict]) -> np.ndarray:
        """Converte telemetria em array numpy"""
        trajectory = np.array([
            [point["position"]["x"], point["position"]["y"], point["position"]["z"]]
            for point in telemetry_data
        ], dtype=np.float32)
        
        # Normalizar para [0, 1]
        if self.normalize and len(trajectory) > 0:
            min_vals = trajectory.min(axis=0)
            max_vals = trajectory.max(axis=0)
            range_vals = max_vals - min_vals
            range_vals[range_vals == 0] = 1  # Evitar divisão por zero
            trajectory = (trajectory - min_vals) / range_vals
        
        # Padding ou truncate para sequence_length fixo
        if len(trajectory) < self.sequence_length:
            # Padding com zeros
            pad_size = self.sequence_length - len(trajectory)
            trajectory = np.vstack([
                trajectory,
                np.zeros((pad_size, 3), dtype=np.float32)
            ])
        else:
            # Truncate
            trajectory = trajectory[:self.sequence_length]
        
        return trajectory
    
    def __len__(self) -> int:
        return len(self.sessions)
    
    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Returns:
            trajectory: Tensor (sequence_length, 3)
            label: Tensor (1,) - classe do skill level
        """
        session = self.sessions[idx]
        
        # Processar trajetória
        trajectory = self._preprocess_trajectory(session["telemetry_data"])
        
        # Label
        skill_level = session.get("skill_level")
        label = self.skill_to_label[skill_level]
        
        return torch.tensor(trajectory), torch.tensor(label, dtype=torch.long)
    
    def get_session_info(self, idx: int) -> dict:
        """Informações adicionais da sessão"""
        return {
            "session_id": self.sessions[idx]["session_id"],
            "user_id": self.sessions[idx]["user_id"],
            "skill_level": self.sessions[idx].get("skill_level"),
            "economy_of_motion": self.sessions[idx].get("economy_of_motion"),
            "smoothness_score": self.sessions[idx].get("smoothness_score"),
        }


def create_train_val_split(
    dataset: JustinaTelemetryDataset, 
    train_ratio: float = 0.8
) -> Tuple[Dataset, Dataset]:
    """
    Divide dataset em treino e validação
    
    Args:
        dataset: Dataset completo
        train_ratio: Proporção de treino (0.8 = 80% treino, 20% val)
    
    Returns:
        train_dataset, val_dataset
    """
    from torch.utils.data import random_split
    
    train_size = int(len(dataset) * train_ratio)
    val_size = len(dataset) - train_size
    
    train_dataset, val_dataset = random_split(dataset, [train_size, val_size])
    
    print(f"\n✂️  Split realizado:")
    print(f"   Treino: {train_size} sessões ({train_ratio*100}%)")
    print(f"   Validação: {val_size} sessões ({(1-train_ratio)*100}%)")
    
    return train_dataset, val_dataset


if __name__ == "__main__":
    # Testar carregamento
    print("🧪 Testando carregamento do dataset...\n")
    
    dataset = JustinaTelemetryDataset()
    
    if len(dataset) == 0:
        print("⚠️  Nenhuma sessão encontrada!")
        print("   Execute o simulador e colete dados primeiro.")
    else:
        # Mostrar primeiro exemplo
        trajectory, label = dataset[0]
        info = dataset.get_session_info(0)
        
        print(f"\n📋 Exemplo de dados:")
        print(f"   Trajectory shape: {trajectory.shape}")
        print(f"   Label: {label.item()}")
        print(f"   Session info: {info}")
        
        # Criar split
        train_ds, val_ds = create_train_val_split(dataset)
