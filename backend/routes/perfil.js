const express = require('express');
const pool = require('../db');
const { gerarHash, conferirSenha } = require('../utils/senha');
const { normalizarEmail, emailValido } = require('../utils/documentos');
const { responderErro } = require('../utils/erros');
const { exigirLogin } = require('../utils/auth');

const router = express.Router();
const doCliente = exigirLogin('cliente');
const daLoja = exigirLogin('loja');

const texto = (v) => String(v ?? '').trim();
const inteiroPositivo = (v) => {
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : null;
};

// Pra mudar dados da conta a pessoa digita a SENHA ATUAL de novo, mesmo já
// estando logada. Assim, quem pegou um computador destravado não consegue
// trocar o e-mail nem a senha da conta.
// (Quem chama já conferiu que a senha veio preenchida, antes de ir ao banco.)
// Devolve true se a senha confere; senão já responde 403 e devolve false.
//   (403 e não 401 de propósito: o front trata 401 como "sessão expirada" e
//    deslogaria a pessoa só por errar a senha.)
async function confirmarSenhaAtual(res, hashSalvo, senhaAtual) {
    if (!(await conferirSenha(senhaAtual, hashSalvo))) {
        res.status(403).json({ resposta: 'Senha atual incorreta.' });
        return false;
    }
    return true;
}

const AVISO_SENHA_ATUAL = 'Digite sua senha atual pra confirmar as alterações.';

// Mesma regra do cadastro: senha nova com pelo menos 4 caracteres.
function novaSenhaInvalida(novaSenha) {
    return novaSenha !== '' && novaSenha.length < 4;
}

// ============================================================
// CLIENTE
// ============================================================

// ------------------------------------------------------------
// DADOS DO CLIENTE (o próprio, logado)
// ------------------------------------------------------------
router.get('/perfil/cliente/:id', doCliente, async (req, res) => {
    try {
        // DATE_FORMAT: devolve "2000-01-31" como texto. Sem isso o driver entrega um
        // Date de JS e, dependendo do fuso, o dia de nascimento sai um dia trocado.
        const [linhas] = await pool.query(
            `SELECT ID, NOME, CPF, EMAIL, CELULAR,
                    DATE_FORMAT(NASCIMENTO, '%Y-%m-%d') AS NASCIMENTO,
                    CRIADO_EM
             FROM CLIENTE WHERE ID = ?`,
            [Number(req.params.id)]
        );
        if (linhas.length === 0) {
            return res.status(404).json({ resposta: 'Conta não encontrada.' });
        }
        res.json(linhas[0]);
    } catch (error) {
        responderErro(res, error, 'GET /perfil/cliente/:id');
    }
});

// ------------------------------------------------------------
// ALTERAR DADOS DO CLIENTE
// Corpo: nome, email, celular, senha_atual (todos obrigatórios)
//        nova_senha (opcional — só manda se quiser trocar a senha)
// CPF e nascimento não mudam por aqui.
// ------------------------------------------------------------
router.put('/perfil/cliente/:id', doCliente, async (req, res) => {
    const id = Number(req.params.id);
    const corpo = req.body || {};
    const nome = texto(corpo.nome);
    const email = normalizarEmail(corpo.email);
    const celular = texto(corpo.celular);
    const senhaAtual = String(corpo.senha_atual ?? '');
    const novaSenha = String(corpo.nova_senha ?? '');

    if (!nome || !email || !celular) {
        return res.status(400).json({ resposta: 'Nome, e-mail e celular são obrigatórios.' });
    }
    if (!emailValido(email)) {
        return res.status(400).json({ resposta: 'E-mail inválido.' });
    }
    if (!senhaAtual) {
        return res.status(400).json({ resposta: AVISO_SENHA_ATUAL });
    }
    if (novaSenhaInvalida(novaSenha)) {
        return res.status(400).json({ resposta: 'A nova senha precisa ter pelo menos 4 caracteres.' });
    }

    try {
        const [atual] = await pool.query('SELECT SENHA FROM CLIENTE WHERE ID = ?', [id]);
        if (atual.length === 0) {
            return res.status(404).json({ resposta: 'Conta não encontrada.' });
        }
        if (!(await confirmarSenhaAtual(res, atual[0].SENHA, senhaAtual))) return;

        const [repetido] = await pool.query('SELECT ID FROM CLIENTE WHERE EMAIL = ? AND ID <> ?', [email, id]);
        if (repetido.length > 0) {
            return res.status(409).json({ resposta: 'Esse e-mail já está em uso por outra conta.' });
        }

        if (novaSenha) {
            await pool.query(
                'UPDATE CLIENTE SET NOME = ?, EMAIL = ?, CELULAR = ?, SENHA = ? WHERE ID = ?',
                [nome, email, celular, await gerarHash(novaSenha), id]
            );
        } else {
            await pool.query(
                'UPDATE CLIENTE SET NOME = ?, EMAIL = ?, CELULAR = ? WHERE ID = ?',
                [nome, email, celular, id]
            );
        }

        // Devolve o que o front guarda na sessão, pra a barra do topo mostrar o nome novo.
        res.json({
            resposta: novaSenha ? 'Dados e senha atualizados!' : 'Dados atualizados!',
            cliente: { id, nome, email }
        });
    } catch (error) {
        responderErro(res, error, 'PUT /perfil/cliente/:id');
    }
});

