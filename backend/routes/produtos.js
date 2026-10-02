const express = require('express');
const pool = require('../db');
const { responderErro } = require('../utils/erros');

const router = express.Router();

// ------------------------------------------------------------
// LISTAR PRODUTOS (vitrine pública, não exige login)
// ------------------------------------------------------------
router.get('/produtos', async (req, res) => {
    try {
        const [linhas] = await pool.query(
            `SELECT P.ID, P.NOME, P.DESCRICAO, P.CATEGORIA, P.PRECO, P.CAMINHO_IMG,
                    L.NOME AS LOJA_NOME
             FROM PRODUTO P
             JOIN LOJA L ON L.ID = P.ID_LOJA
             WHERE P.ATIVO = 1
             ORDER BY P.ID DESC`
        );
        res.json(linhas);
    } catch (error) {
        responderErro(res, error, 'Erro ao buscar produtos');
    }
});

// ------------------------------------------------------------
// LISTAR PRODUTOS DE UMA LOJA (painel da própria loja)
// ------------------------------------------------------------
router.get('/produtos/loja/:idLoja', async (req, res) => {
    const { idLoja } = req.params;
    try {
        const [linhas] = await pool.query(
            `SELECT ID, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG
             FROM PRODUTO WHERE ID_LOJA = ? AND ATIVO = 1 ORDER BY ID DESC`,
            [idLoja]
        );
        res.json(linhas);
    } catch (error) {
        responderErro(res, error, 'Erro ao buscar produtos da loja');
    }
});

// ------------------------------------------------------------
// CRIAR PRODUTO (loja logada cadastra um produto novo)
// ------------------------------------------------------------
router.post('/produtos', async (req, res) => {
    const { id_loja, nome, descricao, categoria, preco, caminho_img, quantidade_img } = req.body;

    if (!id_loja || !nome || !categoria || !preco) {
        return res.status(400).json({ resposta: 'Loja, nome, categoria e preço são obrigatórios.' });
    }

    try {
        const [lojaExiste] = await pool.query('SELECT ID FROM LOJA WHERE ID = ?', [id_loja]);
        if (lojaExiste.length === 0) {
            return res.status(404).json({ resposta: 'Loja não encontrada. Faça login novamente.' });
        }

        const [resultado] = await pool.query(
            `INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id_loja, nome, descricao || '', categoria, preco, caminho_img || 'placeholder.jpg', quantidade_img || 1]
        );

        res.status(201).json({ resposta: 'Produto cadastrado com sucesso!', id: resultado.insertId });
    } catch (error) {
        responderErro(res, error, 'Erro ao cadastrar produto');
    }
});

// ------------------------------------------------------------
// ALTERAR PRODUTO (a loja só edita produto dela mesma)
// ------------------------------------------------------------
router.put('/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const { id_loja, nome, descricao, categoria, preco, caminho_img, quantidade_img } = req.body;

    if (!id_loja) {
        return res.status(400).json({ resposta: 'Informe a loja dona do produto.' });
    }
    if (!nome || !categoria || !preco) {
        return res.status(400).json({ resposta: 'Nome, categoria e preço são obrigatórios.' });
    }

    try {
        // Confere se o produto existe, está ativo e pertence mesmo a essa loja
        // antes de deixar alterar (evita uma loja editar produto de outra).
        const [produtoExistente] = await pool.query(
            'SELECT ID FROM PRODUTO WHERE ID = ? AND ID_LOJA = ? AND ATIVO = 1',
            [id, id_loja]
        );
        if (produtoExistente.length === 0) {
            return res.status(404).json({ resposta: 'Produto não encontrado ou não pertence a essa loja.' });
        }

        await pool.query(
            `UPDATE PRODUTO
             SET NOME = ?, DESCRICAO = ?, CATEGORIA = ?, PRECO = ?, CAMINHO_IMG = ?, QUANTIDADE_IMG = ?
             WHERE ID = ? AND ID_LOJA = ?`,
            [
                nome,
                descricao || '',
                categoria,
                preco,
                caminho_img || 'placeholder.jpg',
                quantidade_img || 1,
                id,
                id_loja
            ]
        );

        res.json({ resposta: 'Produto atualizado com sucesso!' });
    } catch (error) {
        responderErro(res, error, 'Erro ao atualizar produto');
    }
});

// ------------------------------------------------------------
// EXCLUIR PRODUTO (a loja só apaga produto dela mesma)
//
// Isso é uma exclusão lógica (ATIVO = 0), não um DELETE de verdade.
// Um DELETE de verdade quebraria com erro de chave estrangeira sempre
// que o produto já tivesse sido vendido (ele fica referenciado na
// tabela POSSUI, do histórico de compras). Com ATIVO = 0 o produto some
// da vitrine e do painel da loja, mas o histórico continua íntegro.
// ------------------------------------------------------------
router.delete('/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const { id_loja } = req.body;

    if (!id_loja) {
        return res.status(400).json({ resposta: 'Informe a loja dona do produto.' });
    }

    try {
        const [resultado] = await pool.query(
            'UPDATE PRODUTO SET ATIVO = 0 WHERE ID = ? AND ID_LOJA = ? AND ATIVO = 1',
            [id, id_loja]
        );
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ resposta: 'Produto não encontrado ou não pertence a essa loja.' });
        }
        res.json({ resposta: 'Produto excluído com sucesso.' });
    } catch (error) {
        responderErro(res, error, 'Erro ao excluir produto');
    }
});

module.exports = router;
