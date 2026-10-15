const express = require('express');
const pool = require('../db');
const { gerarHash, conferirSenha } = require('../utils/senha');
const { soDigitos, normalizarEmail, emailValido, semMascara } = require('../utils/documentos');
const { responderErro } = require('../utils/erros');
const { gerarToken } = require('../utils/auth');

const router = express.Router();

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
    if (senha.length < 4) {
        return res.status(400).json({ resposta: 'A senha precisa ter pelo menos 4 caracteres.' });
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
router.post('/loja/login', async (req, res) => {
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
                    (SELECT COUNT(*) FROM PRODUTO P WHERE P.ID_LOJA = L.ID AND P.ATIVO = 1) AS TOTAL_PRODUTOS
             FROM LOJA L WHERE L.ID = ?`,
            [id]
        );
        if (lojas.length === 0) {
            return res.status(404).json({ resposta: 'Loja não encontrada.' });
        }
        res.json({ ...lojas[0], TOTAL_PRODUTOS: Number(lojas[0].TOTAL_PRODUTOS) });
    } catch (error) {
        responderErro(res, error, 'GET /loja/:id/publico');
    }
});

module.exports = router;
