const express = require('express');
const pool = require('../db');
const { responderErro } = require('../utils/erros');
const { exigirLogin } = require('../utils/auth');

const router = express.Router();
const doCliente = exigirLogin('cliente');

// Quantidade máxima do MESMO produto no carrinho.
const LIMITE_POR_ITEM = 99;

// O que o cliente escolhe na tela -> o texto que fica gravado em COMPRA.FORMA_PAGAMENTO.
// (Ainda não existe cobrança de verdade: o pedido é registrado, só isso.)
const FORMAS_PAGAMENTO = {
    pix: 'Pix',
    cartao_credito: 'Cartão de crédito',
    cartao_debito: 'Cartão de débito',
    boleto: 'Boleto'
};

function inteiroPositivo(valor) {
    const n = Number(valor);
    return Number.isInteger(n) && n > 0 ? n : null;
}

// Lê o carrinho de um cliente já com preço atual, subtotal e total.
// Só entram produtos ATIVOS: se a loja excluiu o produto depois que ele foi pro
// carrinho, ele some daqui (e não conta no total nem no pedido).
// Aceita o pool ou uma conexão de transação (os dois têm .query()).
//
// O dinheiro é somado em CENTAVOS (inteiros) pra não herdar erro de ponto
// flutuante: 0.1 + 0.2 em JS dá 0.30000000000000004.
async function lerCarrinho(executor, idCliente) {
    const [linhas] = await executor.query(
        `SELECT I.ID_PRODUTO, I.QUANTIDADE,
                P.NOME, P.CATEGORIA, P.PRECO, P.ID_LOJA,
                L.NOME AS LOJA_NOME,
                (P.IMAGEM IS NOT NULL) AS TEM_IMAGEM,
                UNIX_TIMESTAMP(P.ATUALIZADO_EM) AS IMG_VERSAO
         FROM CARRINHO_ITEM I
         JOIN PRODUTO P ON P.ID = I.ID_PRODUTO AND P.ATIVO = 1
         JOIN LOJA L ON L.ID = P.ID_LOJA
         WHERE I.ID_CLIENTE = ?
         ORDER BY I.ADICIONADO_EM DESC, I.ID_PRODUTO DESC`,
        [idCliente]
    );

    let totalCentavos = 0;
    let quantidadeTotal = 0;
    const itens = linhas.map((linha) => {
        const preco = Number(linha.PRECO);
        const subtotalCentavos = Math.round(preco * 100) * linha.QUANTIDADE;
        totalCentavos += subtotalCentavos;
        quantidadeTotal += linha.QUANTIDADE;
        return {
            ID_PRODUTO: linha.ID_PRODUTO,
            NOME: linha.NOME,
            CATEGORIA: linha.CATEGORIA,
            PRECO: preco,
            QUANTIDADE: linha.QUANTIDADE,
            SUBTOTAL: subtotalCentavos / 100,
            ID_LOJA: linha.ID_LOJA,
            LOJA_NOME: linha.LOJA_NOME,
            // Mesmo contrato das listas de produto: a foto em si vem de GET /produtos/:id/imagem.
            TEM_IMAGEM: linha.TEM_IMAGEM,
            IMG_VERSAO: linha.IMG_VERSAO
        };
    });

    return { itens, total: totalCentavos / 100, quantidade_total: quantidadeTotal };
}

// ------------------------------------------------------------
// VER O CARRINHO
// ------------------------------------------------------------
router.get('/carrinho/:id', doCliente, async (req, res) => {
    try {
        res.json(await lerCarrinho(pool, Number(req.params.id)));
    } catch (error) {
        responderErro(res, error, 'GET /carrinho/:id');
    }
});