// ------------------------------------------------------------
// ENDEREÇOS DO CLIENTE
// ------------------------------------------------------------
// Valida o corpo de um endereço (mesmas regras do cadastro).
// Devolve { erro } ou { dados }.
function lerEndereco(corpo) {
    const dados = {
        cep: texto(corpo.cep),
        rua: texto(corpo.rua),
        numero: texto(corpo.numero),
        bairro: texto(corpo.bairro),
        cidade: texto(corpo.cidade),
        uf: texto(corpo.uf).toUpperCase()
    };
    if (Object.values(dados).some((v) => !v)) {
        return { erro: 'Preencha CEP, rua, número, bairro, cidade e estado.' };
    }
    if (dados.cep.replace(/\D/g, '').length !== 8) {
        return { erro: 'CEP inválido: precisa ter 8 números.' };
    }
    if (dados.uf.length !== 2) {
        return { erro: 'Estado (UF) precisa ter 2 letras.' };
    }
    return { dados };
}

router.get('/perfil/cliente/:id/enderecos', doCliente, async (req, res) => {
    try {
        const [linhas] = await pool.query(
            'SELECT ID, CEP, RUA, NUMERO, BAIRRO, CIDADE, ESTADO FROM ENDERECO WHERE ID_CLIENTE = ? ORDER BY ID',
            [Number(req.params.id)]
        );
        res.json(linhas);
    } catch (error) {
        responderErro(res, error, 'GET /perfil/cliente/:id/enderecos');
    }
});

