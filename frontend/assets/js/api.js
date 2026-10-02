// Ponto único de configuração da API. Se você mudar a porta ou publicar
// a API em outro endereço, é só trocar aqui — o resto do site usa isso.
const API_URL = "http://localhost:3000";

// Faz o fetch e trata os dois tipos de falha:
//  - API desligada / porta errada  -> o fetch estoura (TypeError). Antes o site
//    mostrava "Failed to fetch", sem explicar nada. Agora diz o que fazer, e
//    marca erro.rede = true (o modo demo usa isso pra decidir se pode simular).
//  - API respondeu com erro (400, 401, 409, 500...) -> mostra a mensagem dela.
async function chamarApi(metodo, caminho, corpo) {
    let resposta;
    try {
        resposta = await fetch(`${API_URL}${caminho}`, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: corpo === undefined ? undefined : JSON.stringify(corpo)
        });
    } catch (falha) {
        const erro = new Error(`Não consegui falar com a API (${API_URL}). Ela está rodando? Abra um terminal em "backend" e rode: npm start`);
        erro.rede = true;
        throw erro;
    }

    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
        if (dados.erro) console.error(`[API ${metodo} ${caminho}] ${dados.erro}`);
        throw new Error(dados.resposta || `Erro na requisição (${resposta.status}).`);
    }
    return dados;
}

function apiPost(caminho, corpo) { return chamarApi("POST", caminho, corpo); }
function apiPut(caminho, corpo) { return chamarApi("PUT", caminho, corpo); }
function apiGet(caminho) { return chamarApi("GET", caminho); }
