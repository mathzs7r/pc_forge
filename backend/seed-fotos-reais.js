/**
 * Tenta buscar fotos reais (ex.: via busca de imagens) para produtos sem foto.
 * Uso: node seed-fotos-reais.js
 * Nota: depende de rede e pode ser lento / rate-limited.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');

const PAUSA_MS = 800;

async function buscarFoto(nome, categoria) {
    // Placeholder de implementação — em produção integre com API de imagens.
    // Retorna null se não achar.
    const q = encodeURIComponent(`${nome} ${categoria || ''} produto`);
    // Exemplo de URL de placeholder contextual
    return `https://placehold.co/400x400/0f3460/eee?text=${encodeURIComponent((nome || 'PC').slice(0, 18))}`;
}

async function main() {
    const conexao = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'pc_forge',
        port: Number(process.env.DB_PORT) || 3306
    });

    const [produtos] = await conexao.query(
        `SELECT ID, NOME, CATEGORIA FROM PRODUTO
         WHERE (IMAGEM_URL IS NULL OR IMAGEM_URL = '' OR IMAGEM_URL LIKE '%placehold%')
           AND (IMAGEM IS NULL)
         LIMIT 200`
    );

    if (!produtos.length) {
        console.log('[seed-reais] Nenhum produto precisando de foto real. Nada a fazer.');
        await conexao.end();
        return;
    }

    console.log(`[seed-reais] ${produtos.length} produtos. Buscando foto...`);

    let ok = 0;
    let falhou = 0;
    for (let i = 0; i < produtos.length; i++) {
        const p = produtos[i];
        try {
            const urlFoto = await buscarFoto(p.NOME, p.CATEGORIA);
            if (urlFoto) {
                await conexao.query('UPDATE PRODUTO SET IMAGEM_URL = ? WHERE ID = ?', [urlFoto, p.ID]);
                ok++;
            } else {
                falhou++;
            }
        } catch (erro) {
            falhou++;
        }
        if ((i + 1) % 25 === 0) {
            console.log(`[seed-reais] ${i + 1}/${produtos.length} — ${ok} ok, ${falhou} falha`);
        }
        await new Promise((r) => setTimeout(r, PAUSA_MS));
    }

    console.log(`[seed-reais] Pronto: ${ok} com foto; ${falhou} sem.`);
    await conexao.end();
}

main().catch((erro) => {
    console.error('[seed-reais] Erro:', erro.message);
    process.exit(1);
});
