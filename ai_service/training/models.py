"""
Modelo LSTM para classificação de skill cirúrgico
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Tuple


class SurgicalSkillLSTM(nn.Module):
    """
    LSTM para classificar habilidade cirúrgica baseado em telemetria
    
    Input: Sequência de posições (x, y, z) ao longo do tempo
    Output: Classificação em 3 níveis: expert (0), intermediate (1), novice (2)
    """
    
    def __init__(
        self,
        input_size: int = 3,      # x, y, z
        hidden_size: int = 64,    # Neurônios LSTM
        num_layers: int = 2,      # Camadas LSTM
        num_classes: int = 3,     # expert, intermediate, novice
        dropout: float = 0.2
    ):
        super().__init__()
        
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        # LSTM layers
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0
        )
        
        # Fully connected layers
        self.fc1 = nn.Linear(hidden_size, hidden_size // 2)
        self.dropout = nn.Dropout(dropout)
        self.fc2 = nn.Linear(hidden_size // 2, num_classes)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: (batch_size, sequence_length, input_size)
        
        Returns:
            logits: (batch_size, num_classes)
        """
        # LSTM
        lstm_out, (hidden, cell) = self.lstm(x)
        
        # Usar último estado oculto
        last_hidden = hidden[-1]  # (batch_size, hidden_size)
        
        # Fully connected
        out = F.relu(self.fc1(last_hidden))
        out = self.dropout(out)
        logits = self.fc2(out)
        
        return logits
    
    def predict(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Predição com probabilidades
        
        Returns:
            predicted_class: (batch_size,)
            probabilities: (batch_size, num_classes)
        """
        self.eval()
        with torch.no_grad():
            logits = self.forward(x)
            probabilities = F.softmax(logits, dim=1)
            predicted_class = torch.argmax(probabilities, dim=1)
        
        return predicted_class, probabilities


class SurgicalSkillTransformer(nn.Module):
    """
    Alternativa: Transformer para classificação de skill
    (Melhor para sequências longas)
    """
    
    def __init__(
        self,
        input_size: int = 3,
        d_model: int = 128,
        nhead: int = 8,
        num_layers: int = 4,
        num_classes: int = 3,
        dropout: float = 0.1
    ):
        super().__init__()
        
        self.d_model = d_model
        
        # Embedding de posição
        self.input_projection = nn.Linear(input_size, d_model)
        
        # Transformer encoder
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=nhead,
            dim_feedforward=d_model * 4,
            dropout=dropout,
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        
        # Classificador
        self.classifier = nn.Sequential(
            nn.Linear(d_model, d_model // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(d_model // 2, num_classes)
        )
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: (batch_size, sequence_length, input_size)
        
        Returns:
            logits: (batch_size, num_classes)
        """
        # Projetar input
        x = self.input_projection(x)  # (batch, seq_len, d_model)
        
        # Transformer
        transformed = self.transformer(x)  # (batch, seq_len, d_model)
        
        # Global average pooling
        pooled = transformed.mean(dim=1)  # (batch, d_model)
        
        # Classificar
        logits = self.classifier(pooled)
        
        return logits


def create_model(model_type: str = "lstm", **kwargs) -> nn.Module:
    """
    Factory function para criar modelos
    
    Args:
        model_type: "lstm" ou "transformer"
        **kwargs: Argumentos do modelo
    
    Returns:
        Modelo PyTorch
    """
    if model_type == "lstm":
        return SurgicalSkillLSTM(**kwargs)
    elif model_type == "transformer":
        return SurgicalSkillTransformer(**kwargs)
    else:
        raise ValueError(f"Modelo {model_type} não suportado. Use 'lstm' ou 'transformer'")


if __name__ == "__main__":
    # Testar arquitetura
    print("🧪 Testando arquitetura do modelo...\n")
    
    # Dados de exemplo
    batch_size = 4
    sequence_length = 100
    input_size = 3
    
    x = torch.randn(batch_size, sequence_length, input_size)
    
    # Testar LSTM
    print("📊 LSTM Model:")
    lstm_model = SurgicalSkillLSTM()
    output = lstm_model(x)
    print(f"   Input shape: {x.shape}")
    print(f"   Output shape: {output.shape}")
    print(f"   Parâmetros: {sum(p.numel() for p in lstm_model.parameters()):,}")
    
    predictions, probs = lstm_model.predict(x)
    print(f"   Predictions: {predictions}")
    print(f"   Probabilities shape: {probs.shape}")
    
    # Testar Transformer
    print("\n🔄 Transformer Model:")
    transformer_model = SurgicalSkillTransformer()
    output = transformer_model(x)
    print(f"   Input shape: {x.shape}")
    print(f"   Output shape: {output.shape}")
    print(f"   Parâmetros: {sum(p.numel() for p in transformer_model.parameters()):,}")
    
    print("\n✅ Modelos criados com sucesso!")
