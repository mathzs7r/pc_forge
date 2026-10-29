const express = require('express');
const pool = require('../db');
const { gerarHash, conferirSenha } = require('../utils/senha');
const { soDigitos, normalizarEmail, emailValido, semMascara } = require('../utils/documentos');
const { responderErro } = require('../utils/erros');
const { gerarToken } = require('../utils/auth');
const { limitarTentativas } = require('../utils/rateLimit');

const router = express.Router();
// Protege o login da loja contra força bruta: mesmo IP só pode tentar N vezes na janela.
const limitarLogin = limitarTentativas();

// ------------------------------------------------------------
// CADASTRO DE LOJA (vendedor do marketplace)
// ------------------------------------------------------------
router.post('/loja', async (req, res) => {
    const corpo = req.body || {};
    const texto = (v) => String(v ?? '').trim();

    const nome = texto(corpo.nome);
    const cnpj = texto(corpo.cnpj);
    const endereco = texto(corpo.endereco);
    const email = normalizarEmail(corpo.email);
    const celular = texto(corpo.celular);
    const senha = String(corpo.senha ?? '');

    if (!nome || !cnpj || !endereco || !email || !celular || !senha) {
        return res.status(400).json({ resposta: 'Todos os campos são obrigatórios.' });
    }
    if (soDigitos(cnpj).length !== 14) {
        return res.status(400).json({ resposta: 'CNPJ inválido: precisa ter 14 números.' });
    }
    if (!emailValido(email)) {
        return res.status(400).json({ resposta: 'E-mail inválido.' });
    }
    if (senha.length < 8) {
        return res.status(400).json({ resposta: 'A senha precisa ter pelo menos 8 caracteres.' });
    }

    try {
        const [existentes] = await pool.query(
            `SELECT ID FROM LOJA WHERE EMAIL = ? OR ${semMascara('CNPJ')} = ?`,
            [email, soDigitos(cnpj)]
        );
        if (existentes.length > 0) {
            return res.status(409).json({ resposta: 'CNPJ ou e-mail já cadastrado.' });
        }

        const senhaHash = await gerarHash(senha);

        const [resultado] = await pool.query(
            `INSERT INTO LOJA (NOME, CNPJ, ENDERECO, EMAIL, CELULAR, SENHA)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nome, cnpj, endereco, email, celular, senhaHash]
        );

        res.status(201).json({ resposta: 'Loja cadastrada com sucesso!', id: resultado.insertId });
    } catch (error) {
        responderErro(res, error, 'POST /loja');
    }
});

// ------------------------------------------------------------
// LOGIN DE LOJA (email ou CNPJ + senha)
// ------------------------------------------------------------
router.post('/loja/login', limitarLogin, async (req, res) => {
    const { identificador, senha } = req.body || {};

    if (!identificador || !senha) {
        return res.status(400).json({ resposta: 'Informe e-mail/CNPJ e senha.' });
    }

    try {
        const ident = String(identificador).trim();
        let linhas = [];

        if (ident.includes('@')) {
            [linhas] = await pool.query(
                'SELECT ID, NOME, EMAIL, CNPJ, SENHA FROM LOJA WHERE EMAIL = ?',
                [normalizarEmail(ident)]
            );
        } else if (soDigitos(ident).length > 0) {
            // CNPJ com ou sem pontos/barra/traço funciona igual.
            [linhas] = await pool.query(
                `SELECT ID, NOME, EMAIL, CNPJ, SENHA FROM LOJA WHERE ${semMascara('CNPJ')} = ?`,
                [soDigitos(ident)]
            );
        }

        if (linhas.length === 0) {
            return res.status(401).json({ resposta: 'Usuário ou senha inválidos.' });
        }

        const loja = linhas[0];
        const senhaValida = await conferirSenha(senha, loja.SENHA);

        if (!senhaValida) {
            return res.status(401).json({ resposta: 'Usuário ou senha inválidos.' });
        }

        res.status(200).json({
            resposta: 'Login realizado com sucesso!',
            loja: { id: loja.ID, nome: loja.NOME, email: loja.EMAIL },
            token: gerarToken('loja', loja.ID)
        });
    } catch (error) {
        responderErro(res, error, 'POST /loja/login');
    }
});

// ------------------------------------------------------------
// PÁGINA PÚBLICA DA LOJA (qualquer visitante vê, não exige login)
// Só dados que a loja aceita mostrar: nome, "sobre", desde quando existe e
// quantos produtos tem à venda. CNPJ, e-mail, celular e endereço NÃO saem daqui
// (esses ficam no perfil privado da loja, em GET /perfil/loja/:id).
// ------------------------------------------------------------
router.get('/loja/:id/publico', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ resposta: 'Loja inválida.' });
    }

    try {
        const [lojas] = await pool.query(
            `SELECT L.ID, L.NOME, L.DESCRICAO, L.CRIADO_EM,
                    (SELECT COUNT(*) FROM PRODUTO P WHERE P.ID_LOJA = L.ID AND P.ATIVO = 1) AS TOTAL_PRODUTOS,
                    (SELECT ROUND(AVG(A.NOTA), 1) FROM AVALIACAO A
                        JOIN PRODUTO P2 ON P2.ID = A.ID_PRODUTO
                        WHERE P2.ID_LOJA = L.ID) AS NOTA_MEDIA,
                    (SELECT COUNT(*) FROM AVALIACAO A
                        JOIN PRODUTO P2 ON P2.ID = A.ID_PRODUTO
                        WHERE P2.ID_LOJA = L.ID) AS AVALIACOES_QTD,
                    (L.LOGO IS NOT NULL) AS TEM_LOGO,
                    UNIX_TIMESTAMP(L.LOGO_ATUALIZADO_EM) AS LOGO_VERSAO
             FROM LOJA L WHERE L.ID = ?`,
            [id]
        );
        if (lojas.length === 0) {
            return res.status(404).json({ resposta: 'Loja não encontrada.' });
        }
        res.json({
            ...lojas[0],
            TOTAL_PRODUTOS: Number(lojas[0].TOTAL_PRODUTOS),
            NOTA_MEDIA: lojas[0].NOTA_MEDIA === null ? null : Number(lojas[0].NOTA_MEDIA),
LOGO_VERSAO: Number(lojas[0].LOGO_VERSAO || 0),
                TEM_LOGO: Number(lojas[0].TEM_LOGO || 0),
                AVALIACOES_QTD: Number(lojas[0].AVALIACOES_QTD || 0)
        });
    } catch (error) {
        responderErro(res, error, 'GET /loja/:id/publico');
    }
});

// ------------------------------------------------------------
// AVALIAÇÕES DA LOJA (o que os compradores falaram dos produtos dela)
// Resumo (média + quantas de cada nota) e a lista, mais recente
// primeiro. É o mesmo formato devolvido por GET /produtos/:id/avaliacoes.
// ------------------------------------------------------------
router.get('/loja/:id/avaliacoes', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ resposta: 'Loja inválida.' });
    }

    try {
        const [lojas] = await pool.query('SELECT ID FROM LOJA WHERE ID = ?', [id]);
        if (lojas.length === 0) {
            return res.status(404).json({ resposta: 'Loja não encontrada.' });
        }

        const [resumoLinhas] = await pool.query(
            `SELECT ROUND(AVG(A.NOTA), 1) AS MEDIA, COUNT(*) AS TOTAL,
                    SUM(A.NOTA = 5) AS CINCO, SUM(A.NOTA = 4) AS QUATRO,
                    SUM(A.NOTA = 3) AS TRES, SUM(A.NOTA = 2) AS DOIS, SUM(A.NOTA = 1) AS UM
             FROM AVALIACAO A JOIN PRODUTO P ON P.ID = A.ID_PRODUTO
             WHERE P.ID_LOJA = ?`,
            [id]
        );

        const [lista] = await pool.query(
            `SELECT A.ID, A.NOME_CLIENTE, A.NOTA, A.COMENTARIO,
                    DATE_FORMAT(A.DATA, '%d/%m/%Y') AS DATA_BR,
                    P.NOME AS PRODUTO_NOME, P.ID AS PRODUTO_ID
             FROM AVALIACAO A JOIN PRODUTO P ON P.ID = A.ID_PRODUTO
             WHERE P.ID_LOJA = ?
             ORDER BY A.DATA DESC
             LIMIT 60`,
            [id]
        );

        const r = resumoLinhas[0];
        for (const chave of ['CINCO', 'QUATRO', 'TRES', 'DOIS', 'UM', 'TOTAL']) {
            r[chave] = Number(r[chave] || 0);
        }
        r.MEDIA = r.MEDIA === null ? null : Number(r.MEDIA);

        res.json({ resumo: r, lista });
    } catch (error) {
        responderErro(res, error, 'GET /loja/:id/avaliacoes');
    }
});

// ------------------------------------------------------------
// LOGO DA LOJA (devolve os bytes da imagem guardada no BLOB)
// Usada direto no <img src="http://localhost:3000/loja/1/logo">
// 404 quando a loja não cadastrou logo (o front mostra o fallback).
// ------------------------------------------------------------
router.get('/loja/:id/logo', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ resposta: 'Loja inválida.' });
    }

    try {
        const [linhas] = await pool.query(
            'SELECT LOGO, LOGO_TIPO FROM LOJA WHERE ID = ?',
            [id]
        );
        if (linhas.length === 0 || !linhas[0].LOGO) {
            return res.status(404).json({ resposta: 'Essa loja não tem logo.' });
        }

        res.set('Content-Type', linhas[0].LOGO_TIPO || 'application/octet-stream');
        res.set('X-Content-Type-Options', 'nosniff');
        // A URL leva ?v=<LOGO_VERSAO>, então cada troca de logo gera URL nova
        // e o navegador pode guardar a imagem por um bom tempo.
        res.set('Cache-Control', 'public, max-age=86400');
        res.send(linhas[0].LOGO);
    } catch (error) {
        responderErro(res, error, 'GET /loja/:id/logo');
    }
});

module.exports = router;
