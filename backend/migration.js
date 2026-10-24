// ============================================================
// migration.js — deixa o banco em dia com um comando só
// ============================================================
// O que ele faz, em ordem:
//   1. Roda database/schema.sql          (cria o banco e as tabelas,
//                                          se ainda não existirem)
//   2. Roda o que tiver em database/migrations/*.sql, em ordem, mas só
//      os arquivos que ainda não foram aplicados (guarda isso numa
//      tabela de controle, _MIGRACOES, dentro do próprio banco)
//   3. Se você passar --seed, roda também database/seed.sql
//      (dados de teste — não roda por padrão pra não sujar produção)
//
// Como usar:
//   npm start                    -> roda ESTA migração e, só se der certo, sobe a API
//                                   (o mesmo vale pro npm run dev)
//   npm run start:api            -> sobe a API SEM rodar a migração
//   cd backend
//   node migration.js            -> só schema + migrações pendentes
//   node migration.js --seed     -> além disso, popula com dados de teste
//   npm run migrate              -> atalho pro comando acima
//   npm run migrate:seed         -> atalho pro segundo
//
// Se algo der errado, o script termina com código de saída 1 — é isso que faz o
// "npm start" NÃO subir a API com o banco desatualizado.
//
// Precisa de um backend/.env com DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
// (veja o .env.example). É seguro rodar mais de uma vez: schema.sql usa
// "IF NOT EXISTS" e as migrações já aplicadas são puladas.
// ============================================================

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');

const DATABASE_DIR = path.join(__dirname, '..', 'database');
const SCHEMA_PATH = path.join(DATABASE_DIR, 'schema.sql');
const SEED_PATH = path.join(DATABASE_DIR, 'seed.sql');
const MIGRATIONS_DIR = path.join(DATABASE_DIR, 'migrations');
const NOME_BANCO = process.env.DB_NAME || 'pc_forge';
const RODAR_SEED = process.argv.includes('--seed');

function log(msg) {
    console.log(`[migrate] ${msg}`);
}

async function conectarSemBanco() {
    return mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: Number(process.env.DB_PORT) || 3306,
        multipleStatements: true,
        charset: 'utf8mb4'
    });
}

async function rodarArquivoSql(conexao, arquivo) {
    const sql = fs.readFileSync(arquivo, 'utf8');
    if (!sql.trim()) return;
    await conexao.query(sql);
}

async function garantirTabelaDeControle(conexao) {
    await conexao.query(`
        CREATE TABLE IF NOT EXISTS _MIGRACOES (
            id INT AUTO_INCREMENT PRIMARY KEY,
            arquivo VARCHAR(255) NOT NULL UNIQUE,
            aplicada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
}

async function aplicarMigracoesPendentes(conexao) {
    if (!fs.existsSync(MIGRATIONS_DIR)) {
        log('Pasta database/migrations não existe, pulando.');
        return;
    }
    const arquivos = fs.readdirSync(MIGRATIONS_DIR)
        .filter((f) => f.endsWith('.sql'))
        .sort();
    const [aplicadas] = await conexao.query('SELECT arquivo FROM _MIGRACOES');
    const ja = new Set(aplicadas.map((r) => r.arquivo));

    for (const arq of arquivos) {
        if (ja.has(arq)) {
            log(`Já aplicada: ${arq}`);
            continue;
        }
        log(`Aplicando: ${arq}...`);
        const caminho = path.join(MIGRATIONS_DIR, arq);
        await rodarArquivoSql(conexao, caminho);
        await conexao.query('INSERT INTO _MIGRACOES (arquivo) VALUES (?)', [arq]);
        log(`OK: ${arq}`);
    }
}

async function main() {
    let conexao;
    try {
        conexao = await conectarSemBanco();
    } catch (erro) {
        log(`Não consegui conectar no MySQL: ${erro.message}`);
        if (erro.code === 'ER_ACCESS_DENIED_ERROR') {
            log('Dica: usuário/senha do MySQL errados. Confira DB_USER e DB_PASSWORD no backend/.env.');
        } else if (erro.code === 'ECONNREFUSED') {
            log('Dica: o MySQL não está rodando (ou DB_HOST/DB_PORT estão errados no backend/.env).');
        }
        return false;
    }

    try {
        log('Rodando database/schema.sql (cria banco/tabelas que ainda não existirem)...');
        await rodarArquivoSql(conexao, SCHEMA_PATH);

        await conexao.query(`USE \`${NOME_BANCO}\``);

        await garantirTabelaDeControle(conexao);

        log('Verificando migrações pendentes em database/migrations...');
        await aplicarMigracoesPendentes(conexao);

        if (RODAR_SEED) {
            const [jaTemSeed] = await conexao.query(
                "SELECT 1 FROM LOJA WHERE EMAIL = 'contato@pcforge.com'"
            );
            if (jaTemSeed.length > 0) {
                log('Seed já tinha sido aplicado antes (loja contato@pcforge.com existe), pulando.');
            } else {
                log('Rodando database/seed.sql (dados de teste)...');
                await rodarArquivoSql(conexao, SEED_PATH);
            }
        }

        log('Banco de dados pronto! ✅');
        log('Dica: se acabou de aplicar a 005_catalogo_completo.sql, rode "npm run seed:fotos" para gravar as fotos placeholder nos produtos.');
        return true;
    } catch (erro) {
        log(`Erro ao rodar a migração: ${erro.message}`);
        if (erro.code === 'ER_ACCESS_DENIED_ERROR') {
            log('Dica: usuário/senha do MySQL errados. Confira DB_USER e DB_PASSWORD no backend/.env.');
        } else if (erro.code === 'ECONNREFUSED') {
            log('Dica: o MySQL não está rodando (ou DB_HOST/DB_PORT estão errados no backend/.env).');
        }
        return false;
    } finally {
        await conexao.end();
    }
}

if (require.main === module) {
    main().then((ok) => {
        if (!ok) process.exitCode = 1;
    });
}

module.exports = { migrar: main };
