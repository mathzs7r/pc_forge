/**
 * Preenche IMAGEM_URL ou placeholders para produtos do catálogo.
 * Uso: node seed-fotos-catalogo.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');

async function main() {
    const conexao = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'pc_forge',
        port: Number(process.env.DB_PORT) || 3306
    });

    const [produtos] = await conexao.query(
        'SELECT ID, NOME, CATEGORIA FROM PRODUTO WHERE (IMAGEM_URL IS NULL OR IMAGEM_URL = "") AND (IMAGEM IS NULL) LIMIT 500'
    );

    if (!produtos.length) {
        console.log('[seed-fotos] Nenhum produto sem foto. Nada a fazer.');
        await conexao.end();
        return;
    }

    console.log(`[seed-fotos] ${produtos.length} produtos sem foto. Aplicando placeholder...`);

    let ok = 0;
    for (const p of produtos) {
        // Placeholder genérico por categoria (pode trocar por URLs reais depois)
        const url = `https://placehold.co/400x400/1a1a2e/eee?text=${encodeURIComponent((p.CATEGORIA || 'PC').slice(0, 12))}`;
        await conexao.query('UPDATE PRODUTO SET IMAGEM_URL = ? WHERE ID = ?', [url, p.ID]);
        ok++;
    }

    console.log(`[seed-fotos] Pronto: ${ok} produtos atualizados com placeholder.`);
    await conexao.end();
}

main().catch((erro) => {
    console.error('[seed-fotos] Erro:', erro.message);
    process.exit(1);
});