// ------------------------------------------------------------
// ADICIONAR AO CARRINHO
// Corpo: id_produto (obrigatório), quantidade (opcional, padrão 1)
// Se o produto já está no carrinho, SOMA na quantidade (até o limite).
// ------------------------------------------------------------
router.post('/carrinho/:id/itens', doCliente, async (req, res) => {
    const idCliente = Number(req.params.id);
    const corpo = req.body || {};
    const idProduto = inteiroPositivo(corpo.id_produto);
    const quantidade = corpo.quantidade === undefined ? 1 : inteiroPositivo(corpo.quantidade);

    if (!idProduto) {
        return res.status(400).json({ resposta: 'Informe o produto que você quer adicionar.' });
    }
    if (!quantidade || quantidade > LIMITE_POR_ITEM) {
        return res.status(400).json({ resposta: `A quantidade precisa ser um número de 1 a ${LIMITE_POR_ITEM}.` });
    }

    try {
        const [produto] = await pool.query('SELECT ID FROM PRODUTO WHERE ID = ? AND ATIVO = 1', [idProduto]);
        if (produto.length === 0) {
            return res.status(404).json({ resposta: 'Esse produto não está mais disponível.' });
        }

        // LEAST(...) trava o total do item em LIMITE_POR_ITEM mesmo somando.
        await pool.query(
            `INSERT INTO CARRINHO_ITEM (ID_CLIENTE, ID_PRODUTO, QUANTIDADE)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE QUANTIDADE = LEAST(QUANTIDADE + ?, ?)`,
            [idCliente, idProduto, quantidade, quantidade, LIMITE_POR_ITEM]
        );

        const carrinho = await lerCarrinho(pool, idCliente);
        res.status(201).json({ resposta: 'Produto adicionado ao carrinho.', ...carrinho });
    } catch (error) {
        responderErro(res, error, 'POST /carrinho/:id/itens');
    }
});

// ------------------------------------------------------------
// MUDAR A QUANTIDADE DE UM ITEM (define o valor, não soma)
// Corpo: quantidade (1 a 99). Pra tirar o item, use o DELETE.
// ------------------------------------------------------------
router.put('/carrinho/:id/itens/:idProduto', doCliente, async (req, res) => {
    const idCliente = Number(req.params.id);
    const idProduto = inteiroPositivo(req.params.idProduto);
    const quantidade = inteiroPositivo((req.body || {}).quantidade);

    if (!idProduto) {
        return res.status(400).json({ resposta: 'Produto inválido.' });
    }
    if (!quantidade || quantidade > LIMITE_POR_ITEM) {
        return res.status(400).json({ resposta: `A quantidade precisa ser um número de 1 a ${LIMITE_POR_ITEM}. Pra tirar o item, use o botão de remover.` });
    }

    try {
        // Confere antes de atualizar: o affectedRows do UPDATE depende da
        // configuração do driver quando o valor novo é igual ao antigo.
        const [existe] = await pool.query(
            'SELECT 1 FROM CARRINHO_ITEM WHERE ID_CLIENTE = ? AND ID_PRODUTO = ?',
            [idCliente, idProduto]
        );
        if (existe.length === 0) {
            return res.status(404).json({ resposta: 'Esse produto não está no seu carrinho.' });
        }

        await pool.query(
            'UPDATE CARRINHO_ITEM SET QUANTIDADE = ? WHERE ID_CLIENTE = ? AND ID_PRODUTO = ?',
            [quantidade, idCliente, idProduto]
        );

        res.json({ resposta: 'Quantidade atualizada.', ...(await lerCarrinho(pool, idCliente)) });
    } catch (error) {
        responderErro(res, error, 'PUT /carrinho/:id/itens/:idProduto');
    }
});

// ------------------------------------------------------------
// TIRAR UM ITEM DO CARRINHO
// Idempotente: se o item já não estava lá (duplo clique, outra aba), responde
// OK do mesmo jeito, com o carrinho como ele está agora.
// ------------------------------------------------------------
router.delete('/carrinho/:id/itens/:idProduto', doCliente, async (req, res) => {
    const idCliente = Number(req.params.id);
    const idProduto = inteiroPositivo(req.params.idProduto);

    if (!idProduto) {
        return res.status(400).json({ resposta: 'Produto inválido.' });
    }

    try {
        await pool.query(
            'DELETE FROM CARRINHO_ITEM WHERE ID_CLIENTE = ? AND ID_PRODUTO = ?',
            [idCliente, idProduto]
        );
        res.json({ resposta: 'Produto removido do carrinho.', ...(await lerCarrinho(pool, idCliente)) });
    } catch (error) {
        responderErro(res, error, 'DELETE /carrinho/:id/itens/:idProduto');
    }
});

