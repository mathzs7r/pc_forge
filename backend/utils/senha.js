const bcrypt = require('bcryptjs');

const ROUNDS = 10;

async function hashSenha(senha) {
    return bcrypt.hash(String(senha), ROUNDS);
}

async function verificarSenha(senha, hash) {
    if (!hash) return false;
    return bcrypt.compare(String(senha), hash);
}

module.exports = { hashSenha, verificarSenha };
