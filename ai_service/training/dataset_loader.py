"""
Dataset Loader para Justina Virtual
Carrega JSONs de telemetria e prepara para treinamento LSTM
"""

import json
import numpy as np
from pathlib import Path
from typing import List, Tuple, Dict
import torch
from torch.utils.data import Dataset


class SurgeryTelemetryDataset(Dataset):
    """
    Dataset PyTorch para sequências de telemetria cirúrgica
    """
    
    def __init__(self, data_dir: str, max_sequence_length: int = 50):
        """
        Args:
            data_dir: Pasta com arquivos JSON
            max_sequence_length: Tamanho máximo da sequência (padding/truncate)
        """
        self.data_dir = Path(data_dir)
        self.max_seq_len = max_sequence_length
        
        # Carregar todos os JSONs
        self.sessions = self._load_sessions()
        
        # Estatísticas para normalização
        self.stats = self._compute_stats()
        
        print(f"✅ Dataset carregado: {len(self.sessions)} sessões")
        print(f"📊 Sequências: min={self.stats['min_points']}, "
              f"max={self.stats['max_points']}, "
              f"média={self.stats['avg_points']:.1f}")
    
    def _load_sessions(self) -> List[Dict]:
        """Carrega todos os arquivos JSON válidos"""
        sessions = []
        json_files = list(self.data_dir.glob("*.json"))
        
        for json_file in json_files:
            if json_file.name == "README.md":
                continue
                
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # Filtrar sessões válidas (com pelo menos 2 pontos)
            if len(data.get('telemetry_data', [])) >= 2:
                sessions.append(data)
        
        return sessions
    
    def _compute_stats(self) -> Dict:
        """Calcula estatísticas do dataset para normalização"""
        all_x, all_y, all_z = [], [], []
        seq_lengths = []
        
        for session in self.sessions:
            telemetry = session['telemetry_data']
            seq_lengths.append(len(telemetry))
            
            for point in telemetry:
                pos = point['position']
                all_x.append(pos['x'])
                all_y.append(pos['y'])
                all_z.append(pos['z'])
        
        return {
            'x_mean': np.mean(all_x),
            'x_std': np.std(all_x),
            'y_mean': np.mean(all_y),
            'y_std': np.std(all_y),
            'z_mean': np.mean(all_z),
            'z_std': np.std(all_z),
            'min_points': min(seq_lengths),
            'max_points': max(seq_lengths),
            'avg_points': np.mean(seq_lengths)
        }
    
    def __len__(self) -> int:
        return len(self.sessions)
    
    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Retorna uma sequência normalizada e seu target
        
        Returns:
            sequence: (max_seq_len, 3) - coordenadas x,y,z normalizadas
            target: scalar - smoothness_score
        """
        session = self.sessions[idx]
        telemetry = session['telemetry_data']
        
        # Extrair coordenadas
        trajectory = []
        for point in telemetry:
            pos = point['position']
            trajectory.append([pos['x'], pos['y'], pos['z']])
        
        trajectory = np.array(trajectory, dtype=np.float32)
        
        # Normalizar (Z-score)
        trajectory[:, 0] = (trajectory[:, 0] - self.stats['x_mean']) / (self.stats['x_std'] + 1e-8)
        trajectory[:, 1] = (trajectory[:, 1] - self.stats['y_mean']) / (self.stats['y_std'] + 1e-8)
        trajectory[:, 2] = (trajectory[:, 2] - self.stats['z_mean']) / (self.stats['z_std'] + 1e-8)
        
        # Padding ou Truncate
        seq_len = len(trajectory)
        if seq_len < self.max_seq_len:
            # Pad com zeros
            padding = np.zeros((self.max_seq_len - seq_len, 3), dtype=np.float32)
            trajectory = np.vstack([trajectory, padding])
        else:
            # Truncate
            trajectory = trajectory[:self.max_seq_len]
        
        # Target: smoothness_score (direto no JSON raiz)
        target = session.get('smoothness_score', 0.0)
        
        # Se ainda for None, usar 0.0
        if target is None:
            target = 0.0
        
        return (
            torch.tensor(trajectory, dtype=torch.float32),
            torch.tensor(target, dtype=torch.float32)
        )


def get_dataloaders(
    data_dir: str,
    batch_size: int = 4,
    train_split: float = 0.8,
    max_seq_len: int = 50
) -> Tuple:
    """
    Cria DataLoaders de treino e validação
    
    Args:
        data_dir: Pasta com JSONs
        batch_size: Tamanho do batch
        train_split: % para treino (resto vai pra validação)
        max_seq_len: Tamanho máximo da sequência
    
    Returns:
        (train_loader, val_loader, dataset)
    """
    from torch.utils.data import DataLoader, random_split
    
    # Dataset completo
    dataset = SurgeryTelemetryDataset(data_dir, max_seq_len)
    
    # Split treino/validação
    train_size = int(train_split * len(dataset))
    val_size = len(dataset) - train_size
    
    train_dataset, val_dataset = random_split(
        dataset, 
        [train_size, val_size],
        generator=torch.Generator().manual_seed(42)
    )
    
    # DataLoaders
    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=0  # Windows compatibility
    )
    
    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=0
    )
    
    print(f"📊 Split: {train_size} treino / {val_size} validação")
    
    return train_loader, val_loader, dataset


if __name__ == "__main__":
    # Teste do dataset
    import sys
    
    data_dir = Path(__file__).parent.parent / "dataset" / "collected_data"
    
    if not data_dir.exists():
        print(f"❌ Pasta não encontrada: {data_dir}")
        sys.exit(1)
    
    print(f"📁 Carregando de: {data_dir}\n")
    
    train_loader, val_loader, dataset = get_dataloaders(
        str(data_dir),
        batch_size=2,
        max_seq_len=30
    )
    
    # Testar um batch
    print("\n🧪 Testando um batch:")
    for sequences, targets in train_loader:
        print(f"  Sequências: {sequences.shape}")  # (batch, seq_len, features)
        print(f"  Targets: {targets.shape}")        # (batch,)
        print(f"  Exemplo target: {targets[0].item():.6f}")
        break
    
    print("\n✅ Dataset loader funcionando!")
