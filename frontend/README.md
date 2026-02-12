# 🩺 Justina — Simulador Cirúrgico Assistido por Software

## Visão Geral
Justina é uma plataforma digital de simulação e treinamento cirúrgico
voltada para procedimentos renais minimamente invasivos assistidos por robô.

O objetivo inicial é validar interfaces, fluxos de interação, métricas
de desempenho e conceitos de controle, antes de qualquer desenvolvimento
de hardware robótico.

---

## Objetivos do MVP
- Simular interação médico–sistema robótico (abstrata)
- Explorar interfaces de controle e visualização
- Registrar métricas básicas (tempo, trajetória, erros)
- Validar conceitos com médicos e gestores de saúde

---

## Arquitetura Geral

Frontend:
- React
- Canvas (HTML5)
- Futuro: WebGL

Backend:
- API REST
- Persistência de métricas
- Análise de desempenho
- Base para IA

---

## Estrutura do Projeto
justina/
├── frontend/
├── backend/
└── README.md


---

## MVP – Escopo Atual
- Canvas interativo
- Ambiente cirúrgico abstrato
- Instrumento controlado pelo usuário
- Registro de trajetória e tempo

---

## Métricas Coletadas (MVP)
- Tempo total da simulação
- Trajetória do instrumento
- Precisão do movimento
- Pontos de erro (futuro)

---

## Público-Alvo
- Cirurgiões
- Pesquisadores
- Gestores de saúde
- Desenvolvedores e parceiros industriais

---

## Próximas Etapas
- Feedback tátil simulado
- IA para análise de desempenho
- Cenários clínicos variados
- Evolução para simulação 3D