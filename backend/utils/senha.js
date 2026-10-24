// bcryptjs = mesma coisa que o bcrypt, só que escrito em JavaScript puro.
// Vantagem: não precisa compilar nada no npm install (o "bcrypt" nativo
// costuma dar erro de node-gyp no Windows / em versões novas do Node).
// Os hashes ($2b$...) são compatíveis com os que já estão no banco.
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

async function gerarHash(senha) {
    return bcrypt.hash(String(senha), SALT_ROUNDS);
}

async function conferirSenha(senha, hash) {
    // Se alguém inseriu a senha em texto puro direto no banco (pelo Database
    // Client, por exemplo), o hash não é um bcrypt válido: retorna false em
    // vez de estourar erro. Use `npm run hash -- suasenha` pra gerar o hash.
    if (typeof hash !== 'string' || !hash.startsWith('$2')) return false;
    return bcrypt.compare(String(senha), hash);
}

module.exports = { gerarHash, conferirSenha };
