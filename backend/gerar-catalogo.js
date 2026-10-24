/**
 * Gera:
 *  1) database/migrations/005_catalogo_completo.sql  (lojas + 50 produtos/categoria)
 *  2) Dados usados pelo seed de fotos
 *
 * Uso: node gerar-catalogo.js
 */
const fs = require('fs');
const path = require('path');

const CATEGORIAS = [
  'Processadores',
  'Placas de Vídeo',
  'Memória RAM',
  'Armazenamento',
  'Placas-mãe',
  'Fontes',
  'Periféricos',
  'Acessórios'
];

const LOJAS = [
  {
    nome: 'Pichau',
    cnpj: '11.111.111/0001-11',
    endereco: 'Rua Hardware, 100 - Joinville - SC',
    celular: '47999991111',
    email: 'parceiro@pichau.com.br',
    // senha123
    senha: '$2b$10$bK2yK21Q4FUxfRHr6jncB.H.00oURgsM4XgzDRFmauUhHKbC0rF5u'
  },
  {
    nome: 'Kabum',
    cnpj: '22.222.222/0001-22',
    endereco: 'Av. Tecnologia, 200 - São Paulo - SP',
    celular: '11999992222',
    email: 'parceiro@kabum.com.br',
    senha: '$2b$10$bK2yK21Q4FUxfRHr6jncB.H.00oURgsM4XgzDRFmauUhHKbC0rF5u'
  },
  {
    nome: 'Terabyte',
    cnpj: '33.333.333/0001-33',
    endereco: 'Rua dos Processadores, 300 - Curitiba - PR',
    celular: '41999993333',
    email: 'parceiro@terabyte.com.br',
    senha: '$2b$10$bK2yK21Q4FUxfRHr6jncB.H.00oURgsM4XgzDRFmauUhHKbC0rF5u'
  }
];

