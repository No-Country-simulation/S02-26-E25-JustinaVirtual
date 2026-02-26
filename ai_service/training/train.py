"""
Script de treinamento do modelo de classificação de skill
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from pathlib import Path
import json
from datetime import datetime

from prepare_dataset import JustinaTelemetryDataset, create_train_val_split
from models import create_model


def train_epoch(model, dataloader, criterion, optimizer, device):
    """Treina por uma época"""
    model.train()
    total_loss = 0
    correct = 0
    total = 0
    
    for trajectories, labels in dataloader:
        trajectories = trajectories.to(device)
        labels = labels.to(device)
        
        # Forward
        outputs = model(trajectories)
        loss = criterion(outputs, labels)
        
        # Backward
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        # Métricas
        total_loss += loss.item()
        _, predicted = torch.max(outputs, 1)
        correct += (predicted == labels).sum().item()
        total += labels.size(0)
    
    avg_loss = total_loss / len(dataloader)
    accuracy = 100 * correct / total
    
    return avg_loss, accuracy


def validate(model, dataloader, criterion, device):
    """Valida o modelo"""
    model.eval()
    total_loss = 0
    correct = 0
    total = 0
    
    with torch.no_grad():
        for trajectories, labels in dataloader:
            trajectories = trajectories.to(device)
            labels = labels.to(device)
            
            outputs = model(trajectories)
            loss = criterion(outputs, labels)
            
            total_loss += loss.item()
            _, predicted = torch.max(outputs, 1)
            correct += (predicted == labels).sum().item()
            total += labels.size(0)
    
    avg_loss = total_loss / len(dataloader)
    accuracy = 100 * correct / total
    
    return avg_loss, accuracy


def train_model(
    model_type: str = "lstm",
    epochs: int = 50,
    batch_size: int = 16,
    learning_rate: float = 0.001,
    sequence_length: int = 100,
    save_dir: str = "app/models"
):
    """
    Treina modelo de classificação de skill
    
    Args:
        model_type: "lstm" ou "transformer"
        epochs: Número de épocas
        batch_size: Tamanho do batch
        learning_rate: Taxa de aprendizado
        sequence_length: Comprimento da sequência
        save_dir: Onde salvar o modelo treinado
    """
    print("="*70)
    print("🚀 TREINAMENTO DO MODELO DE CLASSIFICAÇÃO DE SKILL")
    print("="*70)
    
    # Device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\n🖥️  Device: {device}")
    
    # Carregar dataset
    print("\n📊 Carregando dataset...")
    dataset = JustinaTelemetryDataset(sequence_length=sequence_length)
    
    if len(dataset) < 10:
        print("\n⚠️  AVISO: Dataset muito pequeno!")
        print(f"   Você tem apenas {len(dataset)} sessões")
        print("   Recomendado: pelo menos 50 sessões para treino adequado")
        print("\n💡 Como coletar mais dados:")
        print("   1. Execute o simulador Justina")
        print("   2. Treine múltiplas vezes")
        print("   3. Rotular como 'expert', 'intermediate' ou 'novice'")
        return
    
    # Train/val split
    train_dataset, val_dataset = create_train_val_split(dataset, train_ratio=0.8)
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    
    # Criar modelo
    print(f"\n🧠 Criando modelo: {model_type.upper()}")
    model = create_model(model_type).to(device)
    print(f"   Parâmetros: {sum(p.numel() for p in model.parameters()):,}")
    
    # Loss e optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    
    # Treinamento
    print(f"\n🏋️  Iniciando treinamento...")
    print(f"   Épocas: {epochs}")
    print(f"   Batch size: {batch_size}")
    print(f"   Learning rate: {learning_rate}")
    print()
    
    best_val_acc = 0
    history = {
        "train_loss": [],
        "train_acc": [],
        "val_loss": [],
        "val_acc": []
    }
    
    for epoch in range(epochs):
        # Treinar
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        
        # Validar
        val_loss, val_acc = validate(model, val_loader, criterion, device)
        
        # Salvar histórico
        history["train_loss"].append(train_loss)
        history["train_acc"].append(train_acc)
        history["val_loss"].append(val_loss)
        history["val_acc"].append(val_acc)
        
        # Print progresso
        print(f"Epoch [{epoch+1:3d}/{epochs}] | "
              f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}% | "
              f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2f}%")
        
        # Salvar melhor modelo
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            save_path = Path(save_dir)
            save_path.mkdir(parents=True, exist_ok=True)
            
            model_path = save_path / f"skill_classifier_{model_type}_best.pt"
            torch.save({
                'model_state_dict': model.state_dict(),
                'model_type': model_type,
                'epoch': epoch,
                'val_acc': val_acc,
                'sequence_length': sequence_length
            }, model_path)
    
    # Resultados finais
    print("\n" + "="*70)
    print("✅ TREINAMENTO CONCLUÍDO!")
    print("="*70)
    print(f"Melhor acurácia de validação: {best_val_acc:.2f}%")
    print(f"Modelo salvo em: {model_path}")
    
    # Salvar histórico
    history_path = save_path / f"training_history_{model_type}.json"
    with open(history_path, 'w') as f:
        json.dump(history, f, indent=2)
    print(f"Histórico salvo em: {history_path}")
    
    return model, history


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Treinar modelo de classificação de skill")
    parser.add_argument("--model", type=str, default="lstm", choices=["lstm", "transformer"],
                        help="Tipo de modelo")
    parser.add_argument("--epochs", type=int, default=50, help="Número de épocas")
    parser.add_argument("--batch-size", type=int, default=16, help="Batch size")
    parser.add_argument("--lr", type=float, default=0.001, help="Learning rate")
    parser.add_argument("--seq-length", type=int, default=100, help="Sequence length")
    
    args = parser.parse_args()
    
    train_model(
        model_type=args.model,
        epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr,
        sequence_length=args.seq_length
    )
