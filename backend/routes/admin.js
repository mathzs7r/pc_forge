const express = require('express');
const router = express.Router();
const pool = require('../db');
const { autenticar, exigirAdmin } = require('../utils/auth');
const { traduzirErro } = require('../utils/erros');

// Todas as rotas de admin exigem login + papel admin
router.use(autenticar, exigirAdmin);

// GET /admin/dashboard — resumo geral
router.get('/admin/dashboard', async (req, res) => {
    try {
        const [[{ totalClientes }]] = await pool.query('SELECT COUNT(*) AS totalClientes FROM CLIENTE');
        const [[{ totalLojas }]] = await pool.query('SELECT COUNT(*) AS totalLojas FROM LOJA');
        const [[{ totalProdutos }]] = await pool.query('SELECT COUNT(*) AS totalProdutos FROM PRODUTO WHERE EXCLUIDO = 0 OR EXCLUIDO IS NULL');
        const [[{ totalPedidos }]] = await pool.query('SELECT COUNT(*) AS totalPedidos FROM CARRINHO WHERE STATUS = "finalizado" OR STATUS = "pago"').catch(() => [[{ totalPedidos: 0 }]]);

        res.json({
            totalClientes,
            totalLojas,
            totalProdutos,
            totalPedidos: totalPedidos || 0
        });
    } catch (error) {
        const { status, resposta } = traduzirErro(error);
        res.status(status).json({ resposta });
    }
});

// GET /admin/clientes
router.get('/admin/clientes', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT ID, NOME, EMAIL, CPF, TELEFONE, CRIADO_EM FROM CLIENTE ORDER BY ID DESC LIMIT 200'
        );
        res.json(rows);
    } catch (error) {
        const { status, resposta } = traduzirErro(error);
        res.status(status).json({ resposta });
    }
});

// GET /admin/lojas
router.get('/admin/lojas', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT ID, NOME, EMAIL, CNPJ, TELEFONE, CRIADO_EM FROM LOJA ORDER BY ID DESC LIMIT 200'
        );
        res.json(rows);
    } catch (error) {
        const { status, resposta } = traduzirErro(error);
        res.status(status).json({ resposta });
    }
});

// GET /admin/produtos
router.get('/admin/produtos', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT p.ID, p.NOME, p.PRECO, p.CATEGORIA, p.ESTOQUE, p.EXCLUIDO, l.NOME AS LOJA_NOME
             FROM PRODUTO p
             LEFT JOIN LOJA l ON l.ID = p.LOJA_ID
             ORDER BY p.ID DESC LIMIT 300`
        );
        res.json(rows);
    } catch (error) {
        const { status, resposta } = traduzirErro(error);
        res.status(status).json({ resposta });
    }
});

// PATCH /admin/produtos/:id/restaurar — desfaz exclusão lógica
router.patch('/admin/produtos/:id/restaurar', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const [result] = await pool.query(
            'UPDATE PRODUTO SET EXCLUIDO = 0 WHERE ID = ?', [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ resposta: 'Produto não encontrado' });
        }
        res.json({ resposta: 'Produto restaurado' });
    } catch (error) {
        const { status, resposta } = traduzirErro(error);
        res.status(status).json({ resposta });
    }
});

// DELETE /admin/produtos/:id — exclusão lógica
router.delete('/admin/produtos/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const [result] = await pool.query(
            'UPDATE PRODUTO SET EXCLUIDO = 1 WHERE ID = ?', [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ resposta: 'Produto não encontrado' });
        }
        res.json({ resposta: 'Produto excluído (lógico)' });
    } catch (error) {
        const { status, resposta } = traduzirErro(error);
        res.status(status).json({ resposta });
    }
});

module.exports = router;