// Templates por categoria (nome base + variações)
const TEMPLATES = {
  'Processadores': {
    bases: [
      'Intel Core i3-12100F', 'Intel Core i5-12400F', 'Intel Core i5-13400F', 'Intel Core i5-14400F',
      'Intel Core i5-14600K', 'Intel Core i7-12700F', 'Intel Core i7-13700K', 'Intel Core i7-14700K',
      'Intel Core i9-12900K', 'Intel Core i9-13900K', 'Intel Core i9-14900K',
      'AMD Ryzen 3 4100', 'AMD Ryzen 5 5500', 'AMD Ryzen 5 5600', 'AMD Ryzen 5 5600X',
      'AMD Ryzen 5 7600', 'AMD Ryzen 5 7600X', 'AMD Ryzen 7 5700X', 'AMD Ryzen 7 5800X',
      'AMD Ryzen 7 7700', 'AMD Ryzen 7 7700X', 'AMD Ryzen 9 5900X', 'AMD Ryzen 9 7900X',
      'AMD Ryzen 9 7950X', 'Intel Core Ultra 5 245K', 'Intel Core Ultra 7 265K'
    ],
    desc: (n) => `Processador ${n}. Ideal para jogos e produtividade. Garantia do fabricante.`,
    preco: (i) => +(800 + (i % 40) * 55 + (i % 7) * 30).toFixed(2)
  },
  'Placas de Vídeo': {
    bases: [
      'GTX 1650 4GB', 'RTX 3050 8GB', 'RTX 3060 12GB', 'RTX 4060 8GB', 'RTX 4060 Ti 8GB',
      'RTX 4070 12GB', 'RTX 4070 Super 12GB', 'RTX 4070 Ti 12GB', 'RTX 4080 16GB', 'RTX 4090 24GB',
      'RX 6500 XT 4GB', 'RX 6600 8GB', 'RX 6700 XT 12GB', 'RX 7600 8GB', 'RX 7700 XT 12GB',
      'RX 7800 XT 16GB', 'RX 7900 XT 20GB', 'RX 7900 XTX 24GB', 'Arc A750 8GB', 'Arc A770 16GB',
      'RTX 4050 Laptop 6GB', 'RTX 4060 Ti 16GB', 'RTX 4070 Ti Super 16GB', 'RX 6800 16GB', 'RTX 3080 10GB'
    ],
    desc: (n) => `Placa de vídeo ${n}. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.`,
    preco: (i) => +(1200 + (i % 45) * 120 + (i % 5) * 80).toFixed(2)
  },
  'Memória RAM': {
    bases: [
      '8GB DDR4 3200MHz', '16GB DDR4 3200MHz', '32GB DDR4 3200MHz', '16GB DDR4 3600MHz',
      '32GB DDR4 3600MHz', '8GB DDR5 4800MHz', '16GB DDR5 5200MHz', '16GB DDR5 5600MHz',
      '32GB DDR5 5600MHz', '32GB DDR5 6000MHz', '64GB DDR5 5600MHz', '16GB DDR5 6000MHz CL30',
      '32GB DDR5 6400MHz', '2x8GB DDR4 3200 RGB', '2x16GB DDR4 3600 RGB', '2x16GB DDR5 6000 RGB',
      '64GB DDR4 3200MHz', '8GB DDR4 2666MHz', '16GB DDR4 2666MHz', '48GB DDR5 5600MHz'
    ],
    desc: (n) => `Memória ${n}. Compatível com plataformas modernas. Testada e aprovada.`,
    preco: (i) => +(180 + (i % 30) * 25 + (i % 4) * 15).toFixed(2)
  },
  'Armazenamento': {
    bases: [
      'SSD SATA 480GB', 'SSD SATA 1TB', 'SSD NVMe 500GB Gen3', 'SSD NVMe 1TB Gen3',
      'SSD NVMe 1TB Gen4', 'SSD NVMe 2TB Gen4', 'SSD NVMe 500GB Gen4', 'SSD NVMe 4TB Gen4',
      'HD 1TB 7200RPM', 'HD 2TB 7200RPM', 'HD 4TB', 'SSD Externo 1TB USB-C',
      'SSD NVMe 2TB Gen5', 'SSD SATA 240GB', 'SSD NVMe 250GB', 'Cartão MicroSD 128GB',
      'Cartão MicroSD 256GB', 'Pendrive 128GB USB 3.2', 'SSD Portátil 2TB', 'HD Externo 5TB'
    ],
    desc: (n) => `${n}. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.`,
    preco: (i) => +(150 + (i % 35) * 35 + (i % 6) * 20).toFixed(2)
  },
  'Placas-mãe': {
    bases: [
      'B550M Gaming', 'B650M WiFi', 'X670E Gaming', 'Z790 DDR5', 'B760M WiFi',
      'A520M', 'B450M', 'X570S', 'H610M', 'B660M', 'Z690', 'B650 Aorus',
      'MAG B550 Tomahawk', 'TUF Gaming B650', 'Prime B760M', 'ROG Strix B550-F',
      'ProArt X670E', 'MPG Z790 Edge', 'Steel Legend B650', 'Gaming Plus B550'
    ],
    desc: (n) => `Placa-mãe ${n}. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.`,
    preco: (i) => +(550 + (i % 30) * 45 + (i % 5) * 25).toFixed(2)
  },
  'Fontes': {
    bases: [
      'Fonte 450W 80 Plus', 'Fonte 500W 80 Plus Bronze', 'Fonte 550W 80 Plus Bronze',
      'Fonte 650W 80 Plus Bronze', 'Fonte 650W 80 Plus Gold', 'Fonte 750W 80 Plus Gold',
      'Fonte 850W 80 Plus Gold', 'Fonte 1000W 80 Plus Gold', 'Fonte 750W Modular Gold',
      'Fonte 850W Modular Platinum', 'Fonte 550W Full Modular', 'Fonte 650W Semi Modular',
      'Fonte 1200W 80 Plus Platinum', 'Fonte 450W PFC Ativo', 'Fonte 500W White',
      'Fonte 600W Bronze', 'Fonte 700W Gold', 'Fonte 800W Gold Modular', 'Fonte 900W Platinum',
      'Fonte 1050W Titanium'
    ],
    desc: (n) => `${n}. Proteções OVP/UVP/SCP. Cabos com boa organização.`,
    preco: (i) => +(220 + (i % 28) * 40 + (i % 5) * 20).toFixed(2)
  },
  'Periféricos': {
    bases: [
      'Teclado Mecânico Red Switch', 'Teclado Mecânico Blue Switch', 'Teclado Membrana RGB',
      'Mouse Gamer 16000 DPI', 'Mouse Gamer Wireless', 'Mousepad Grande RGB',
      'Headset 7.1 USB', 'Headset Wireless', 'Webcam Full HD 1080p', 'Webcam 4K',
      'Microfone USB Condensador', 'Caixa de Som 2.1', 'Controle Xbox Series',
      'Controle PS5 DualSense', 'Teclado 60% RGB', 'Mouse Ergonômico Vertical',
      'Combo Teclado + Mouse', 'Headset Drivers 50mm', 'Mousepad XXL', 'Teclado Numpad'
    ],
    desc: (n) => `${n}. Conforto e precisão para uso diário e jogos.`,
    preco: (i) => +(80 + (i % 25) * 22 + (i % 6) * 12).toFixed(2)
  },
  'Acessórios': {
    bases: [
      'Cooler CPU Torre Dual Fan', 'Water Cooler 240mm', 'Water Cooler 360mm',
      'Cooler Box Intel', 'Pasta Térmica 4g', 'Cabo DisplayPort 2m',
      'Cabo HDMI 2.1 2m', 'Hub USB 3.0 4 portas', 'Adaptador USB-C Hub',
      'Suporte Monitor Articulado', 'Filtro de Linha 6 tomadas', 'LED RGB Fita 5m',
      'Controladora RGB', 'Ventoinha 120mm RGB', 'Kit 3 Fans 120mm',
      'Cabo SATA 3.0', 'Extensor PCIe Riser', 'Base Notebook Cooler',
      'Organizador de Cabos', 'Kit Limpeza PC'
    ],
    desc: (n) => `${n}. Complemento essencial para montagem e manutenção do PC.`,
    preco: (i) => +(35 + (i % 30) * 18 + (i % 7) * 10).toFixed(2)
  }
};

