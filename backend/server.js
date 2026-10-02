const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { traduzirErro } = require('./utils/erros');

const rotasClientes = require('./routes/clientes');
const rotasLojas = require('./routes/lojas');
const rotasProdutos = require('./routes/produtos');

const app = express();
const port = process.env.PORT || 3000;

// CORS antes de tudo, pra o "preflight" (OPTIONS) do navegador sempre passar.
app.use(cors());
app.use(express.json());

app.get('/ola', (req, res) => {
    res.send('Hello World!');
});

// Diagnóstico: abra http://localhost:3000/saude pra ver se a API enxerga o banco.
app.get('/saude', async (req, res) => {
    try {
        const info = await pool.testarConexao();
        const ok = info.faltando.length === 0;
        res.status(ok ? 200 : 503).json({
            api: 'ok',
            banco: ok ? 'ok' : 'conectou, mas faltam tabelas (rode: npm run migrate)',
            ...info
        });
    } catch (error) {
        const { resposta } = traduzirErro(error);
        res.status(503).json({ api: 'ok', banco: 'ERRO', resposta, erro: error.code || error.message });
    }
});

app.use(rotasClientes);
app.use(rotasLojas);
app.use(rotasProdutos);

// Rota que não existe -> JSON claro (em vez do HTML padrão do Express).
app.use((req, res) => {
    res.status(404).json({ resposta: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
});

// Qualquer erro que escapar das rotas (ex: JSON inválido no corpo da requisição).
app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ resposta: 'O corpo da requisição não é um JSON válido. Confira vírgulas e aspas.' });
    }
    console.error('[erro não tratado]', error);
    res.status(500).json({ resposta: 'Erro interno no servidor.', erro: error.message });
});

const servidor = app.listen(port, async () => {
    console.log(`API rodando na porta: ${port}`);

    if (!fs.existsSync(path.join(__dirname, '.env'))) {
        console.warn('⚠️  Não achei o arquivo backend/.env — usando valores padrão (root, sem senha, banco "pc_forge").');
        console.warn('    Copie o .env.example para .env e coloque a senha do seu MySQL.');
    }

    try {
        const info = await pool.testarConexao();
        console.log(`✅ Conectado ao MySQL — banco "${info.banco}"`);
        if (info.faltando.length > 0) {
            console.warn(`⚠️  Faltam tabelas: ${info.faltando.join(', ')}. Rode "npm run migrate" nesta pasta.`);
        }
    } catch (error) {
        console.error(`❌ Não consegui usar o banco: ${traduzirErro(error).resposta}`);
        console.error(`   (detalhe técnico: ${error.code || error.message})`);
    }
});

servidor.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ A porta ${port} já está em uso (provavelmente outra cópia da API rodando). Feche o outro terminal ou mude PORT no .env.`);
    } else {
        console.error(error);
    }
    process.exit(1);
});

// Rede de segurança: uma promise rejeitada não derruba mais o servidor inteiro.
process.on('unhandledRejection', (motivo) => {
    console.error('[unhandledRejection]', motivo);
});
