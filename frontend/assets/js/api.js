// Ponto único de configuração da API. Se você mudar a porta ou publicar
// a API em outro endereço, é só trocar aqui — o resto do site usa isso.
const API_URL = "http://localhost:3000";

// Algumas rotas exigem prova de login (o "token" que a API devolve no login e que
// fica guardado na sessão junto com os dados de quem entrou). Pra essas, o
// chamarApi manda o cabeçalho "Authorization: Bearer <token>" sozinho — quem
// chama não precisa se preocupar com isso.
//   /carrinho/...  e  /perfil/cliente/...  -> token do CLIENTE
//   /perfil/loja/...                       -> token da LOJA
//   /admin/...                             -> token do ADMINISTRADOR
function tipoDeLoginDaRota(caminho) {
    if (caminho.startsWith("/perfil/loja")) return "loja";
    if (caminho.startsWith("/perfil/cliente") || caminho.startsWith("/carrinho")) return "cliente";
    if (caminho.startsWith("/admin/")) return "adm";
    if (/^\/produtos\/\d+\/avaliacao$/.test(caminho)) return "cliente";
    return null;
}

function tokenDaSessao(tipo) {
    try {
        if (tipo === "cliente") return sessionStorage.getItem("tokenCliente") || localStorage.getItem("tokenCliente");
        if (tipo === "loja") return sessionStorage.getItem("tokenLoja") || localStorage.getItem("tokenLoja");
        if (tipo === "adm") return sessionStorage.getItem("tokenAdmin") || localStorage.getItem("tokenAdmin");
    } catch (_) {}
    return null;
}

async function chamarApi(caminho, opcoes = {}) {
    const url = API_URL + caminho;
    const headers = Object.assign({ "Content-Type": "application/json" }, opcoes.headers || {});
    const tipo = tipoDeLoginDaRota(caminho);
    if (tipo) {
        const token = tokenDaSessao(tipo);
        if (token) headers["Authorization"] = "Bearer " + token;
    }
    const resp = await fetch(url, {
        method: opcoes.method || "GET",
        headers,
        body: opcoes.body !== undefined ? (typeof opcoes.body === "string" ? opcoes.body : JSON.stringify(opcoes.body)) : undefined
    });
    let dados = null;
    const ct = resp.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
        try { dados = await resp.json(); } catch (_) { dados = null; }
    } else if (ct.includes("image/")) {
        return resp;
    } else {
        try { dados = await resp.text(); } catch (_) {}
    }
    if (!resp.ok) {
        const msg = (dados && dados.resposta) || ("Erro " + resp.status);
        const err = new Error(msg);
        err.status = resp.status;
        err.dados = dados;
        throw err;
    }
    return dados;
}

window.API_URL = API_URL;
window.chamarApi = chamarApi;
