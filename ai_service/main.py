from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import random
import os
import logging
import matplotlib.pyplot as plt
from fpdf import FPDF

# --- CONFIGURAÇÃO (Híbrida) ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("justina-ai")

# Cria a pasta para salvar os PDFs se não existir
os.makedirs("relatorios_gerados", exist_ok=True)

app = FastAPI(title="Justina AI Service", version="1.0.0")

# --- MODELOS (Mantidos para compatibilidade com Java) ---
class TelemetriaDTO(BaseModel):
    eixoX: float
    eixoY: float
    eixoZ: float
    tempo: Optional[str] = None

class FeedbackIADTO(BaseModel):
    status: str
    mensagem: str
    precisao: float

# --- FUNÇÃO AUXILIAR: GERAR PDF (Sua Feature) ---
def criar_pdf_relatorio(sessao_id):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    pdf.cell(200, 10, txt=f"Relatorio de Cirurgia - Sessao {sessao_id}", ln=1, align='C')
    pdf.ln(10)
    pdf.cell(200, 10, txt="Analise de Estabilidade: O usuario apresentou movimentos registrados.", ln=2)
    pdf.cell(200, 10, txt="Nota Final sugerida pela IA: 8.5/10", ln=2)
    
    # Gráfico
    plt.figure(figsize=(6, 4))
    plt.plot([1, 2, 3, 4, 5], [random.randint(1,10) for _ in range(5)], label='Estabilidade')
    plt.title("Estabilidade da Mao")
    plt.legend()
    
    nome_grafico = f"relatorios_gerados/grafico_{sessao_id}.png"
    plt.savefig(nome_grafico)
    plt.close()
    
    pdf.image(nome_grafico, x=10, y=50, w=100)
    nome_pdf = f"relatorios_gerados/Relatorio_{sessao_id}.pdf"
    pdf.output(nome_pdf)
    return nome_pdf

# --- ENDPOINTS ---

@app.post("/analisar", response_model=FeedbackIADTO)
def analisar_movimentos(movimentos: List[TelemetriaDTO]):
    # Log da equipe + Lógica simples
    count = len(movimentos)
    logger.info(f"Recebidos {count} registros para processamento.")
    
    score = random.uniform(0.7, 1.0)
    
    if score > 0.85:
        status = "APROVADO"
        msg = "Movimento suave e preciso."
    else:
        status = "ALERTA"
        msg = "Detectamos tremor excessivo."

    return {
        "status": status,
        "mensagem": msg,
        "precisao": round(score, 4)
    }

@app.post("/relatorio/{sessao_id}")
def gerar_relatorio_final(sessao_id: str):
    logger.info(f"Gerando PDF para a sessão {sessao_id}...")
    
    try:
        caminho_arquivo = criar_pdf_relatorio(sessao_id)
        logger.info(f"PDF salvo em: {caminho_arquivo}")
        return {
            "status": "RELATORIO_CRIADO",
            "mensagem": f"PDF gerado com sucesso: {caminho_arquivo}"
        }
    except Exception as e:
        logger.error(f"Erro ao gerar PDF: {e}")
        return {"status": "ERRO", "mensagem": str(e)}