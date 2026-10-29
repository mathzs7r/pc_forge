const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { migrar } = require('./migration');
const { traduzirErro } = require('./utils/erros');
const { segredoTemporario } = require('./utils/auth');

const rotasClientes = require('./routes/clientes');
const rotasLojas = require('./routes/lojas');
const rotasProdutos = require('./routes/produtos');
const rotasCarrinho = require('./routes/carrinho');
const rotasPerfil = require('./routes/perfil');
const rotasAdmin = require('./routes/admin');

const app = express();
const port = process.env.PORT || 3000;

// CORS: por padrão, em desenvolvimento, qualquer origem de localhost vale
// (Live Server, Vite, abrir o HTML pelo file:// etc.). Em publicação de
// verdade, defina ORIGENS_PERMITIDAS no .env (separadas por vírgula,
// ex.: "https://pcforge.seusite.com.br") e a API passa a aceitar SÓ essas
// origens — qualquer outro site não consegue mais ler as respostas.
if (process.env.ORIGENS_PERMITIDAS) {
    const permitidas = process.env.ORIGENS_PERMITIDAS.split(',')
        .map((o) => o.trim().replace(/\/+$/, ''))
        .filter(Boolean);
    app.use(cors({
        origin: (origem, callback) => {
            // Sem Origin = curl/aplicativo/file:// simples: deixa passar.
            if (!origem) return callback(null, true);
            const limpa = origem.replace(/\/+$/, '');
            // localhost sempre vale (diferentes portas do dev na mesma máquina)
            if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(limpa)) return callback(null, true);
            callback(null, permitidas.includes(limpa));
        }
    }));
    console.log(`[api] CORS restrito às origens configuradas (+ localhost). Permitidas: ${permitidas.join(', ') || '(nenhuma além de localhost)'}`);
} else {
    app.use(cors());
    console.warn('[api] CORS aberto (qualquer origem). Ok para desenvolver; em produção defina ORIGENS_PERMITIDAS no .env.');
}

// Headers customizados têm que ser EXPOSTOS, senão o navegador esconde
// mesmo com CORS aberto: o front não leria o X-Resultados-Total (total
// de resultados usado pela vitrine e pelo "Monte seu PC").
app.use((req, res, next) => { res.setHeader('Access-Control-Expose-Headers', 'X-Resultados-Total'); next(); });

// Rotas de produto E de perfil aceitam JSON maior, porque a foto vai junto
// em base64 (5 MB de imagem viram ~6,7 MB de texto). Esse parser tem que
// vir ANTES do express.json() padrão (limite de 100 KB): o primeiro que ler
// o corpo vale. O /perfil entra aqui porque a LOGO da loja é enviada por
// PUT /perfil/loja/:id do mesmo jeito — sem isso, logos acima de ~75 KB
// davam 413 "grande demais" e o upload quebrava.
app.use('/produtos', express.json({ limit: '8mb' }));
app.use('/perfil', express.json({ limit: '8mb' }));
app.use(express.json());

app.get('/ola', (req, res) => {
    res.send('Hello World!');
});

// Diagnóstico: abra http://localhost:3000/saude pra ver se a API enxerga o banco.
app.get('/saude', async (req, res) => {
    try {
        const info = await pool.testarConexao();
        const ok = info.faltando.length === 0 && info.colunasFaltando.length === 0;
        res.status(ok ? 200 : 503).json({
            api: 'ok',
            banco: ok ? 'ok' : 'conectou, mas o banco está desatualizado (rode: npm run migrate)',
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
app.use(rotasCarrinho);
app.use(rotasPerfil);
app.use(rotasAdmin);

// Rota que não existe -> JSON claro (em vez do HTML padrão do Express).
app.use((req, res) => {
    res.status(404).json({ resposta: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
});

// Qualquer erro que escapar das rotas (ex: JSON inválido no corpo da requisição).
app.use((error, req, res, next) => {
    if (error.type === 'entity.too.large') {
        return res.status(413).json({ resposta: 'O envio é grande demais. Use uma foto menor (máximo 5 MB).' });
    }
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ resposta: 'O corpo da requisição não é um JSON válido. Confira vírgulas e aspas.' });
    }
    console.error('[erro não tratado]', error);
    res.status(500).json({ resposta: 'Erro interno no servidor.', erro: error.message });
});

// Antes de abrir a porta, roda a migração: garante banco atualizado mesmo
// que alguém suba a API sem passar pelo "npm run migrate" (o que estava
// antes desacoplado agora é automático em qualquer forma de start).
async function iniciar() {
    console.log('[api] Verificando/atualizando o banco de dados...');
    const bancoPronto = await migrar();
    if (!bancoPronto) {
        console.error('[api] Não subi a API porque a migração do banco falhou. Corrija o problema acima e tente de novo.');
        process.exit(1);
    }
    const servidor = app.listen(port, async () => {
    console.log(`API rodando na porta: ${port}`);

    if (!fs.existsSync(path.join(__dirname, '.env'))) {
        console.warn('⚠️  Não achei o arquivo backend/.env — usando valores padrão (root, sem senha, banco "pc_forge").');
        console.warn('    Copie o .env.example para .env e coloque a senha do seu MySQL.');
    }

    if (segredoTemporario()) {
        console.warn('⚠️  AUTH_SECRET não definido (ou com menos de 16 caracteres) no backend/.env — usando um segredo temporário.');
        console.warn('    Funciona, mas todo mundo precisa entrar de novo toda vez que a API reinicia. Defina AUTH_SECRET no .env.');
    }

    try {
        const info = await pool.testarConexao();
        console.log(`✅ Conectado ao MySQL — banco "${info.banco}"`);
        if (info.faltando.length > 0) {
            console.warn(`⚠️  Faltam tabelas: ${info.faltando.join(', ')}. Rode "npm run migrate" nesta pasta.`);
        }
        if (info.colunasFaltando.length > 0) {
            console.warn(`⚠️  Faltam colunas no banco: ${info.colunasFaltando.join(', ')}. Rode "npm run migrate" nesta pasta (sem isso, fotos, vitrine e perfil da loja não funcionam).`);
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
}

// Rede de segurança: uma promise rejeitada não derruba mais o servidor inteiro.
process.on('unhandledRejection', (motivo) => {
    console.error('[unhandledRejection]', motivo);
});

iniciar();