// ------------------------------------------------------------
// ESVAZIAR O CARRINHO
// ------------------------------------------------------------
router.delete('/carrinho/:id', doCliente, async (req, res) => {
    const idCliente = Number(req.params.id);
    try {
        await pool.query('DELETE FROM CARRINHO_ITEM WHERE ID_CLIENTE = ?', [idCliente]);
        res.json({ resposta: 'Carrinho esvaziado.', ...(await lerCarrinho(pool, idCliente)) });
    } catch (error) {
        responderErro(res, error, 'DELETE /carrinho/:id');
    }
});

// ------------------------------------------------------------
// FINALIZAR COMPRA
// Corpo: id_endereco (um endereço DO PRÓPRIO cliente), forma_pagamento
//        (pix | cartao_credito | cartao_debito | boleto)
//
// Tudo numa transação: cria a COMPRA, grava cada item em POSSUI com o preço
// do momento (VALOR_UNITARIO — se a loja mudar o preço depois, o histórico
// não muda) e esvazia o carrinho. Se qualquer passo falhar, nada fica pela metade.
//
// Ainda não há cobrança nem controle de estoque: o pedido só é registrado.
// ------------------------------------------------------------
router.post('/carrinho/:id/finalizar', doCliente, async (req, res) => {
    const idCliente = Number(req.params.id);
    const corpo = req.body || {};
    const idEndereco = inteiroPositivo(corpo.id_endereco);
    const chavePagamento = String(corpo.forma_pagamento ?? '');

    if (!idEndereco) {
        return res.status(400).json({ resposta: 'Escolha o endereço de entrega.' });
    }
    if (!Object.prototype.hasOwnProperty.call(FORMAS_PAGAMENTO, chavePagamento)) {
        return res.status(400).json({ resposta: 'Escolha uma forma de pagamento válida.' });
    }

    let conexao;
    try {
        conexao = await pool.getConnection();
        await conexao.beginTransaction();

        // O endereço tem que ser do cliente logado (não dá pra entregar no endereço de outro).
        const [endereco] = await conexao.query(
            'SELECT ID FROM ENDERECO WHERE ID = ? AND ID_CLIENTE = ?',
            [idEndereco, idCliente]
        );
        if (endereco.length === 0) {
            await conexao.rollback();
            return res.status(400).json({ resposta: 'Endereço de entrega inválido. Escolha um dos seus endereços.' });
        }

        const carrinho = await lerCarrinho(conexao, idCliente);
        if (carrinho.itens.length === 0) {
            await conexao.rollback();
            return res.status(400).json({ resposta: 'Seu carrinho está vazio (ou os produtos saíram da vitrine).' });
        }

        const [compra] = await conexao.query(
            `INSERT INTO COMPRA (ID_CLIENTE, ID_ENDERECO, FORMA_PAGAMENTO, VALOR_INICIAL)
             VALUES (?, ?, ?, ?)`,
            [idCliente, idEndereco, FORMAS_PAGAMENTO[chavePagamento], carrinho.total]
        );

        const linhas = carrinho.itens.map((item) => [compra.insertId, item.ID_PRODUTO, item.PRECO, item.QUANTIDADE]);
        await conexao.query(
            'INSERT INTO POSSUI (ID_COMPRA, ID_PRODUTO, VALOR_UNITARIO, QUANTIDADE) VALUES ?',
            [linhas]
        );

        // Apaga TODAS as linhas do carrinho (inclusive de produtos que saíram da vitrine).
        await conexao.query('DELETE FROM CARRINHO_ITEM WHERE ID_CLIENTE = ?', [idCliente]);

        await conexao.commit();
        res.status(201).json({
            resposta: 'Pedido realizado com sucesso!',
            id_compra: compra.insertId,
            total: carrinho.total,
            quantidade_total: carrinho.quantidade_total,
            forma_pagamento: FORMAS_PAGAMENTO[chavePagamento]
        });
    } catch (error) {
        if (conexao) {
            try { await conexao.rollback(); } catch (_) { /* conexão já caiu, sem problema */ }
        }
        responderErro(res, error, 'POST /carrinho/:id/finalizar');
    } finally {
        if (conexao) conexao.release();
    }
});

module.exports = router;
