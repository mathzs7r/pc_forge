const express = require('express');
const pool = require('../db');
const { gerarHash, conferirSenha } = require('../utils/senha');
const { normalizarEmail, emailValido } = require('../utils/documentos');
const { responderErro } = require('../utils/erros');
const { exigirLogin } = require('../utils/auth');
const { lerImagem } = require('../utils/imagem');

const router = express.Router();
const doCliente = exigirLogin('cliente');
const daLoja = exigirLogin('loja');

const texto = (v) => String(v ?? '').trim();
const inteiroPositivo = (v) => {
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : null;
};

// Pra mudar dados da conta a pessoa digita a SENHA ATUAL de novo, mesmo jÃ¡
// estando logada. Assim, quem pegou um computador destravado nÃ£o consegue
// trocar o e-mail nem a senha da conta.
// (Quem chama jÃ¡ conferiu que a senha veio preenchida, antes de ir ao banco.)
// Devolve true se a senha confere; senÃ£o jÃ¡ responde 403 e devolve false.
//   (403 e nÃ£o 401 de propÃ³sito: o front trata 401 como "sessÃ£o expirada" e
//    deslogaria a pessoa sÃ³ por errar a senha.)
async function confirmarSenhaAtual(res, hashSalvo, senhaAtual) {
    if (!(await conferirSenha(senhaAtual, hashSalvo))) {
        res.status(403).json({ resposta: 'Senha atual incorreta.' });
        return false;
    }
    return true;
}

const AVISO_SENHA_ATUAL = 'Digite sua senha atual pra confirmar as alteraÃ§Ãµes.';

// Mesma regra do cadastro: senha nova com pelo menos 8 caracteres.
function novaSenhaInvalida(novaSenha) {
    return novaSenha !== '' && novaSenha.length < 8;
}

// ============================================================
// CLIENTE
// ============================================================

// ------------------------------------------------------------
// DADOS DO CLIENTE (o prÃ³prio, logado)
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
            return res.status(404).json({ resposta: 'Conta nÃ£o encontrada.' });
        }
        res.json(linhas[0]);
    } catch (error) {
        responderErro(res, error, 'GET /perfil/cliente/:id');
    }
});

// ------------------------------------------------------------
// ALTERAR DADOS DO CLIENTE
// Corpo: nome, email, celular, senha_atual (todos obrigatÃ³rios)
//        nova_senha (opcional â€” sÃ³ manda se quiser trocar a senha)
// CPF e nascimento nÃ£o mudam por aqui.
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
        return res.status(400).json({ resposta: 'Nome, e-mail e celular sÃ£o obrigatÃ³rios.' });
    }
    if (!emailValido(email)) {
        return res.status(400).json({ resposta: 'E-mail invÃ¡lido.' });
    }
    if (!senhaAtual) {
        return res.status(400).json({ resposta: AVISO_SENHA_ATUAL });
    }
    if (novaSenhaInvalida(novaSenha)) {
        return res.status(400).json({ resposta: 'A nova senha precisa ter pelo menos 8 caracteres.' });
    }

    try {
        const [atual] = await pool.query('SELECT SENHA FROM CLIENTE WHERE ID = ?', [id]);
        if (atual.length === 0) {
            return res.status(404).json({ resposta: 'Conta nÃ£o encontrada.' });
        }
        if (!(await confirmarSenhaAtual(res, atual[0].SENHA, senhaAtual))) return;

        const [repetido] = await pool.query('SELECT ID FROM CLIENTE WHERE EMAIL = ? AND ID <> ?', [email, id]);
        if (repetido.length > 0) {
            return res.status(409).json({ resposta: 'Esse e-mail jÃ¡ estÃ¡ em uso por outra conta.' });
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

        // Devolve o que o front guarda na sessÃ£o, pra a barra do topo mostrar o nome novo.
        res.json({
            resposta: novaSenha ? 'Dados e senha atualizados!' : 'Dados atualizados!',
            cliente: { id, nome, email }
        });
    } catch (error) {
        responderErro(res, error, 'PUT /perfil/cliente/:id');
    }
});

