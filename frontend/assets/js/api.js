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
        const sessao = JSON.parse(sessionStorage.getItem(tipo));
        return (sessao && sessao.token) || null;
    } catch {
        return null;
    }
}

// Token vencido/inválido (ou login feito antes do token existir): limpa a
// sessão e leva pra tela de login certa. O flag evita redirecionar duas vezes
// quando várias chamadas falham juntas.
let sessaoJaExpirou = false;
function sessaoExpirou(tipo) {
    if (sessaoJaExpirou) return;
    sessaoJaExpirou = true;
    sessionStorage.removeItem(tipo);
    if (tipo === "cliente") sessionStorage.removeItem("carrinho_qtd");
    if (typeof window.atualizarNavbar === "function") window.atualizarNavbar();
    if (typeof window.mostrarToast === "function") {
        window.mostrarToast("Sua sessão expirou. Entre novamente.", "aviso");
    }
    setTimeout(() => {
        window.location.href = tipo === "loja" ? "loja-login.html" : tipo === "adm" ? "produtos.html" : "login.html";
    }, 1400);
}

// Faz o fetch e trata os tipos de falha:
//  - API desligada / porta errada  -> o fetch estoura (TypeError). Antes o site
//    mostrava "Failed to fetch", sem explicar nada. Agora diz o que fazer, e
//    marca erro.rede = true (o modo demo usa isso pra decidir se pode simular).
//  - API respondeu com erro (400, 401, 409, 500...) -> mostra a mensagem dela.
//  - 401 numa rota que exige login -> sessão expirada (erro.sessaoExpirada = true).
async function chamarApi(metodo, caminho, corpo) {
    const tipoLogin = tipoDeLoginDaRota(caminho);
    const cabecalhos = { "Content-Type": "application/json" };
    if (tipoLogin) {
        const token = tokenDaSessao(tipoLogin);
        if (token) cabecalhos.Authorization = `Bearer ${token}`;
    }

    let resposta;
    try {
        resposta = await fetch(`${API_URL}${caminho}`, {
            method: metodo,
            headers: cabecalhos,
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
        const erro = new Error(dados.resposta || `Erro na requisição (${resposta.status}).`);
        if (resposta.status === 401 && tipoLogin) {
            erro.sessaoExpirada = true;
            sessaoExpirou(tipoLogin);
        }
        throw erro;
    }
    return dados;
}

function apiPost(caminho, corpo) { return chamarApi("POST", caminho, corpo); }
function apiPut(caminho, corpo) { return chamarApi("PUT", caminho, corpo); }
function apiDelete(caminho) { return chamarApi("DELETE", caminho); }
function apiGet(caminho) { return chamarApi("GET", caminho); }

// Igual ao apiGet, mas devolve também os cabeçalhos da resposta:
// usado onde a API manda meta-informação no header (ex: X-Resultados-Total
// da vitrine, com o total de produtos achados pelos filtros).
async function apiGetComMeta(caminho) {
    const response = await fetch(`${API_URL}${caminho}`);
    const dados = await response.json().catch(() => ({}));
    return { dados, headers: response.headers };
}

// Endereço da foto de um produto. A foto vive no banco (BLOB) e a API a
// entrega em GET /produtos/:id/imagem. O "?v=" muda sempre que o produto é
// alterado, então o navegador não fica mostrando a foto velha do cache.
// Devolve null se o produto não tem foto.
function urlImagemProduto(produto) {
    if (produto.IMAGEM_URL) return produto.IMAGEM_URL; // modo visualização (foto só na memória)
    if (!produto.TEM_IMAGEM) return null;
    return `${API_URL}/produtos/${produto.ID}/imagem?v=${produto.IMG_VERSAO || 0}`;
}

// Endereço da logo de uma loja. Vive no banco (BLOB) e a API a entrega
// em GET /loja/:id/logo. O "?v=" muda quando a loja troca a logo, então o
// navegador não fica mostrando a imagem velha do cache. null se não tem.
function urlImagemLoja(loja) {
    if (!loja.TEM_LOGO) return null;
    return `${API_URL}/loja/${loja.ID}/logo?v=${loja.LOGO_VERSAO || 0}`;
}