function gerarProdutos() {
  const produtos = [];
  let idSeq = 1;

  for (const cat of CATEGORIAS) {
    const t = TEMPLATES[cat];
    const bases = t.bases;
    for (let i = 0; i < 50; i++) {
      const base = bases[i % bases.length];
      const variante = i < bases.length ? '' : ` Ed. ${Math.floor(i / bases.length) + 1}`;
      const nome = `${base}${variante}`.slice(0, 150);
      const lojaIdx = i % LOJAS.length;
      produtos.push({
        idLocal: idSeq++,
        categoria: cat,
        nome,
        descricao: t.desc(base).slice(0, 255),
        preco: t.preco(i),
        lojaEmail: LOJAS[lojaIdx].email,
        caminho: `catalogo/${cat.toLowerCase().replace(/\s+/g, '-')}/${i + 1}.jpg`
      });
    }
  }
  return produtos;
}

function escSql(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "''");
}

function gerarSql(produtos) {
  const lines = [];
  lines.push('-- ============================================================');
  lines.push('-- MIGRAÇÃO 005 — Catálogo completo (50 produtos por categoria)');
  lines.push('-- Lojas parceiras: Pichau, Kabum, Terabyte');
  lines.push('-- Fotos: preenchidas depois pelo script seed-fotos-catalogo.js');
  lines.push('-- Idempotente: só insere se ainda não existir (por e-mail da loja / nome+loja)');
  lines.push('-- ============================================================');
  lines.push('');
  lines.push('USE pc_forge;');
  lines.push('');

  // Lojas
  for (const l of LOJAS) {
    lines.push(`INSERT INTO LOJA (NOME, CNPJ, ENDERECO, CELULAR, EMAIL, SENHA, DESCRICAO)`);
    lines.push(`SELECT '${escSql(l.nome)}', '${escSql(l.cnpj)}', '${escSql(l.endereco)}', '${escSql(l.celular)}', '${escSql(l.email)}', '${l.senha}', 'Loja parceira oficial no PC Forge.'`);
    lines.push(`FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM LOJA WHERE EMAIL = '${escSql(l.email)}');`);
    lines.push('');
  }

  // Produtos — um INSERT por produto com WHERE NOT EXISTS (nome + loja)
  lines.push('-- Produtos (50 por categoria)');
  for (const p of produtos) {
    lines.push(`INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)`);
    lines.push(`SELECT L.ID, '${escSql(p.nome)}', '${escSql(p.descricao)}', '${escSql(p.categoria)}', ${p.preco}, '${escSql(p.caminho)}', 1, 1`);
    lines.push(`FROM LOJA L WHERE L.EMAIL = '${escSql(p.lojaEmail)}'`);
    lines.push(`AND NOT EXISTS (`);
    lines.push(`  SELECT 1 FROM PRODUTO P WHERE P.NOME = '${escSql(p.nome)}' AND P.ID_LOJA = L.ID`);
    lines.push(`);`);
    lines.push('');
  }

  lines.push('-- Fim da migração 005');
  return lines.join('\n');
}

const produtos = gerarProdutos();
const sql = gerarSql(produtos);
const outSql = path.join(__dirname, '..', 'database', 'migrations', '005_catalogo_completo.sql');
fs.writeFileSync(outSql, sql, 'utf8');

const meta = {
  categorias: CATEGORIAS,
  totalProdutos: produtos.length,
  lojas: LOJAS.map((l) => l.email)
};
fs.writeFileSync(
  path.join(__dirname, '..', 'database', 'catalogo-meta.json'),
  JSON.stringify(meta, null, 2),
  'utf8'
);

console.log(`OK: ${produtos.length} produtos (${CATEGORIAS.length} categorias × 50)`);
console.log(`SQL: ${outSql}`);
console.log(`Tamanho SQL: ${(Buffer.byteLength(sql) / 1024).toFixed(1)} KB`);
