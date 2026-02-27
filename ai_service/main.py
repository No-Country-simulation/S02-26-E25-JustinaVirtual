from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import List, Optional
import random
import os
import logging
import matplotlib.pyplot as plt
from fpdf import FPDF

# --- Configuração de Logs e App ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("justina-ai")

# Cria a pasta para salvar os PDFs se não existir
os.makedirs("relatorios_gerados", exist_ok=True)

app = FastAPI(title="Justina AI Service", version="1.0.0")


# --- Endpoint 1: Análise de Telemetria (Tempo Real) ---
@app.post("/analisar")
async def analisar_movimentos(request: Request):
    try:
        dados_lista = await request.json()
        
        # Log de recepção com contexto
        count = len(dados_lista)
        logger.info(f"Recebidos {count} registros para processamento.")

        if count > 0:
            # Extração segura dos dados
            telemetria = dados_lista[0]
            x = float(telemetria.get("eixoX", 0.0))
            y = float(telemetria.get("eixoY", 0.0))
            z = float(telemetria.get("eixoZ", 0.0))
            session_id = telemetria.get("sessionId", "N/A")

            # Cálculo de score (Lógica de Negócio)
            soma_eixos = abs(x) + abs(y) + abs(z)
            # Normalização: estabilidade perfeita = 1.0
            score = 1.0 - min(0.5, soma_eixos / 100.0) if soma_eixos > 0 else 1.0
            
            logger.info(f"Sessão: {session_id} | Score: {score:.4f} | Eixos: X={x}, Y={y}, Z={z}")
        else:
            score = 0.0
            logger.warning("Lote de telemetria vazio recebido.")

        # Determinação do status e recomendações profissionais
        is_stable = score > 0.7
        
        return {
            "status": "APROVADO" if is_stable else "ATENÇÃO",
            "mensagem": "Processamento de telemetria realizado com sucesso",
            "precisao": round(score, 4),
            "recomendacao": "Condições de movimento dentro dos parâmetros normais" if is_stable 
                            else "Alerta: Instabilidade detectada acima do limite de segurança"
        }

    except Exception as e:
        logger.error(f"Erro no processamento: {str(e)}")
        return {
            "status": "ERRO",
            "mensagem": f"Falha interna no motor de análise: {str(e)}",
            "precisao": 0.0,
            "recomendacao": "Reinicie a coleta de dados"
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