// ------------------------------------------------------------
// ENDEREÃ‡OS DO CLIENTE
// ------------------------------------------------------------
// Valida o corpo de um endereÃ§o (mesmas regras do cadastro).
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
        return { erro: 'Preencha CEP, rua, nÃºmero, bairro, cidade e estado.' };
    }
    if (dados.cep.replace(/\D/g, '').length !== 8) {
        return { erro: 'CEP invÃ¡lido: precisa ter 8 nÃºmeros.' };
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
        res.status(201).json({ resposta: 'EndereÃ§o adicionado!', id: resultado.insertId });
    } catch (error) {
        responderErro(res, error, 'POST /perfil/cliente/:id/enderecos');
    }
});

router.put('/perfil/cliente/:id/enderecos/:idEndereco', doCliente, async (req, res) => {
    const idEndereco = inteiroPositivo(req.params.idEndereco);
    if (!idEndereco) return res.status(400).json({ resposta: 'EndereÃ§o invÃ¡lido.' });

    const { erro, dados } = lerEndereco(req.body || {});
    if (erro) return res.status(400).json({ resposta: erro });

    try {
        // O "AND ID_CLIENTE" garante que sÃ³ dÃ¡ pra mexer em endereÃ§o da prÃ³pria conta.
        const [existe] = await pool.query(
            'SELECT ID FROM ENDERECO WHERE ID = ? AND ID_CLIENTE = ?',
            [idEndereco, Number(req.params.id)]
        );
        if (existe.length === 0) {
            return res.status(404).json({ resposta: 'EndereÃ§o nÃ£o encontrado.' });
        }
        await pool.query(
            `UPDATE ENDERECO SET CEP = ?, RUA = ?, NUMERO = ?, BAIRRO = ?, CIDADE = ?, ESTADO = ?
             WHERE ID = ? AND ID_CLIENTE = ?`,
            [dados.cep, dados.rua, dados.numero, dados.bairro, dados.cidade, dados.uf, idEndereco, Number(req.params.id)]
        );
        res.json({ resposta: 'EndereÃ§o atualizado!' });
    } catch (error) {
        responderErro(res, error, 'PUT /perfil/cliente/:id/enderecos/:idEndereco');
    }
});

router.delete('/perfil/cliente/:id/enderecos/:idEndereco', doCliente, async (req, res) => {
    const idEndereco = inteiroPositivo(req.params.idEndereco);
    if (!idEndereco) return res.status(400).json({ resposta: 'EndereÃ§o invÃ¡lido.' });

    try {
        const [resultado] = await pool.query(
            'DELETE FROM ENDERECO WHERE ID = ? AND ID_CLIENTE = ?',
            [idEndereco, Number(req.params.id)]
        );
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ resposta: 'EndereÃ§o nÃ£o encontrado.' });
        }
        res.json({ resposta: 'EndereÃ§o removido.' });
    } catch (error) {
        // EndereÃ§o jÃ¡ usado numa compra nÃ£o pode sumir (FK de COMPRA) â€” o erro
        // ER_ROW_IS_REFERENCED_2 vira uma mensagem clara em utils/erros.js.
        responderErro(res, error, 'DELETE /perfil/cliente/:id/enderecos/:idEndereco');
    }
});

