/**
 * seed-fotos-reais.js
 *
 * Preenche PRODUTO.IMAGEM_URL com a foto REAL de cada produto.
 *
 * Fonte: busca de imagens do BING (sem API key) pelo nome do produto
 * ("RTX 4060 8GB GDDR6"). O Bing devolve fotos de lojas/fabricantes do
 * modelo exato (Amazon, fabricante etc.). Cada produto custa 1 requisição.
 *
 * Escolha: mosca por pontuação nos primeiros 35 resultados:
 *   +10 por token do nome do produto aparecendo no título/URL
 *   ("rx", "7600", "8gb"...); exige nota >= 20 (o modelo tem que
 *   aparecer de verdade, senão nunca escolhe foto genérica — logo do
 *   fabricante, artigo de notícia, wallpaper — que seriam "fotos erradas").
 * Filtrados: SVG/logo/favicon + hosts de apresentação/slides junk.
 *
 * Sem candidato decente? Produto fica como está (placeholder/ícone):
 * melhor NADA do que foto do produto errado.
 *
 * Idempotente: rodar de novo só tenta quem ainda não tem IMAGEM_URL.
 * Pausa de 1.5s entre produtos + retry único na consulta.
 *
 * Uso:
 *   node seed-fotos-reais.js              # todos os produtos
 *   node seed-fotos-reais.js --limite 20  # teste nos 20 primeiros
 *   npm run seed:reais
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');

const PAUSA_MS = 1500;

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const HEADERS = {
    'User-Agent': UA,
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
};

// hosts de slides/PDF/artigo — imagem de "material escolar", não de produto
const JUNK_HOSTS = ['slidetodoc', 'scribd', 'coursehero', 'quizlet', 'slideshare', 'desktopnexus', 'wallpaper', 'freepik', 'pinterest'];
const JUNK_EXT = ['.svg', 'favicon', 'sprite', 'blank.gif'];

// marcas: o nome do produto menciona; o fallback (foto "da família") exige
// que a MARCA apareça no candidato, senão é foto errada de 
const MARCAS = ['intel', 'amd', 'nvidia', 'razer', 'logitech', 'kingston', 'corsair',
    'hyperx', 'asus', 'gigabyte', 'msi', 'samsung', 'wd', 'seagate', 'acer', 'dell', 'hp'];

// categoria em inglês — fallback exige categoria no candidato também
const CATEGORIAS_EN = {
    'Processadores': ['processor', 'cpu'],
    'Placas de Vídeo': ['graphics card', 'gpu', 'radeon', 'geforce'],
    'Memória RAM': ['ram', 'memory', 'dimm'],
    'Armazenamento': ['ssd', 'hard drive', 'hdd'],
    'Placas-mãe': ['motherboard', 'mainboard'],
    'Fontes': ['power supply', 'psu'],
    'Periféricos': ['keyboard', 'mouse', 'headset', 'monitor', 'peripheral', 'microphone'],
    'Acessórios': ['cable', 'accessory', 'adapter', 'hub', 'stand', 'fan', 'cooler', 'paste']
};

// ------------------------------------------------------------------
// BING: um fetch por produto; resultados em class="iusc" m="{...}"
// (JSON com aspas escapadas em &quot;)
// ------------------------------------------------------------------
function parseResultadosBing(html) {
    const out = [];
    for (const m of html.matchAll(/class="iusc"[^>]*\sm="([^"]+)"/g)) {
        try {
            const j = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
            if (j.murl) out.push({ titulo: (j.t || '').toLowerCase(), url: j.murl });
        } catch { /* atributo estragado, pula */ }
    }
    return out;
}

async function buscarNoBing(termo) {
    const url = 'https://www.bing.com/images/search?q=' + encodeURIComponent(termo) +
        '&form=HDRSC2&first=1&count=35';
    const r = await fetch(url, {
        headers: HEADERS,
        signal: AbortSignal.timeout(10000)
    });
    if (!r.ok) throw new Error(`Bing respondeu ${r.status}`);
    return parseResultadosBing(await r.text());
}

