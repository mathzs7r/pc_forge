const express = require('express');
const pool = require('../db');
const { gerarHash, conferirSenha } = require('../utils/senha');
const { soDigitos, normalizarEmail, emailValido, semMascara } = require('../utils/documentos');
const { responderErro } = require('../utils/erros');
const { gerarToken } = require('../utils/auth');
const { limitarTentativas } = require('../utils/rateLimit');

const router = express.Router();
// Protege o login contra força bruta: mesmo IP só pode tentar N vezes na janela.
const limitarLogin = limitarTentativas();

// ------------------------------------------------------------
// CADASTRO DE CLIENTE (grava em CLIENTE + ENDERECO, numa transação)
// ------------------------------------------------------------
router.post('/cliente', async (req, res) => {
    const corpo = req.body || {};
    const texto = (v) => String(v ?? '').trim();

    const nome = texto(corpo.nome);
    const cpf = texto(corpo.cpf);
    const email = normalizarEmail(corpo.email);
    const celular = texto(corpo.celular);
    const nascimento = texto(corpo.nascimento);
    const senha = String(corpo.senha ?? '');
    const cep = texto(corpo.cep);
    const rua = texto(corpo.rua);
    const numero = texto(corpo.numero);
    const bairro = texto(corpo.bairro);
    const cidade = texto(corpo.cidade);
    const uf = texto(corpo.uf).toUpperCase();

    if (!nome || !cpf || !email || !celular || !nascimento || !senha ||
        !cep || !rua || !numero || !bairro || !cidade || !uf) {
        return res.status(400).json({ resposta: 'Todos os campos são obrigatórios.' });
    }
    if (soDigitos(cpf).length !== 11) {
        return res.status(400).json({ resposta: 'CPF inválido: precisa ter 11 números.' });
    }
    if (!emailValido(email)) {
        return res.status(400).json({ resposta: 'E-mail inválido.' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nascimento) || Number.isNaN(Date.parse(nascimento))) {
        return res.status(400).json({ resposta: 'Data de nascimento inválida (use o formato AAAA-MM-DD).' });
    }
    if (uf.length !== 2) {
        return res.status(400).json({ resposta: 'Estado (UF) precisa ter 2 letras.' });
    }
    if (senha.length < 8) {
        return res.status(400).json({ resposta: 'A senha precisa ter pelo menos 8 caracteres.' });
    }

    let conexao;
    try {
        // getConnection agora fica DENTRO do try: antes, se o banco estivesse
        // fora do ar ou com senha errada, o erro escapava, virava "unhandled
        // rejection" e derrubava o servidor inteiro.
        conexao = await pool.getConnection();
        await conexao.beginTransaction();

        const [existentes] = await conexao.query(
            `SELECT ID FROM CLIENTE WHERE EMAIL = ? OR ${semMascara('CPF')} = ?`,
            [email, soDigitos(cpf)]
        );
        if (existentes.length > 0) {
            await conexao.rollback();
            return res.status(409).json({ resposta: 'CPF ou e-mail já cadastrado.' });
        }

        const senhaHash = await gerarHash(senha);

        const [resultadoCliente] = await conexao.query(
            `INSERT INTO CLIENTE (NOME, CPF, EMAIL, CELULAR, NASCIMENTO, SENHA)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nome, cpf, email, celular, nascimento, senhaHash]
        );
        const idCliente = resultadoCliente.insertId;

        await conexao.query(
            `INSERT INTO ENDERECO (ID_CLIENTE, CEP, RUA, NUMERO, BAIRRO, CIDADE, ESTADO)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [idCliente, cep, rua, numero, bairro, cidade, uf]
        );

        await conexao.commit();
        res.status(201).json({ resposta: 'Cliente cadastrado com sucesso!', id: idCliente });
    } catch (error) {
        if (conexao) {
            try { await conexao.rollback(); } catch (_) { /* conexão já caiu, sem problema */ }
        }
        responderErro(res, error, 'POST /cliente');
    } finally {
        if (conexao) conexao.release();
    }
});

// ------------------------------------------------------------
// LOGIN DE CLIENTE (email ou CPF + senha)
// ------------------------------------------------------------
router.post('/login', limitarLogin, async (req, res) => {
    const { identificador, senha } = req.body || {};

    if (!identificador || !senha) {
        return res.status(400).json({ resposta: 'Informe e-mail/CPF e senha.' });
    }

    try {
        const ident = String(identificador).trim();
        let linhas = [];

        if (ident.includes('@')) {
            [linhas] = await pool.query(
                'SELECT ID, NOME, EMAIL, CPF, SENHA FROM CLIENTE WHERE EMAIL = ?',
                [normalizarEmail(ident)]
            );
        } else if (soDigitos(ident).length > 0) {
            // CPF com ou sem pontos/traço funciona igual.
            [linhas] = await pool.query(
                `SELECT ID, NOME, EMAIL, CPF, SENHA FROM CLIENTE WHERE ${semMascara('CPF')} = ?`,
                [soDigitos(ident)]
            );
        }

        if (linhas.length === 0) {
            return res.status(401).json({ resposta: 'Usuário ou senha inválidos.' });
        }

        const cliente = linhas[0];
        const senhaValida = await conferirSenha(senha, cliente.SENHA);

        if (!senhaValida) {
            return res.status(401).json({ resposta: 'Usuário ou senha inválidos.' });
        }

        // "token": prova de login que o front manda nas rotas de carrinho e perfil
        // (veja utils/auth.js). Quem não mandou token não acessa essas rotas.
        res.status(200).json({
            resposta: 'Login realizado com sucesso!',
            cliente: { id: cliente.ID, nome: cliente.NOME, email: cliente.EMAIL },
            token: gerarToken('cliente', cliente.ID)
        });
    } catch (error) {
        responderErro(res, error, 'POST /login');
    }
});

// NOTA: as antigas rotas GET/DELETE /cliente/:cpf foram removidas de propósito.
// Elas não exigiam login: qualquer pessoa podia ver os dados pessoais de um
// cliente (nome, e-mail, celular, nascimento) informando só o CPF — e até
// APAGAR a conta dele. Tudo que esse cliente precisa hoje está em /perfil
// (rotas de perfil.js, que exigem o token de sessão e conferem o dono).

module.exports = router;
