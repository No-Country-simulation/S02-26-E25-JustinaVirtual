"""
Script de Treinamento LSTM - Justina Virtual
Treina modelo para prever performance cirúrgica
"""

import torch
import torch.nn as nn
import torch.optim as optim
from pathlib import Path
import json
from datetime import datetime
import matplotlib.pyplot as plt

from dataset_loader import get_dataloaders
from model import SurgeryLSTM, SurgeryTransformer


def train_epoch(model, train_loader, criterion, optimizer, device):
    """Treina por uma época"""
    model.train()
    total_loss = 0
    
    for sequences, targets in train_loader:
        sequences = sequences.to(device)
        targets = targets.to(device).unsqueeze(1)
        
        # Forward
        optimizer.zero_grad()
        outputs = model(sequences)
        loss = criterion(outputs, targets)
        
        # Backward
        loss.backward()
        optimizer.step()
        
        total_loss += loss.item()
    
    return total_loss / len(train_loader)


def validate(model, val_loader, criterion, device):
    """Valida o modelo"""
    model.eval()
    total_loss = 0
    
    with torch.no_grad():
        for sequences, targets in val_loader:
            sequences = sequences.to(device)
            targets = targets.to(device).unsqueeze(1)
            
            outputs = model(sequences)
            loss = criterion(outputs, targets)
            
            total_loss += loss.item()
    
    return total_loss / len(val_loader)


def train_model(
    data_dir: str,
    model_type: str = "lstm",  # ou "transformer"
    num_epochs: int = 50,
    batch_size: int = 4,
    learning_rate: float = 0.001,
    max_seq_len: int = 50,
    device: str = "auto"
):
    """
    Treina modelo completo
    
    Args:
        data_dir: Pasta com JSONs
        model_type: "lstm" ou "transformer"
        num_epochs: Número de épocas
        batch_size: Tamanho do batch
        learning_rate: Taxa de aprendizado
        max_seq_len: Tamanho máximo da sequência
        device: "cuda", "cpu" ou "auto"
    """
    
    # Device
    if device == "auto":
        device = "cuda" if torch.cuda.is_available() else "cpu"
    
    print(f"🚀 Iniciando treinamento")
    print(f"📱 Device: {device}")
    print(f"🧠 Modelo: {model_type.upper()}")
    print(f"📊 Épocas: {num_epochs}")
    print(f"📦 Batch size: {batch_size}\n")
    
    # Dataset
    train_loader, val_loader, dataset = get_dataloaders(
        data_dir,
        batch_size=batch_size,
        max_seq_len=max_seq_len
    )
    
    # Modelo
    if model_type == "lstm":
        model = SurgeryLSTM(
            input_size=3,
            hidden_size=128,
            num_layers=2,
            output_size=1,
            dropout=0.2
        )
    else:
        model = SurgeryTransformer(
            input_size=3,
            d_model=64,
            nhead=4,
            num_layers=2,
            output_size=1,
            dropout=0.2
        )
    
    model = model.to(device)
    
    # Loss e Optimizer
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    
    # Training loop
    train_losses = []
    val_losses = []
    best_val_loss = float('inf')
    
    print("\n🏋️ Treinando...\n")
    
    for epoch in range(num_epochs):
        train_loss = train_epoch(model, train_loader, criterion, optimizer, device)
        val_loss = validate(model, val_loader, criterion, device)
        
        train_losses.append(train_loss)
        val_losses.append(val_loss)
        
        # Log
        if (epoch + 1) % 5 == 0 or epoch == 0:
            print(f"Época [{epoch+1:3d}/{num_epochs}] | "
                  f"Train Loss: {train_loss:.6f} | "
                  f"Val Loss: {val_loss:.6f}")
        
        # Salvar melhor modelo
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            save_model(model, dataset.stats, model_type, "best")
    
    print(f"\n✅ Treinamento concluído!")
    print(f"📉 Melhor Val Loss: {best_val_loss:.6f}")
    
    # Salvar modelo final
    save_model(model, dataset.stats, model_type, "final")
    
    # Plot curvas de aprendizado
    plot_training_curves(train_losses, val_losses, model_type)
    
    return model, train_losses, val_losses


def save_model(model, stats, model_type, suffix="best"):
    """Salva modelo e metadados"""
    save_dir = Path(__file__).parent / "saved_models"
    save_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = save_dir / f"{model_type}_{suffix}_{timestamp}.pt"
    
    torch.save({
        'model_state_dict': model.state_dict(),
        'model_type': model_type,
        'stats': stats,
        'timestamp': timestamp
    }, filepath)
    
    print(f"💾 Modelo salvo: {filepath.name}")


def plot_training_curves(train_losses, val_losses, model_type):
    """Plot curvas de aprendizado"""
    plt.figure(figsize=(10, 6))
    plt.plot(train_losses, label='Train Loss', linewidth=2)
    plt.plot(val_losses, label='Validation Loss', linewidth=2)
    plt.xlabel('Época')
    plt.ylabel('MSE Loss')
    plt.title(f'Curvas de Aprendizado - {model_type.upper()}')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    save_dir = Path(__file__).parent / "plots"
    save_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = save_dir / f"training_{model_type}_{timestamp}.png"
    plt.savefig(filepath, dpi=150, bbox_inches='tight')
    print(f"📊 Plot salvo: {filepath.name}")
    
    plt.close()


if __name__ == "__main__":
    # Configuração
    DATA_DIR = Path(__file__).parent.parent / "dataset" / "collected_data"
    
    if not DATA_DIR.exists():
        print(f"❌ Pasta de dados não encontrada: {DATA_DIR}")
        exit(1)
    
    # Treinar LSTM
    print("=" * 60)
    print("🎯 TREINAMENTO LSTM - JUSTINA VIRTUAL")
    print("=" * 60 + "\n")
    
    model, train_losses, val_losses = train_model(
        data_dir=str(DATA_DIR),
        model_type="lstm",
        num_epochs=50,
        batch_size=4,
        learning_rate=0.001,
        max_seq_len=50
    )
    
    print("\n" + "=" * 60)
    print("🎊 PROCESSO CONCLUÍDO COM SUCESSO!")
    print("=" * 60)
    print("\n📁 Arquivos gerados:")
    print("  • saved_models/*.pt - Modelos treinados")
    print("  • plots/*.png - Gráficos de aprendizado")
    print("\n💡 Próximo passo: Testar predições com predict.py")
