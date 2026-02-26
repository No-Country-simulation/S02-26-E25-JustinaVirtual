"""
Modelo LSTM para Predição de Performance Cirúrgica
"""

import torch
import torch.nn as nn


class SurgeryLSTM(nn.Module):
    """
    LSTM para prever métricas de performance (smoothness, economy, etc)
    a partir de trajetórias de instrumentos cirúrgicos
    """
    
    def __init__(
        self,
        input_size: int = 3,        # x, y, z
        hidden_size: int = 128,     # Neurônios LSTM
        num_layers: int = 2,        # Camadas LSTM empilhadas
        output_size: int = 1,       # smoothness_score
        dropout: float = 0.2
    ):
        super(SurgeryLSTM, self).__init__()
        
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
        
        # Fully Connected para output
        self.fc = nn.Sequential(
            nn.Linear(hidden_size, 64),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(64, output_size)
        )
    
    def forward(self, x):
        """
        Args:
            x: (batch_size, seq_length, input_size)
        
        Returns:
            output: (batch_size, output_size)
        """
        # LSTM
        lstm_out, (hidden, cell) = self.lstm(x)
        
        # Pegar último hidden state
        last_hidden = hidden[-1]  # (batch_size, hidden_size)
        
        # Predição
        output = self.fc(last_hidden)
        
        return output


class SurgeryTransformer(nn.Module):
    """
    Alternativa: Transformer Encoder para capturar atenção temporal
    (Mais moderno que LSTM, mas requer mais dados)
    """
    
    def __init__(
        self,
        input_size: int = 3,
        d_model: int = 64,
        nhead: int = 4,
        num_layers: int = 2,
        output_size: int = 1,
        dropout: float = 0.2
    ):
        super(SurgeryTransformer, self).__init__()
        
        self.input_projection = nn.Linear(input_size, d_model)
        
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=nhead,
            dim_feedforward=d_model * 4,
            dropout=dropout,
            batch_first=True
        )
        
        self.transformer = nn.TransformerEncoder(
            encoder_layer,
            num_layers=num_layers
        )
        
        self.fc = nn.Sequential(
            nn.Linear(d_model, 32),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(32, output_size)
        )
    
    def forward(self, x):
        """
        Args:
            x: (batch_size, seq_length, input_size)
        
        Returns:
            output: (batch_size, output_size)
        """
        # Projetar input para d_model
        x = self.input_projection(x)  # (batch, seq_len, d_model)
        
        # Transformer
        x = self.transformer(x)  # (batch, seq_len, d_model)
        
        # Global average pooling
        x = x.mean(dim=1)  # (batch, d_model)
        
        # Predição
        output = self.fc(x)
        
        return output


if __name__ == "__main__":
    # Teste dos modelos
    print("🧪 Testando modelos...\n")
    
    # Dados fake para teste
    batch_size = 4
    seq_length = 30
    input_size = 3
    
    x = torch.randn(batch_size, seq_length, input_size)
    
    # LSTM
    print("1️⃣ LSTM:")
    model_lstm = SurgeryLSTM(
        input_size=3,
        hidden_size=128,
        num_layers=2,
        output_size=1
    )
    
    output_lstm = model_lstm(x)
    print(f"   Input: {x.shape}")
    print(f"   Output: {output_lstm.shape}")
    print(f"   Parâmetros: {sum(p.numel() for p in model_lstm.parameters()):,}")
    
    # Transformer
    print("\n2️⃣ Transformer:")
    model_transformer = SurgeryTransformer(
        input_size=3,
        d_model=64,
        nhead=4,
        num_layers=2,
        output_size=1
    )
    
    output_transformer = model_transformer(x)
    print(f"   Input: {x.shape}")
    print(f"   Output: {output_transformer.shape}")
    print(f"   Parâmetros: {sum(p.numel() for p in model_transformer.parameters()):,}")
    
    print("\n✅ Modelos funcionando!")
