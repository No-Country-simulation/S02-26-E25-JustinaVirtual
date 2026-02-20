from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import random
import os
import matplotlib.pyplot as plt
from fpdf import FPDF

app = FastAPI()

# Cria a pasta para salvar os PDFs se não existir
os.makedirs("relatorios_gerados", exist_ok=True)

class TelemetriaDTO(BaseModel):
    eixoX: float
    eixoY: float
    eixoZ: float
    tempo: Optional[str] = None

class FeedbackIADTO(BaseModel):
    status: str
    mensagem: str
    precisao: float

# --- Endpoint 1: Análise em Tempo Real ---
@app.post("/analisar", response_model=FeedbackIADTO)
def analisar_movimentos(movimentos: List[TelemetriaDTO]):
    print(f" PYTHON: Recebi {len(movimentos)} pontos.")
    score = random.uniform(0.7, 1.0)
    return {
        "status": "APROVADO" if score > 0.85 else "ALERTA",
        "mensagem": "Movimento analisado com sucesso.",
        "precisao": round(score, 4)
    }

# --- FUNÇÃO AUXILIAR: GERAR PDF ---
def criar_pdf_relatorio(sessao_id):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    # Título
    pdf.cell(200, 10, txt=f"Relatorio de Cirurgia - Sessao {sessao_id}", ln=1, align='C')
    pdf.ln(10)
    
    # Texto
    pdf.cell(200, 10, txt="Analise de Estabilidade: O usuario apresentou tremores leves.", ln=2)
    pdf.cell(200, 10, txt="Nota Final sugerida pela IA: 8.5/10", ln=2)
    
    # Gerar um gráfico simples (Simulação de tremor)
    plt.figure(figsize=(6, 4))
    plt.plot([1, 2, 3, 4, 5], [random.randint(1,10) for _ in range(5)], label='Estabilidade')
    plt.title("Estabilidade da Mao durante o procedimento")
    plt.legend()
    
    nome_grafico = f"relatorios_gerados/grafico_{sessao_id}.png"
    plt.savefig(nome_grafico)
    plt.close()
    
    # Colocar gráfico no PDF
    pdf.image(nome_grafico, x=10, y=50, w=100)
    
    # Salvar PDF
    nome_pdf = f"relatorios_gerados/Relatorio_{sessao_id}.pdf"
    pdf.output(nome_pdf)
    return nome_pdf

# --- Endpoint 2: Relatório Final ---
@app.post("/relatorio/{sessao_id}")
def gerar_relatorio_final(sessao_id: str):
    print(f"🤖 IA: Gerando PDF para a sessão {sessao_id}...")
    
    try:
        caminho_arquivo = criar_pdf_relatorio(sessao_id)
        print(f"📄 PDF salvo em: {caminho_arquivo}")
        return {
            "status": "RELATORIO_CRIADO",
            "mensagem": f"PDF gerado com sucesso: {caminho_arquivo}"
        }
    except Exception as e:
        print(f"Erro ao gerar PDF: {e}")
        return {"status": "ERRO", "mensagem": str(e)}