router.post('/perfil/cliente/:id/enderecos', doCliente, async (req, res) => {
    const { erro, dados } = lerEndereco(req.body || {});
    if (erro) return res.status(400).json({ resposta: erro });

    try {
        const [resultado] = await pool.query(
            `INSERT INTO ENDERECO (ID_CLIENTE, CEP, RUA, NUMERO, BAIRRO, CIDADE, ESTADO)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [Number(req.params.id), dados.cep, dados.rua, dados.numero, dados.bairro, dados.cidade, dados.uf]
        );
        res.status(201).json({ resposta: 'Endereço adicionado!', id: resultado.insertId });
    } catch (error) {
        responderErro(res, error, 'POST /perfil/cliente/:id/enderecos');
    }
});

router.put('/perfil/cliente/:id/enderecos/:idEndereco', doCliente, async (req, res) => {
    const idEndereco = inteiroPositivo(req.params.idEndereco);
    if (!idEndereco) return res.status(400).json({ resposta: 'Endereço inválido.' });

    const { erro, dados } = lerEndereco(req.body || {});
    if (erro) return res.status(400).json({ resposta: erro });

    try {
        // O "AND ID_CLIENTE" garante que só dá pra mexer em endereço da própria conta.
        const [existe] = await pool.query(
            'SELECT ID FROM ENDERECO WHERE ID = ? AND ID_CLIENTE = ?',
            [idEndereco, Number(req.params.id)]
        );
        if (existe.length === 0) {
            return res.status(404).json({ resposta: 'Endereço não encontrado.' });
        }
        await pool.query(
            `UPDATE ENDERECO SET CEP = ?, RUA = ?, NUMERO = ?, BAIRRO = ?, CIDADE = ?, ESTADO = ?
             WHERE ID = ? AND ID_CLIENTE = ?`,
            [dados.cep, dados.rua, dados.numero, dados.bairro, dados.cidade, dados.uf, idEndereco, Number(req.params.id)]
        );
        res.json({ resposta: 'Endereço atualizado!' });
    } catch (error) {
        responderErro(res, error, 'PUT /perfil/cliente/:id/enderecos/:idEndereco');
    }
});

router.delete('/perfil/cliente/:id/enderecos/:idEndereco', doCliente, async (req, res) => {
    const idEndereco = inteiroPositivo(req.params.idEndereco);
    if (!idEndereco) return res.status(400).json({ resposta: 'Endereço inválido.' });

    try {
        const [resultado] = await pool.query(
            'DELETE FROM ENDERECO WHERE ID = ? AND ID_CLIENTE = ?',
            [idEndereco, Number(req.params.id)]
        );
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ resposta: 'Endereço não encontrado.' });
        }
        res.json({ resposta: 'Endereço removido.' });
    } catch (error) {
        // Endereço já usado numa compra não pode sumir (FK de COMPRA) — o erro
        // ER_ROW_IS_REFERENCED_2 vira uma mensagem clara em utils/erros.js.
        responderErro(res, error, 'DELETE /perfil/cliente/:id/enderecos/:idEndereco');
    }
});

// ------------------------------------------------------------
// PEDIDOS DO CLIENTE (mais recentes primeiro, até 50)
// ------------------------------------------------------------
router.get('/perfil/cliente/:id/pedidos', doCliente, async (req, res) => {
    try {
        const [compras] = await pool.query(
            `SELECT C.ID, C.DATA, C.FORMA_PAGAMENTO, C.VALOR_INICIAL,
                    E.RUA, E.NUMERO, E.BAIRRO, E.CIDADE, E.ESTADO
             FROM COMPRA C
             JOIN ENDERECO E ON E.ID = C.ID_ENDERECO
             WHERE C.ID_CLIENTE = ?
             ORDER BY C.ID DESC
             LIMIT 50`,
            [Number(req.params.id)]
        );
        if (compras.length === 0) return res.json([]);

        const [itens] = await pool.query(
            `SELECT X.ID_COMPRA, X.ID_PRODUTO, X.VALOR_UNITARIO, X.QUANTIDADE,
                    P.NOME, L.NOME AS LOJA_NOME
             FROM POSSUI X
             JOIN PRODUTO P ON P.ID = X.ID_PRODUTO
             JOIN LOJA L ON L.ID = P.ID_LOJA
             WHERE X.ID_COMPRA IN (?)
             ORDER BY X.ID_COMPRA DESC, P.NOME`,
            [compras.map((c) => c.ID)]
        );

        res.json(compras.map((c) => ({
            ID: c.ID,
            DATA: c.DATA,
            FORMA_PAGAMENTO: c.FORMA_PAGAMENTO,
            VALOR_INICIAL: Number(c.VALOR_INICIAL),
            ENDERECO: `${c.RUA}, ${c.NUMERO} - ${c.BAIRRO}, ${c.CIDADE}/${c.ESTADO}`,
            ITENS: itens
                .filter((i) => i.ID_COMPRA === c.ID)
                .map((i) => ({
                    ID_PRODUTO: i.ID_PRODUTO,
                    NOME: i.NOME,
                    LOJA_NOME: i.LOJA_NOME,
                    QUANTIDADE: i.QUANTIDADE,
                    VALOR_UNITARIO: Number(i.VALOR_UNITARIO)
                }))
        })));
    } catch (error) {
        responderErro(res, error, 'GET /perfil/cliente/:id/pedidos');
    }
});

// ============================================================
// LOJA
// ============================================================

// ------------------------------------------------------------
// DADOS DA LOJA (a própria, logada) + resumo de vendas
// ------------------------------------------------------------
router.get('/perfil/loja/:id', daLoja, async (req, res) => {
    const id = Number(req.params.id);
    try {
        const [lojas] = await pool.query(
            'SELECT ID, NOME, CNPJ, ENDERECO, CELULAR, EMAIL, DESCRICAO, CRIADO_EM FROM LOJA WHERE ID = ?',
            [id]
        );
        if (lojas.length === 0) {
            return res.status(404).json({ resposta: 'Loja não encontrada.' });
        }

        const [[produtos]] = await pool.query(
            'SELECT COUNT(*) AS TOTAL FROM PRODUTO WHERE ID_LOJA = ? AND ATIVO = 1',
            [id]
        );
        // Vendas contam também produtos que a loja já "excluiu" (ATIVO = 0):
        // o que foi vendido continua sendo faturamento.
        const [[vendas]] = await pool.query(
            `SELECT COUNT(DISTINCT X.ID_COMPRA) AS PEDIDOS,
                    COALESCE(SUM(X.QUANTIDADE), 0) AS ITENS,
                    COALESCE(SUM(X.QUANTIDADE * X.VALOR_UNITARIO), 0) AS FATURAMENTO
             FROM POSSUI X
             JOIN PRODUTO P ON P.ID = X.ID_PRODUTO
             WHERE P.ID_LOJA = ?`,
            [id]
        );

        res.json({
            ...lojas[0],
            RESUMO: {
                PRODUTOS_ATIVOS: Number(produtos.TOTAL),
                PEDIDOS: Number(vendas.PEDIDOS),
                ITENS_VENDIDOS: Number(vendas.ITENS),
                FATURAMENTO: Number(vendas.FATURAMENTO)
            }
        });
    } catch (error) {
        responderErro(res, error, 'GET /perfil/loja/:id');
    }
});

// ------------------------------------------------------------
// ALTERAR DADOS DA LOJA
// Corpo: nome, endereco, celular, email, senha_atual (obrigatórios)
//        descricao (opcional, até 500 caracteres), nova_senha (opcional)
// O CNPJ não muda por aqui.
// ------------------------------------------------------------
const LIMITE_DESCRICAO = 500;

router.put('/perfil/loja/:id', daLoja, async (req, res) => {
    const id = Number(req.params.id);
    const corpo = req.body || {};
    const nome = texto(corpo.nome);
    const endereco = texto(corpo.endereco);
    const celular = texto(corpo.celular);
    const email = normalizarEmail(corpo.email);
    const descricao = texto(corpo.descricao);
    const senhaAtual = String(corpo.senha_atual ?? '');
    const novaSenha = String(corpo.nova_senha ?? '');

    if (!nome || !endereco || !celular || !email) {
        return res.status(400).json({ resposta: 'Nome, endereço, celular e e-mail são obrigatórios.' });
    }
    if (!emailValido(email)) {
        return res.status(400).json({ resposta: 'E-mail inválido.' });
    }
    if (descricao.length > LIMITE_DESCRICAO) {
        return res.status(400).json({ resposta: `A descrição passou de ${LIMITE_DESCRICAO} caracteres.` });
    }
    if (!senhaAtual) {
        return res.status(400).json({ resposta: AVISO_SENHA_ATUAL });
    }
    if (novaSenhaInvalida(novaSenha)) {
        return res.status(400).json({ resposta: 'A nova senha precisa ter pelo menos 4 caracteres.' });
    }

    try {
        const [atual] = await pool.query('SELECT SENHA FROM LOJA WHERE ID = ?', [id]);
        if (atual.length === 0) {
            return res.status(404).json({ resposta: 'Loja não encontrada.' });
        }
        if (!(await confirmarSenhaAtual(res, atual[0].SENHA, senhaAtual))) return;

        const [repetido] = await pool.query('SELECT ID FROM LOJA WHERE EMAIL = ? AND ID <> ?', [email, id]);
        if (repetido.length > 0) {
            return res.status(409).json({ resposta: 'Esse e-mail já está em uso por outra loja.' });
        }

        // Descrição vazia vira NULL (loja sem "sobre").
        const parametros = [nome, endereco, celular, email, descricao || null];
        let trechoSenha = '';
        if (novaSenha) {
            trechoSenha = ', SENHA = ?';
            parametros.push(await gerarHash(novaSenha));
        }
        parametros.push(id);

        await pool.query(
            `UPDATE LOJA SET NOME = ?, ENDERECO = ?, CELULAR = ?, EMAIL = ?, DESCRICAO = ?${trechoSenha} WHERE ID = ?`,
            parametros
        );

        res.json({
            resposta: novaSenha ? 'Dados e senha atualizados!' : 'Dados da loja atualizados!',
            loja: { id, nome, email }
        });
    } catch (error) {
        responderErro(res, error, 'PUT /perfil/loja/:id');
    }
});

// ------------------------------------------------------------
// VENDAS RECENTES DA LOJA (últimas 30 linhas de pedido)
// Mostra só o primeiro nome do comprador e cidade/UF — endereço completo de
// entrega ainda não é compartilhado com a loja.
// ------------------------------------------------------------
router.get('/perfil/loja/:id/vendas', daLoja, async (req, res) => {
    try {
        const [linhas] = await pool.query(
            `SELECT X.ID_COMPRA, C.DATA, P.ID AS ID_PRODUTO, P.NOME, X.QUANTIDADE, X.VALOR_UNITARIO,
                    SUBSTRING_INDEX(CL.NOME, ' ', 1) AS COMPRADOR,
                    E.CIDADE, E.ESTADO
             FROM POSSUI X
             JOIN PRODUTO P ON P.ID = X.ID_PRODUTO
             JOIN COMPRA C ON C.ID = X.ID_COMPRA
             JOIN CLIENTE CL ON CL.ID = C.ID_CLIENTE
             JOIN ENDERECO E ON E.ID = C.ID_ENDERECO
             WHERE P.ID_LOJA = ?
             ORDER BY C.DATA DESC, X.ID_COMPRA DESC
             LIMIT 30`,
            [Number(req.params.id)]
        );
        res.json(linhas.map((l) => ({
            ID_COMPRA: l.ID_COMPRA,
            DATA: l.DATA,
            ID_PRODUTO: l.ID_PRODUTO,
            NOME: l.NOME,
            QUANTIDADE: l.QUANTIDADE,
            VALOR_UNITARIO: Number(l.VALOR_UNITARIO),
            TOTAL: Math.round(Number(l.VALOR_UNITARIO) * 100) * l.QUANTIDADE / 100,
            COMPRADOR: l.COMPRADOR,
            CIDADE: l.CIDADE,
            ESTADO: l.ESTADO
        })));
    } catch (error) {
        responderErro(res, error, 'GET /perfil/loja/:id/vendas');
    }
});

module.exports = router;
