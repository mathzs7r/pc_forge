// ============================================================
// ADMINISTRADOR — "Acesso restrito"
//
// O administrador é um (ADM_ID = 1): o que manda em tudo. Ele NÃO
// vê os produtos em si — vê a visão de gestão:
//   * lojas parceiras (quantas são, lista)
//   * clientes (quantos são, lista)
//   * acessos que o site teve (total e hoje)
//   * quantos produtos foram vendidos (e o faturamento)
//
// O login sai do navegador (o modo visualização tinha "adm/1234"
// aberto no front — agora a senha fica SÓ no servidor, como hash).
// O token de sessão é o mesmo HMAC de cliente/loja, com t = "adm".
// ============================================================
const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { responderErro } = require('../utils/erros');
const { exigirLogin, gerarToken } = require('../utils/auth');

const router = express.Router();

// Administrador único: usuario "adm" e a senha "Fa110809" (bcrypt).
// Ela nunca viaja pro navegador — só este hash e a conferência aqui.
const ADMIN_USUARIO = 'adm';
const ADMIN_HASH = '$2a$10$9hvMRKC8yxnDqQwJZupBO.KWX9BLjTrkE2X93vcGaXmxsFxdWdaI.';
const ADMIN_ID = 1;

// As rotas de dados exigem o token do tipo "adm"
const doAdmin = exigirLogin('adm');

// ------------------------------------------------------------
// LOGIN DO ADMINISTRADOR (posta do modal "Acesso restrito")
// ------------------------------------------------------------
router.post('/admin/login', async (req, res) => {
    const { usuario, senha } = req.body || {};

    if (String(usuario ?? '').trim() !== ADMIN_USUARIO ||
        !(await bcrypt.compare(String(senha ?? ''), ADMIN_HASH))) {
        return res.status(401).json({ resposta: 'Usuário ou senha incorretos.' });
    }

    res.json({
        resposta: 'Acesso liberado.',
        admin: { id: ADMIN_ID, nome: 'Administrador' },
        token: gerarToken('adm', ADMIN_ID),
    });
});

// ------------------------------------------------------------
// REGISTRO DE ACESSO (público: a navbar chama a cada carregamento)
// Anônimo: só a página. Erros daqui não podem interromper o strap
// do site, então roda "de preferência" (falha em silêncio).
// ------------------------------------------------------------
router.post('/acesso', async (req, res) => {
    const pagina = String((req.body || {}).pagina ?? '').slice(0, 200) || null;

    try {
        // execute(): mesmo padrão do resto do projeto pra escrita simples
        await pool.execute('INSERT INTO ACESSO_LOG (PAGINA) VALUES (?)', [pagina]);
    } catch (_) {
        // log de acesso falhou? não derruba a página de ninguém
    }
    res.status(201).json({ resposta: 'Acesso registrado.' });
});

// ------------------------------------------------------------
// VISÃO GERAL (números do painel)
// AQUI NÃO TEM PRODUTO: o administrador não operacionaliza o
// catálogo — ele supervisiona parceiros, clientes e métricas.
// ------------------------------------------------------------
router.get('/admin/visao', doAdmin, async (req, res) => {
    try {
        const [[n]] = await pool.query(
            `SELECT
                (SELECT COUNT(*) FROM LOJA)                                        AS LOJAS,
                (SELECT COUNT(*) FROM CLIENTE)                                     AS CLIENTES,
                (SELECT COUNT(*) FROM POSSUI)                                      AS PEDIDOS_ITENS,
                (SELECT COALESCE(SUM(QUANTIDADE), 0) FROM POSSUI)                  AS PRODUTOS_VENDIDOS,
                (SELECT COALESCE(SUM(QUANTIDADE * VALOR_UNITARIO), 0) FROM POSSUI) AS FATURAMENTO,
                (SELECT COUNT(*) FROM ACESSO_LOG)                                  AS ACESSOS_TOTAL,
                (SELECT COUNT(*) FROM ACESSO_LOG WHERE DATA >= CURRENT_DATE)       AS ACESSOS_HOJE,
                (SELECT COUNT(*) FROM ACESSO_LOG WHERE DATA >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS ACESSOS_SEMANA`
        );
        res.json({
            LOJAS: Number(n.LOJAS),
            CLIENTES: Number(n.CLIENTES),
            PRODUTOS_VENDIDOS: Number(n.PRODUTOS_VENDIDOS),
            FATURAMENTO: Number(n.FATURAMENTO),
            ACESSOS_TOTAL: Number(n.ACESSOS_TOTAL),
            ACESSOS_HOJE: Number(n.ACESSOS_HOJE),
            ACESSOS_SEMANA: Number(n.ACESSOS_SEMANA),
        });
    } catch (error) {
        responderErro(res, error, 'GET /admin/visao');
    }
});

// ------------------------------------------------------------
// LOJAS PARCEIRAS (as parcerias da forja)
// ------------------------------------------------------------
router.get('/admin/lojas', doAdmin, async (req, res) => {
    try {
        const [lojas] = await pool.query(
            `SELECT L.ID, L.NOME, L.EMAIL, L.CRIADO_EM,
                    (SELECT COUNT(*) FROM PRODUTO P WHERE P.ID_LOJA = L.ID AND P.ATIVO = 1) AS PRODUTOS_ATIVOS,
                    (SELECT COALESCE(SUM(X.QUANTIDADE), 0)
                       FROM POSSUI X JOIN PRODUTO P ON P.ID = X.ID_PRODUTO
                      WHERE P.ID_LOJA = L.ID) AS VENDIDOS
             FROM LOJA L
             ORDER BY L.ID`
        );
        res.json(lojas);
    } catch (error) {
        responderErro(res, error, 'GET /admin/lojas');
    }
});

// ------------------------------------------------------------
// CLIENTES CADASTRADOS
// ------------------------------------------------------------
router.get('/admin/clientes', doAdmin, async (req, res) => {
    try {
        const [clientes] = await pool.query(
            `SELECT C.ID, C.NOME, C.EMAIL, C.CRIADO_EM,
                    COUNT(DISTINCT CM.ID) AS COMPRAS
             FROM CLIENTE C
             LEFT JOIN COMPRA CM ON CM.ID_CLIENTE = C.ID
             GROUP BY C.ID, C.NOME, C.EMAIL, C.CRIADO_EM
             ORDER BY C.ID`
        );
        res.json(clientes);
    } catch (error) {
        responderErro(res, error, 'GET /admin/clientes');
    }
});

module.exports = router;
