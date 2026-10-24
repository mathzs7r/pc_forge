function traduzirErro(error) {
    const code = error && error.code;
    const msg = (error && error.message) || String(error);

    if (code === 'ER_DUP_ENTRY' || /Duplicate entry/i.test(msg)) {
        return { status: 409, resposta: 'Já existe um registro com esses dados (e-mail, CPF ou CNPJ).' };
    }
    if (code === 'ER_NO_REFERENCED_ROW_2' || code === 'ER_NO_REFERENCED_ROW') {
        return { status: 400, resposta: 'Referência inválida (produto, loja ou cliente não existe).' };
    }
    if (code === 'ER_BAD_NULL_ERROR') {
        return { status: 400, resposta: 'Campo obrigatório não informado.' };
    }
    if (code === 'ER_DATA_TOO_LONG') {
        return { status: 400, resposta: 'Algum campo ultrapassou o tamanho máximo permitido.' };
    }
    if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ETIMEDOUT') {
        return { status: 503, resposta: 'Não foi possível conectar ao banco de dados. Verifique se o MySQL está rodando e o .env.' };
    }
    if (code === 'ER_ACCESS_DENIED_ERROR') {
        return { status: 503, resposta: 'Usuário ou senha do banco incorretos (confira DB_USER e DB_PASSWORD no .env).' };
    }
    if (code === 'ER_BAD_DB_ERROR') {
        return { status: 503, resposta: 'Banco de dados não existe. Rode: npm run migrate' };
    }

    console.error('[erro]', code || '', msg);
    return { status: 500, resposta: 'Erro interno no servidor.' };
}

function responderErro(res, error) {
    const { status, resposta } = traduzirErro(error);
    return res.status(status).json({ resposta });
}

module.exports = { traduzirErro, responderErro };
