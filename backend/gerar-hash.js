/**
 * Gera hash bcrypt de uma senha (útil para popular o banco manualmente).
 * Uso: node gerar-hash.js "minhaSenha"
 */
const { hashSenha } = require('./utils/senha');

const senha = process.argv[2];
if (!senha) {
    console.error('Uso: node gerar-hash.js "suaSenha"');
    process.exit(1);
}

hashSenha(senha).then((hash) => {
    console.log(hash);
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
