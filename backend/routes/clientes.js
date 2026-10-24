const express = require('express');
const pool = require('../db');
const { gerarHash, conferirSenha } = require('../utils/senha');
const { gerarToken, exigirLogin } = require('../utils/auth');
const { normalizarEmail, soDigitos, cpfValido } = require('../utils/documentos');
const { responderErro } = require('../utils/erros');

const router = express.Router();

// POST /clientes — cadastro de cliente
router.post('/clientes', async (req, res) => {
    try {
        const { nome, email, senha, cpf, telefone } = req.body || {};
        if (!nome || !email || !senha) {
            return res.status(400).json({ resposta: 'Nome, e-mail e senha são obrigatórios.' });
        }
        const emailN = normalizarEmail(email);
        const cpfN = soDigitos(cpf);
        if (cpfN && !cpfValido(cpfN)) {
            return res.status(400).json({ resposta: 'CPF inválido.' });
        }
        const hash = await gerarHash(senha);
        const [result] = await pool.query(
            'INSERT INTO CLIENTE (NOME, EMAIL, SENHA, CPF, TELEFONE) VALUES (?, ?, ?, ?, ?)',
            [String(nome).trim(), emailN, hash, cpfN || null, telefone || null]
        );
        const token = gerarToken('cliente', result.insertId);
        res.status(201).json({
            resposta: 'Cliente cadastrado',
            id: result.insertId,
            token,
            cliente: { id: result.insertId, nome: String(nome).trim(), email: emailN }
        });
    } catch (error) {
        responderErro(res, error, 'POST /clientes');
    }
});

// POST /clientes/login
router.post('/clientes/login', async (req, res) => {
    try {
        const { email, senha } = req.body || {};
        if (!email || !senha) {
            return res.status(400).json({ resposta: 'E-mail e senha são obrigatórios.' });
        }
        const emailN = normalizarEmail(email);
        const [rows] = await pool.query(
            'SELECT ID, NOME, EMAIL, SENHA FROM CLIENTE WHERE EMAIL = ? LIMIT 1',
            [emailN]
        );
        if (!rows.length) {
            return res.status(401).json({ resposta: 'E-mail ou senha incorretos.' });
        }
        const c = rows[0];
        const ok = await conferirSenha(senha, c.SENHA);
        if (!ok) {
            return res.status(401).json({ resposta: 'E-mail ou senha incorretos.' });
        }
        const token = gerarToken('cliente', c.ID);
        res.json({
            resposta: 'Login ok',
            token,
            cliente: { id: c.ID, nome: c.NOME, email: c.EMAIL }
        });
    } catch (error) {
        responderErro(res, error, 'POST /clientes/login');
    }
});

module.exports = router;
