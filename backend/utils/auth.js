const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// AUTH_SECRET do .env assina os tokens. Se não estiver definido, usamos um
// segredo aleatório só desta execução — os tokens morrem quando a API reinicia.
let _segredoTemporario = null;
function obterSegredo() {
    if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16) {
        return process.env.AUTH_SECRET;
    }
    if (!_segredoTemporario) {
        _segredoTemporario = crypto.randomBytes(32).toString('hex');
    }
    return _segredoTemporario;
}

function segredoTemporario() {
    return !(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16);
}

function gerarToken(payload, opts = {}) {
    const options = { expiresIn: opts.expiresIn || '7d' };
    return jwt.sign(payload, obterSegredo(), options);
}

function lerToken(req) {
    const header = req.headers.authorization || '';
    const m = header.match(/^Bearer\s+(.+)$/i);
    if (!m) return null;
    try {
        return jwt.verify(m[1], obterSegredo());
    } catch {
        return null;
    }
}

function autenticar(req, res, next) {
    const dados = lerToken(req);
    if (!dados) {
        return res.status(401).json({ resposta: 'Faça login para continuar.' });
    }
    req.usuario = dados;
    next();
}

function exigirAdmin(req, res, next) {
    if (!req.usuario || req.usuario.papel !== 'admin') {
        return res.status(403).json({ resposta: 'Acesso restrito a administradores.' });
    }
    next();
}

function exigirLoja(req, res, next) {
    if (!req.usuario || req.usuario.papel !== 'loja') {
        return res.status(403).json({ resposta: 'Acesso restrito a lojas.' });
    }
    next();
}

function exigirCliente(req, res, next) {
    if (!req.usuario || req.usuario.papel !== 'cliente') {
        return res.status(403).json({ resposta: 'Acesso restrito a clientes.' });
    }
    next();
}

module.exports = {
    gerarToken,
    lerToken,
    autenticar,
    exigirAdmin,
    exigirLoja,
    exigirCliente,
    segredoTemporario,
    obterSegredo
};