// ------------------------------------------------------------
// PEDIDOS DO CLIENTE (mais recentes primeiro, atÃ© 50)
// ------------------------------------------------------------
router.get('/perfil/cliente/:id/pedidos', doCliente, async (req, res) => {
    try {
        const [compras] = await pool.query(
            `SELECT C.ID, C.DATA, C.FORMA_PAGAMENTO, C.VALOR_INICIAL, C.STATUS,
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
            STATUS: c.STATUS || 'PENDENTE',
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
// DADOS DA LOJA (a prÃ³pria, logada) + resumo de vendas
// ------------------------------------------------------------
router.get('/perfil/loja/:id', daLoja, async (req, res) => {
    const id = Number(req.params.id);
    try {
        const [lojas] = await pool.query(
            `SELECT ID, NOME, CNPJ, ENDERECO, CELULAR, EMAIL, DESCRICAO, CRIADO_EM,
                    (LOGO IS NOT NULL) AS TEM_LOGO,
                    UNIX_TIMESTAMP(LOGO_ATUALIZADO_EM) AS LOGO_VERSAO
             FROM LOJA WHERE ID = ?`,
            [id]
        );
        if (lojas.length === 0) {
            return res.status(404).json({ resposta: 'Loja nÃ£o encontrada.' });
        }

        const [[produtos]] = await pool.query(
            'SELECT COUNT(*) AS TOTAL FROM PRODUTO WHERE ID_LOJA = ? AND ATIVO = 1',
            [id]
        );
        // Vendas contam tambÃ©m produtos que a loja jÃ¡ "excluiu" (ATIVO = 0):
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
// Corpo: nome, endereco, celular, email, senha_atual (obrigatÃ³rios)
//        descricao (opcional, atÃ© 500 caracteres), nova_senha (opcional)
// O CNPJ nÃ£o muda por aqui.
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
        return res.status(400).json({ resposta: 'Nome, endereÃ§o, celular e e-mail sÃ£o obrigatÃ³rios.' });
    }
    if (!emailValido(email)) {
        return res.status(400).json({ resposta: 'E-mail invÃ¡lido.' });
    }
    if (descricao.length > LIMITE_DESCRICAO) {
        return res.status(400).json({ resposta: `A descriÃ§Ã£o passou de ${LIMITE_DESCRICAO} caracteres.` });
    }
    if (!senhaAtual) {
        return res.status(400).json({ resposta: AVISO_SENHA_ATUAL });
    }
    if (novaSenhaInvalida(novaSenha)) {
        return res.status(400).json({ resposta: 'A nova senha precisa ter pelo menos 8 caracteres.' });
    }

    try {
        const [atual] = await pool.query('SELECT SENHA FROM LOJA WHERE ID = ?', [id]);
        if (atual.length === 0) {
            return res.status(404).json({ resposta: 'Loja nÃ£o encontrada.' });
        }
        if (!(await confirmarSenhaAtual(res, atual[0].SENHA, senhaAtual))) return;

        const [repetido] = await pool.query('SELECT ID FROM LOJA WHERE EMAIL = ? AND ID <> ?', [email, id]);
        if (repetido.length > 0) {
            return res.status(409).json({ resposta: 'Esse e-mail jÃ¡ estÃ¡ em uso por outra loja.' });
        }

        // DescriÃ§Ã£o vazia vira NULL (loja sem "sobre").
        const parametros = [nome, endereco, celular, email, descricao || null];
        let trechoSenha = '';
        if (novaSenha) {
            trechoSenha = ', SENHA = ?';
            parametros.push(await gerarHash(novaSenha));
        }

        // Logo da loja (migraÃ§Ã£o 007): chega em base64 opcional.
        let logo = null;
        if (corpo.logo) {
            try {
                logo = lerImagem(corpo.logo);
            } catch (erro) {
                if (erro.deImagem) return res.status(erro.status || 400).json({ resposta: erro.message });
                throw erro;
            }
            trechoSenha += ', LOGO = ?, LOGO_TIPO = ?, LOGO_ATUALIZADO_EM = CURRENT_TIMESTAMP';
            parametros.push(logo.buffer, logo.tipo);
        } else if (corpo.remover_logo) {
            trechoSenha += ', LOGO = NULL, LOGO_TIPO = NULL, LOGO_ATUALIZADO_EM = CURRENT_TIMESTAMP';
        }

        parametros.push(id);

        // execute() (e nÃ£o query()) porque a logo viaja como BLOB binÃ¡rio;
        // o query() escreveria os bytes como texto hexadecimal.
        await pool.execute(
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
// VENDAS RECENTES DA LOJA (Ãºltimas 30 linhas de pedido)
// Mostra sÃ³ o primeiro nome do comprador e cidade/UF â€” endereÃ§o completo de
// entrega ainda nÃ£o Ã© compartilhado com a loja.
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

// ------------------------------------------------------------
// PEDIDOS DA LOJA (agrupados por compra — aba "Pedidos recebidos")
// Diferente de /vendas (itens soltos), aqui cada COMPRA que contém
// pelo menos um produto desta loja vem completa:
//   * COMPRADOR  -> primeiro nome (privacidade igual à /vendas)
//   * ITENS      -> só os itens desta loja (os de outras lojas,
//                   se a compra for da vitrine inteira, não vazam)
//   * TOTAL_LOJA -> soma só dos itens desta loja (não o total geral
//                   da compra, que também tem produtos alheios)
//   * STATUS     -> ciclo do pedido (migração 010), que a loja muda
//                   no PUT /pedidos/:idCompra/status abaixo.
// ------------------------------------------------------------
router.get('/perfil/loja/:id/pedidos', daLoja, async (req, res) => {
    const id = Number(req.params.id);
    try {
        // compras que têm produto desta loja, com o total DESTA loja em cada
        const [compras] = await pool.query(
            `SELECT C.ID, C.DATA, C.STATUS,
                    SUBSTRING_INDEX(CL.NOME, ' ', 1) AS COMPRADOR,
                    E.CIDADE, E.ESTADO,
                    COALESCE(SUM(X.QUANTIDADE * X.VALOR_UNITARIO), 0) AS TOTAL_LOJA,
                    COUNT(*) AS QTD_ITENS
             FROM COMPRA C
             JOIN POSSUI X ON X.ID_COMPRA = C.ID
             JOIN PRODUTO P ON P.ID = X.ID_PRODUTO AND P.ID_LOJA = ?
             JOIN CLIENTE CL ON CL.ID = C.ID_CLIENTE
             JOIN ENDERECO E ON E.ID = C.ID_ENDERECO
             GROUP BY C.ID, C.DATA, C.STATUS, CL.NOME, E.CIDADE, E.ESTADO
             ORDER BY C.DATA DESC, C.ID DESC
             LIMIT 60`,
            [id]
        );
        if (compras.length === 0) return res.json([]);

        // itens (só desta loja) das compras acima
        const [itens] = await pool.query(
            `SELECT X.ID_COMPRA, X.ID_PRODUTO, X.QUANTIDADE, X.VALOR_UNITARIO, P.NOME
             FROM POSSUI X
             JOIN PRODUTO P ON P.ID = X.ID_PRODUTO
             WHERE P.ID_LOJA = ? AND X.ID_COMPRA IN (?)
             ORDER BY X.ID_COMPRA DESC, P.NOME`,
            [id, compras.map((c) => c.ID)]
        );

        res.json(compras.map((c) => ({
            ID: c.ID,
            DATA: c.DATA,
            STATUS: c.STATUS || 'PENDENTE',
            COMPRADOR: c.COMPRADOR,
            CIDADE: c.CIDADE,
            ESTADO: c.ESTADO,
            TOTAL_LOJA: Number(c.TOTAL_LOJA),
            QTD_ITENS: Number(c.QTD_ITENS),
            ITENS: itens
                .filter((i) => i.ID_COMPRA === c.ID)
                .map((i) => ({
                    ID_PRODUTO: i.ID_PRODUTO,
                    NOME: i.NOME,
                    QUANTIDADE: i.QUANTIDADE,
                    VALOR_UNITARIO: Number(i.VALOR_UNITARIO),
                    TOTAL: Math.round(Number(i.VALOR_UNITARIO) * 100) * i.QUANTIDADE / 100
                }))
        })));
    } catch (error) {
        responderErro(res, error, 'GET /perfil/loja/:id/pedidos');
    }
});

// ------------------------------------------------------------
// MUDAR STATUS DO PEDIDO (a loja dona move o pedido pelo ciclo)
// PUT /perfil/loja/:id/pedidos/:idCompra/status   corpo: { status }
// Só vale se a compra tiver ALGUM item desta loja; o front só
// mostra e altera compras que passam por ela.
// ------------------------------------------------------------
const STATUS_VALIDOS = ['PENDENTE', 'PAGO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'];

router.put('/perfil/loja/:id/pedidos/:idCompra/status', daLoja, async (req, res) => {
    const id = Number(req.params.id);
    const idCompra = Number(req.params.idCompra);
    const novo = String((req.body || {}).status || '').toUpperCase();

    // validação barata antes de tocar no banco
    if (!STATUS_VALIDOS.includes(novo)) {
        return res.status(400).json({
            resposta: `Status inválido. Use um destes: ${STATUS_VALIDOS.join(', ')}.`
        });
    }

    try {
        // A compra precisa conter item desta loja (senão qualquer loja
        // mexeria em pedidos alheios informando outro idCompra).
        const [daLojaSim] = await pool.query(
            `SELECT X.ID_COMPRA FROM POSSUI X
             JOIN PRODUTO P ON P.ID = X.ID_PRODUTO
             WHERE X.ID_COMPRA = ? AND P.ID_LOJA = ? LIMIT 1`,
            [idCompra, id]
        );
        if (daLojaSim.length === 0) {
            return res.status(403).json({
                resposta: 'Este pedido não tem produtos da sua loja.'
            });
        }

        const [r] = await pool.query(
            'UPDATE COMPRA SET STATUS = ? WHERE ID = ?',
            [novo, idCompra]
        );
        if (r.affectedRows === 0) {
            return res.status(404).json({ resposta: 'Pedido não encontrado.' });
        }
        res.json({ resposta: `Pedido marcado como ${novo.toLowerCase()}.`, STATUS: novo });
    } catch (error) {
        responderErro(res, error, 'PUT /perfil/loja/:id/pedidos/:idCompra/status');
    }
});

// ============================================================
// FAVORITOS — lista de desejos do cliente (migração 010)
// ============================================================

// ------------------------------------------------------------
// LISTAR FAVORITOS (mesmo contrato de campo da vitrine, pra
// reusar os cards existentes do produtos.js)
// ------------------------------------------------------------
router.get('/perfil/cliente/:id/favoritos', doCliente, async (req, res) => {
    try {
        const [linhas] = await pool.query(
            `SELECT P.ID, P.NOME, P.DESCRICAO, P.CATEGORIA, P.PRECO, P.CAMINHO_IMG,
                    P.QUANTIDADE_IMG,
                    (P.IMAGEM IS NOT NULL OR P.IMAGEM_URL IS NOT NULL) AS TEM_IMAGEM,
                    UNIX_TIMESTAMP(P.ATUALIZADO_EM) AS IMG_VERSAO,
                    P.IMAGEM_URL,
                    P.ID_LOJA, L.NOME AS LOJA_NOME
             FROM FAVORITO F
             JOIN PRODUTO P ON P.ID = F.ID_PRODUTO AND P.ATIVO = 1
             JOIN LOJA L ON L.ID = P.ID_LOJA
             WHERE F.ID_CLIENTE = ?
             ORDER BY F.ADICIONADO_EM DESC, P.ID DESC`,
            [Number(req.params.id)]
        );
        res.json(linhas);
    } catch (error) {
        responderErro(res, error, 'GET /perfil/cliente/:id/favoritos');
    }
});

// ------------------------------------------------------------
// FAVORITAR (idempotente: favoritar 2x = 1 favorito, INSERT IGNORE)
// Corpo: { id_produto }
// ------------------------------------------------------------
router.post('/perfil/cliente/:id/favoritos', doCliente, async (req, res) => {
    const idProduto = inteiroPositivo((req.body || {}).id_produto);
    if (!idProduto) {
        return res.status(400).json({ resposta: 'Informe o id_produto do favorito.' });
    }
    try {
        // produto precisa existir e estar à venda (não favorita item apagado)
        const [produto] = await pool.query(
            'SELECT ID FROM PRODUTO WHERE ID = ? AND ATIVO = 1',
            [idProduto]
        );
        if (produto.length === 0) {
            return res.status(404).json({ resposta: 'Produto não encontrado (ou fora do ar).' });
        }
        await pool.query(
            'INSERT IGNORE INTO FAVORITO (ID_CLIENTE, ID_PRODUTO) VALUES (?, ?)',
            [Number(req.params.id), idProduto]
        );
        res.status(201).json({ resposta: 'Adicionado aos favoritos!' });
    } catch (error) {
        responderErro(res, error, 'POST /perfil/cliente/:id/favoritos');
    }
});

// ------------------------------------------------------------
// REMOVER FAVORITO
// ------------------------------------------------------------
router.delete('/perfil/cliente/:id/favoritos/:idProduto', doCliente, async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM FAVORITO WHERE ID_CLIENTE = ? AND ID_PRODUTO = ?',
            [Number(req.params.id), Number(req.params.idProduto)]
        );
        res.json({ resposta: 'Removido dos favoritos.' });
    } catch (error) {
        responderErro(res, error, 'DELETE /perfil/cliente/:id/favoritos/:idProduto');
    }
});

module.exports = router;
