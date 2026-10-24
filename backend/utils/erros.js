// Traduz erros do MySQL/Node em mensagens que dizem o que fazer.
// Antes o site só mostrava "Erro interno no servidor" e não dava pista
// nenhuma de que o problema era, por exemplo, a senha do banco no .env.

function traduzirErro(error) {
    switch (error && error.code) {
        case 'ER_DUP_ENTRY':
            return { status: 409, resposta: 'Esse dado já está cadastrado (CPF/CNPJ ou e-mail repetido).' };
        case 'ER_DATA_TOO_LONG':
            return { status: 400, resposta: 'Algum campo passou do tamanho permitido.' };
        case 'ER_TRUNCATED_WRONG_VALUE':
        case 'ER_WRONG_VALUE_FOR_TYPE':
            return { status: 400, resposta: 'Algum campo está com formato inválido (confira a data de nascimento).' };
        case 'ER_ACCESS_DENIED_ERROR':
            return { status: 503, resposta: 'A API não conseguiu entrar no MySQL: usuário ou senha do banco errados. Confira DB_USER e DB_PASSWORD no backend/.env.' };
        case 'ER_BAD_DB_ERROR':
            return { status: 503, resposta: 'O banco de dados não existe. Rode "npm run migrate" dentro da pasta backend (ou importe database/dump/pc_forge_dump.sql).' };
        case 'ER_BAD_FIELD_ERROR':
            return { status: 503, resposta: 'O banco está desatualizado (falta uma coluna, provavelmente a da foto). Rode "npm run migrate" dentro da pasta backend e reinicie a API.' };
        case 'ER_NO_REFERENCED_ROW_2':
            return { status: 404, resposta: 'Algo que você usou não existe mais (conta ou produto removido). Atualize a página e tente de novo.' };
        case 'ER_ROW_IS_REFERENCED_2':
            return { status: 409, resposta: 'Esse item já foi usado em uma compra e não pode ser excluído.' };
        case 'ER_NET_PACKET_TOO_LARGE':
            return { status: 413, resposta: 'A foto passou do limite de pacote do MySQL (max_allowed_packet). Use uma foto menor ou aumente esse valor no MySQL.' };
        case 'ER_NO_DB_ERROR':
            return { status: 503, resposta: 'Nenhum banco selecionado. Preencha DB_NAME no backend/.env.' };
        case 'ER_NO_SUCH_TABLE':
            return { status: 503, resposta: 'As tabelas ainda não existem no banco. Rode "npm run migrate" dentro da pasta backend.' };
        case 'ECONNREFUSED':
        case 'ENOTFOUND':
        case 'ETIMEDOUT':
        case 'PROTOCOL_CONNECTION_LOST':
            return { status: 503, resposta: 'A API não conseguiu conectar no MySQL. Ele está ligado? Confira DB_HOST e DB_PORT no backend/.env.' };
        default:
            return { status: 500, resposta: 'Erro interno no servidor.' };
    }
}

// Loga o erro completo no terminal da API e responde de forma útil.
function responderErro(res, error, contexto) {
    console.error(`[erro] ${contexto}:`, error);
    const { status, resposta } = traduzirErro(error);
    if (res.headersSent) return;
    res.status(status).json({ resposta, erro: (error && (error.code || error.message)) || String(error) });
}

module.exports = { traduzirErro, responderErro };
