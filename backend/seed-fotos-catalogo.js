/**
 * seed-fotos-catalogo.js
 *
 * Gera fotos placeholder (JPEG) para todos os produtos que ainda não têm
 * IMAGEM no banco e grava no BLOB (PRODUTO.IMAGEM / IMAGEM_TIPO).
 *
 * Não precisa de dependências extras: monta um JPEG mínimo válido em memória.
 *
 * Uso:
 *   node seed-fotos-catalogo.js
 *   npm run seed:fotos
 *
 * Rode DEPOIS da migração 005 (npm run migrate ou npm run migrate:seed).
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');

const CORES_POR_CATEGORIA = {
  'Processadores': [11, 20, 38],      // azul escuro
  'Placas de Vídeo': [255, 107, 0],  // laranja
  'Memória RAM': [65, 90, 119],
  'Armazenamento': [40, 167, 69],
  'Placas-mãe': [111, 66, 193],
  'Fontes': [220, 53, 69],
  'Periféricos': [23, 162, 184],
  'Acessórios': [255, 193, 7]
};

/**
 * Gera um JPEG 320x240 bem simples (fundo sólido + "barra" inferior).
 * Não é uma foto realista, mas é um JPEG válido que o navegador exibe
 * e serve perfeitamente para o projeto escolar mostrar TEM_IMAGEM = 1.
 *
 * Estrutura: cabeçalho JPEG mínimo + payload de MCU simplificado.
 * Para robustez usamos um JPEG 1x1 colorido expandido via repetição de
 * quantização — na prática usamos um template JPEG fixo e trocamos
 * bytes de cor no APP0/quantization quando possível.
 *
 * Abordagem mais confiável sem lib: PNG mínimo (mais fácil de montar).
 * O backend aceita PNG (magic bytes verificados em utils/imagem.js).
 */
function gerarPngPlaceholder(r, g, b, largura = 320, altura = 240) {
  // PNG sem compressão complexa: IHDR + IDAT (zlib stored) + IEND
  // Para simplificar ao máximo, usamos um PNG 1x1 e deixamos o CSS do
  // front esticar — ainda assim o <img> funciona e TEM_IMAGEM=1.
  // Melhor: gerar PNG verdadeiro 320x240 com scanlines raw + zlib.

  // Implementação PNG truecolor 320x240 com deflate "stored" blocks
  const { deflateSync } = require('zlib');

  // Raw image data: cada linha = filter byte 0 + RGB * width
  const stride = 1 + largura * 3;
  const raw = Buffer.alloc(stride * altura);
  for (let y = 0; y < altura; y++) {
    const rowStart = y * stride;
    raw[rowStart] = 0; // filter None
    for (let x = 0; x < largura; x++) {
      const i = rowStart + 1 + x * 3;
      // Gradiente leve + faixa inferior com cor mais escura (simula "produto")
      const factor = y > altura * 0.75 ? 0.55 : 0.85 + (x / largura) * 0.15;
      raw[i] = Math.min(255, Math.round(r * factor));
      raw[i + 1] = Math.min(255, Math.round(g * factor));
      raw[i + 2] = Math.min(255, Math.round(b * factor));
    }
  }

  const compressed = deflateSync(raw, { level: 6 });

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let k = 0; k < 8; k++) {
        c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(largura, 0);
  ihdr.writeUInt32BE(altura, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

async function main() {
  const conexao = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD === undefined || process.env.DB_PASSWORD === null ? 'escola' : process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'pc_forge'
  });

  console.log('[seed-fotos] Buscando produtos sem foto...');
  const [semFoto] = await conexao.query(
    `SELECT ID, NOME, CATEGORIA FROM PRODUTO WHERE ATIVO = 1 AND IMAGEM IS NULL`
  );

  if (semFoto.length === 0) {
    console.log('[seed-fotos] Todos os produtos já têm foto. Nada a fazer.');
    await conexao.end();
    return;
  }

  console.log(`[seed-fotos] ${semFoto.length} produtos sem foto. Gerando placeholders...`);

  // Cache por categoria (mesma cor = mesma imagem base, economiza CPU)
  const cachePng = new Map();
  let ok = 0;

  for (const p of semFoto) {
    const cor = CORES_POR_CATEGORIA[p.CATEGORIA] || [11, 20, 38];
    const chave = cor.join(',');
    if (!cachePng.has(chave)) {
      cachePng.set(chave, gerarPngPlaceholder(cor[0], cor[1], cor[2]));
    }
    const png = cachePng.get(chave);

    await conexao.query(
      `UPDATE PRODUTO SET IMAGEM = ?, IMAGEM_TIPO = 'image/png', ATUALIZADO_EM = CURRENT_TIMESTAMP WHERE ID = ?`,
      [png, p.ID]
    );
    ok++;
    if (ok % 50 === 0) console.log(`[seed-fotos] ${ok}/${semFoto.length}...`);
  }

  console.log(`[seed-fotos] Pronto! ${ok} fotos gravadas no BLOB.`);
  await conexao.end();
}

main().catch((err) => {
  console.error('[seed-fotos] Erro:', err.message);
  if (err.code === 'ECONNREFUSED') {
    console.error('MySQL não está rodando. Confira o backend/.env');
  }
  process.exit(1);
});
