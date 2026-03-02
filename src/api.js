// 🌐 API SERVICE
// =============================

const API_URL = "http://localhost:8080/api";

// =============================
// 📤 SALVAR RESULTADO
// =============================

export async function salvarResultado(dados) {
    try {
        const response = await fetch(`${API_URL}/resultados`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        if (!response.ok) {
            throw new Error("Erro ao salvar resultado");
        }

        const data = await response.json();
        console.log("Resultado salvo:", data);
        return data;

    } catch (error) {
        console.error("Erro na API:", error);
    }
}

// =============================
// 📥 BUSCAR RANKING
// =============================

export async function buscarRanking() {
    try {
        const response = await fetch(`${API_URL}/resultados/ranking`);

        if (!response.ok) {
            throw new Error("Erro ao buscar ranking");
        }

        return await response.json();

    } catch (error) {
        console.error("Erro ao buscar ranking:", error);
    }
}

// =============================
// 📄 BUSCAR HISTÓRICO DO USUÁRIO
// =============================

export async function buscarHistorico(usuarioId) {
    try {
        const response = await fetch(`${API_URL}/resultados/usuario/${usuarioId}`);

        if (!response.ok) {
            throw new Error("Erro ao buscar histórico");
        }

        return await response.json();

    } catch (error) {
        console.error("Erro ao buscar histórico:", error);
    }
}