// ------------------------------------------------------------------
// ESCOLHA: pontuação por número do modelo; exige >= 20 (2 tokens)
// ------------------------------------------------------------------
function escolherMelhorFoto(nome, categoria, resultados) {
    // tokens do modelo: palavras/codes com 2+ caracteres ("rx", "7600", "8gb",
    // "i5", "14400f", "b650m"...); genéricos não contam (estão em qualquer foto)
    const tokens = String(nome).toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ').split(' ')
        .filter((t) => t.length >= 2 && !['intel', 'amd', 'nvidia', 'razer', 'logitech', 'kingston',
            'corsair', 'asus', 'gigabyte', 'msi', 'ed', 'de', 'da', 'do', 'com', 'para'].includes(t));

    // 1ª passada: o NÚMERO do modelo precisa aparecer de verdade
    let melhor = null;
    let melhorNota = 0;
    for (const r of resultados) {
        const src = r.url.toLowerCase();
        if (JUNK_HOSTS.some((h) => src.includes(h))) continue;
        if (JUNK_EXT.some((e) => src.includes(e))) continue;

        let nota = 0;
        for (const t of tokens) {
            if (r.titulo.includes(t) || src.includes(t)) nota += 10;
        }
        if (nota > melhorNota) {
            melhorNota = nota;
            melhor = r.url;
        }
    }
    if (melhorNota >= 20) return melhor;

    // 2ª passada (fallback "família"):Broad quando o modelo exato não tem
    // foto indexada (ex.: SKUs Intel novos). Exige MARCA do produto +
    // termo da categoria no título/URL — foto real da família certa
    // ("Intel" + "processor"), nunca artigo aleatório.
    const nomeBaixo = String(nome).toLowerCase();
    const marcas = MARCAS.filter((m) => nomeBaixo.includes(m));
    const termos = CATEGORIAS_EN[categoria] || [];
    if (marcas.length > 0 && termos.length > 0) {
        let melhorFallback = null;
        let notaFallback = 0;
        for (const r of resultados) {
            const src = r.url.toLowerCase();
            if (JUNK_HOSTS.some((h) => src.includes(h))) continue;
            if (JUNK_EXT.some((e) => src.includes(e))) continue;

            let nota = 0;
            for (const m of marcas) if (r.titulo.includes(m) || src.includes(m)) nota += 10;
            for (const t of termos) if (r.titulo.includes(t) || src.includes(t)) nota += 10;
            if (nota > notaFallback) {
                notaFallback = nota;
                melhorFallback = r.url;
            }
        }
        if (notaFallback >= 20) return melhorFallback;
    }

    return null;
}

async function buscarFoto(nome, categoria) {
    // 2 tentativas pelo Bing (query às vezes volta "vazia"/bot-junk)
    for (let i = 0; i < 2; i++) {
        const resultados = await buscarNoBing(nome);
        const foto = escolherMelhorFoto(nome, categoria, resultados);
        if (foto) return foto;
        await new Promise((res) => setTimeout(res, 1200));
    }
    return null;
}

// ------------------------------------------------------------------
async function main() {
    const args = process.argv;
    const iLimite = args.indexOf('--limite');
    const limiteDesejado = iLimite > -1 ? Number(args[iLimite + 1]) : Infinity;

    const conexao = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD === undefined || process.env.DB_PASSWORD === null ? 'escola' : process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'pc_forge'
    });

    console.log('[seed-reais] Buscando produtos sem IMAGEM_URL...');
    const [produtos] = await conexao.query(
        `SELECT ID, NOME, CATEGORIA FROM PRODUTO
         WHERE ATIVO = 1 AND IMAGEM_URL IS NULL
         ORDER BY ID DESC` + (Number.isFinite(limiteDesejado) ? ` LIMIT ${limiteDesejado}` : '')
    );

    if (produtos.length === 0) {
        console.log('[seed-reais] Todos os produtos já têm foto real (URL). Nada a fazer.');
        await conexao.end();
        return;
    }

    console.log(`[seed-reais] ${produtos.length} produtos. Buscando foto real (Bing Imagens)...`);

    let ok = 0;
    let falhou = 0;
    const falhaLista = [];

    for (let i = 0; i < produtos.length; i++) {
        const p = produtos[i];
        try {
            const urlFoto = await buscarFoto(p.NOME, p.CATEGORIA);
            if (urlFoto) {
                await conexao.query('UPDATE PRODUTO SET IMAGEM_URL = ? WHERE ID = ?', [urlFoto, p.ID]);
                ok++;
            } else {
                falhou++;
                falhaLista.push(`#${p.ID} ${p.NOME}`);
            }
        } catch (erro) {
            falhou++;
            falhaLista.push(`#${p.ID} ${p.NOME} (erro: ${erro.message})`);
        }

        if ((i + 1) % 25 === 0) {
            console.log(`[seed-reais] ${i + 1}/${produtos.length} — ${ok} com foto real, ${falhou} sem...`);
        }
        await new Promise((res) => setTimeout(res, PAUSA_MS));
    }

    console.log(`[seed-reais] Pronto: ${ok} produtos com foto real; ${falhou} sem foto boa.`);
    if (falhaLista.length > 0 && falhaLista.length <= 60) {
        console.log('[seed-reais] Sem foto (ficam como estão):');
        falhaLista.forEach((l) => console.log('  - ' + l));
    } else if (falhaLista.length > 60) {
        console.log(`[seed-reais] ${falhaLista.length} sem foto boa — rode de novo que tentam dinovo (idempotente).`);
    }

    await conexao.end();
}

main().catch((erro) => {
    console.error('[seed-reais] Erro:', erro.message);
    process.exit(1);
});
