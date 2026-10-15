// Token de sessão assinado (HMAC-SHA256), sem dependência extra — só o módulo
// "crypto" que já vem com o Node.
//
// Por quê: o perfil mostra dados pessoais (CPF, e-mail, endereços, pedidos) e
// deixa editar. Se a API só confiasse no "id" que o navegador manda, qualquer
// pessoa trocando o número na URL veria/alteraria a conta dos outros. Agora, no
// login, a API devolve um token que só ela sabe assinar; as rotas de carrinho e
// perfil exigem esse token e conferem que ele é do dono do :id da rota.
//
// Formato:  <corpo em base64url>.<assinatura em base64url>
// corpo:    { t: "cliente" | "loja", id: <número>, exp: <segundos desde 1970> }
//
// O segredo vem de AUTH_SECRET no backend/.env. Sem ele a API sorteia um a cada
// vez que sobe (funciona, mas todo mundo precisa entrar de novo a cada reinício
// — e o terminal avisa).
const crypto = require('crypto');

const VALIDADE_SEGUNDOS = 12 * 60 * 60; // 12 horas
const TAMANHO_MINIMO_SEGREDO = 16;

let segredo = null;
let segredoEhTemporario = false;

function obterSegredo() {
    if (segredo) return segredo;
    const doEnv = process.env.AUTH_SECRET;
    if (doEnv && doEnv.length >= TAMANHO_MINIMO_SEGREDO) {
        segredo = doEnv;
    } else {
        segredo = crypto.randomBytes(32).toString('hex');
        segredoEhTemporario = true;
    }
    return segredo;
}

// Chamado pelo server.js na subida, pra avisar no terminal se faltar o AUTH_SECRET.
function segredoTemporario() {
    obterSegredo();
    return segredoEhTemporario;
}

function assinar(corpo) {
    return crypto.createHmac('sha256', obterSegredo()).update(corpo).digest('base64url');
}

function gerarToken(tipo, id) {
    const corpo = Buffer.from(JSON.stringify({
        t: tipo,
        id: Number(id),
        exp: Math.floor(Date.now() / 1000) + VALIDADE_SEGUNDOS
    })).toString('base64url');
    return `${corpo}.${assinar(corpo)}`;
}

// Devolve { t, id, exp } se o token é autêntico e não expirou; senão null.
function lerToken(token) {
    if (typeof token !== 'string') return null;
    const partes = token.split('.');
    if (partes.length !== 2 || !partes[0] || !partes[1]) return null;

    const [corpo, assinatura] = partes;
    const esperada = Buffer.from(assinar(corpo));
    const recebida = Buffer.from(assinatura);
    // timingSafeEqual exige o mesmo tamanho (e não vaza onde a comparação falhou).
    if (esperada.length !== recebida.length || !crypto.timingSafeEqual(esperada, recebida)) return null;

    try {
        const dados = JSON.parse(Buffer.from(corpo, 'base64url').toString('utf8'));
        if (!dados || typeof dados.exp !== 'number' || dados.exp < Math.floor(Date.now() / 1000)) return null;
        if (dados.t !== 'cliente' && dados.t !== 'loja') return null;
        if (!Number.isInteger(dados.id) || dados.id <= 0) return null;
        return dados;
    } catch (_) {
        return null;
    }
}

// Middleware: exige "Authorization: Bearer <token>" do tipo certo e, se a rota
// tem :id, que o token seja DAQUELE id (cliente 5 não mexe no cliente 6).
//   401 = sem token / token inválido / expirado  -> o front manda entrar de novo
//   403 = token válido, mas de outra conta
function exigirLogin(tipo) {
    return function (req, res, next) {
        const cabecalho = req.headers.authorization || '';
        const encontrado = /^Bearer\s+(\S+)$/i.exec(cabecalho);
        const dados = encontrado ? lerToken(encontrado[1]) : null;

        if (!dados || dados.t !== tipo) {
            return res.status(401).json({ resposta: 'Sua sessão expirou ou é inválida. Entre novamente.' });
        }
        if (req.params.id !== undefined && String(dados.id) !== String(req.params.id)) {
            return res.status(403).json({ resposta: 'Você não tem permissão pra acessar esses dados.' });
        }
        req.sessao = dados;
        next();
    };
}

module.exports = { gerarToken, lerToken, exigirLogin, segredoTemporario };
