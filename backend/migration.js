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

function log(mensagem) {
    console.log(`[migration] ${mensagem}`);
}

async function conectar() {
    return mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'escola',
        multipleStatements: true // schema/migrações têm vários comandos SQL num arquivo só
    });
}

// Os .sql têm "pc_forge" escrito; se o DB_NAME do .env for outro, troca aqui
// pra não criar um banco e depois tentar usar outro.
function prepararSql(sql) {
    return sql
        .replace(/CREATE DATABASE IF NOT EXISTS\s+`?pc_forge`?/gi, `CREATE DATABASE IF NOT EXISTS \`${NOME_BANCO}\``)
        .replace(/^\s*USE\s+`?pc_forge`?\s*;/gim, `USE \`${NOME_BANCO}\`;`);
}

async function rodarArquivoSql(conexao, caminhoArquivo) {
    const sql = prepararSql(fs.readFileSync(caminhoArquivo, 'utf8'));
    await conexao.query(sql);
}

async function garantirTabelaDeControle(conexao) {
    await conexao.query(`
        CREATE TABLE IF NOT EXISTS _MIGRACOES (
            ARQUIVO      VARCHAR(255) PRIMARY KEY,
            APLICADA_EM  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

async function jaFoiAplicada(conexao, nomeArquivo) {
    const [linhas] = await conexao.query(
        'SELECT 1 FROM _MIGRACOES WHERE ARQUIVO = ?',
        [nomeArquivo]
    );
    return linhas.length > 0;
}

async function marcarComoAplicada(conexao, nomeArquivo) {
    await conexao.query(
        'INSERT INTO _MIGRACOES (ARQUIVO) VALUES (?)',
        [nomeArquivo]
    );
}

async function aplicarMigracoesPendentes(conexao) {
    if (!fs.existsSync(MIGRATIONS_DIR)) {
        log('Pasta database/migrations não existe, nada pra aplicar aqui.');
        return;
    }

    const arquivos = fs.readdirSync(MIGRATIONS_DIR)
        .filter((nome) => nome.endsWith('.sql'))
        .sort(); // nomes com prefixo numérico (001_..., 002_...) garantem a ordem certa

    if (arquivos.length === 0) {
        log('Nenhum arquivo de migração encontrado em database/migrations.');
        return;
    }

    for (const arquivo of arquivos) {
        if (await jaFoiAplicada(conexao, arquivo)) {
            log(`- ${arquivo} já tinha sido aplicada, pulando.`);
            continue;
        }

        log(`- aplicando ${arquivo}...`);
        try {
            await rodarArquivoSql(conexao, path.join(MIGRATIONS_DIR, arquivo));
            log(`  ✔ ${arquivo} aplicada.`);
        } catch (erro) {
            // 1060 = coluna duplicada, 1061 = índice duplicado: acontece quando o
            // banco foi criado com o schema.sql novo, que já vem com essa alteração.
            // Não é erro de verdade — só marca como aplicada e segue.
            if (erro.errno === 1060 || erro.errno === 1061) {
                log(`  ✔ ${arquivo}: o schema já tinha essa alteração, marcando como aplicada.`);
            } else {
                throw erro;
            }
        }
        await marcarComoAplicada(conexao, arquivo);
    }
}

async function main() {
    log(`Conectando em ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306} como ${process.env.DB_USER || 'root'}...`);
    let conexao;
    try {
        conexao = await conectar();
    } catch (erro) {
        log(`Não consegui conectar no MySQL: ${erro.message}`);
        if (erro.code === 'ER_ACCESS_DENIED_ERROR') {
            log('Dica: usuário/senha do MySQL errados. Confira DB_USER e DB_PASSWORD no backend/.env.');
        } else if (erro.code === 'ECONNREFUSED') {
            log('Dica: o MySQL não está rodando (ou DB_HOST/DB_PORT estão errados no backend/.env).');
        }
        process.exitCode = 1;
        return;
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
    } catch (erro) {
        log(`Erro ao rodar a migração: ${erro.message}`);
        if (erro.code === 'ER_ACCESS_DENIED_ERROR') {
            log('Dica: usuário/senha do MySQL errados. Confira DB_USER e DB_PASSWORD no backend/.env.');
        } else if (erro.code === 'ECONNREFUSED') {
            log('Dica: o MySQL não está rodando (ou DB_HOST/DB_PORT estão errados no backend/.env).');
        }
        process.exitCode = 1;
    } finally {
        await conexao.end();
    }
}

main();
