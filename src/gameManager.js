// =============================
// 🎮 GAME MANAGER
// =============================

import { salvarResultado } from "./api.js";

// =============================
// 🎯 ESTADO DO JOGO
// =============================

export let modoAtual = null;   // "sutura" ou "cirurgia"
export let tempo = 0;
export let erros = 0;
export let jogoAtivo = false;

let intervaloTempo = null;

// =============================
// 🖥 MENU INICIAL
// =============================

const menu = document.createElement("div");
menu.style.position = "absolute";
menu.style.top = "0";
menu.style.left = "0";
menu.style.width = "100%";
menu.style.height = "100%";
menu.style.background = "rgba(0,0,0,0.85)";
menu.style.display = "flex";
menu.style.flexDirection = "column";
menu.style.justifyContent = "center";
menu.style.alignItems = "center";
menu.style.color = "white";
menu.style.fontSize = "24px";
menu.style.zIndex = "10";

menu.innerHTML = `
<h1>Simulador Cirúrgico</h1>
<button id="btnSutura">🪡 Iniciar Sutura</button>
<br><br>
<button id="btnCirurgia">🔪 Iniciar Cirurgia</button>
`;

document.body.appendChild(menu);

// =============================
// 📊 HUD (Tempo + Erros)
// =============================

const hud = document.createElement("div");
hud.style.position = "absolute";
hud.style.top = "20px";
hud.style.right = "20px";
hud.style.color = "white";
hud.style.fontSize = "18px";
hud.style.display = "none";
hud.style.zIndex = "10";

document.body.appendChild(hud);

function atualizarHUD() {
    hud.innerHTML = `
        ⏱ Tempo: ${tempo}s <br>
        ❌ Erros: ${erros}
    `;
}

// =============================
// 🚀 INICIAR JOGO
// =============================

export function iniciarJogo(tipo) {

    modoAtual = tipo;
    tempo = 0;
    erros = 0;
    jogoAtivo = true;

    menu.style.display = "none";
    hud.style.display = "block";

    atualizarHUD();

    intervaloTempo = setInterval(() => {
        tempo++;
        atualizarHUD();
    }, 1000);

    console.log("Modo iniciado:", tipo);
}

// =============================
// 🛑 FINALIZAR JOGO
// =============================

export async function finalizarJogo() {

    jogoAtivo = false;
    clearInterval(intervaloTempo);

    const dados = {
        modo: modoAtual,
        tempo: tempo,
        erros: erros,
        data: new Date()
    };

    console.log("Resultado final:", dados);

    await salvarResultado(dados);

    hud.style.display = "none";
    menu.style.display = "flex";
}

// =============================
// ❌ REGISTRAR ERRO
// =============================

export function registrarErro() {
    if (!jogoAtivo) return;

    erros++;
    atualizarHUD();
}

// =============================
// ⏹ FINALIZAR AUTOMATICAMENTE
// (Exemplo: terminar após 60s)
// =============================

function verificarTempoLimite() {
    if (tempo >= 60 && jogoAtivo) {
        finalizarJogo();
    }
}

// Atualiza verificação junto com tempo
setInterval(verificarTempoLimite, 1000);

// =============================
// 🎮 BOTÕES DO MENU
// =============================

document.getElementById("btnSutura").onclick = () => iniciarJogo("sutura");
document.getElementById("btnCirurgia").onclick = () => iniciarJogo("cirurgia");