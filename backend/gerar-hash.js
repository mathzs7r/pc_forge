// Gera o hash bcrypt de uma senha, pra você colar na coluna SENHA quando
// inserir um usuário À MÃO pelo Database Client (a API nunca guarda senha
// em texto puro, então uma senha "123456" escrita direto na tabela não
// funciona no login).
//
// Uso (dentro da pasta backend):
//   npm run hash -- minhasenha
const { gerarHash } = require('./utils/senha');

const senha = process.argv[2];
if (!senha) {
    console.error('Use: npm run hash -- suasenha');
    process.exit(1);
}

gerarHash(senha).then((hash) => {
    console.log('\nHash pra colar na coluna SENHA:\n');
    console.log(hash + '\n');
});
