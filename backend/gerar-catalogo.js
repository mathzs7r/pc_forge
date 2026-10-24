/**
 * Gera um catálogo de produtos de exemplo a partir de categorias comuns de PC.
 * Uso: node gerar-catalogo.js
 * (normalmente chamado via npm run gerar:catalogo)
 */
const fs = require('fs');
const path = require('path');

const categorias = {
  'Processador': ['Intel Core i5', 'Intel Core i7', 'AMD Ryzen 5', 'AMD Ryzen 7'],
  'Placa de Vídeo': ['NVIDIA RTX 4060', 'NVIDIA RTX 4070', 'AMD RX 7600'],
  'Memória RAM': ['8GB DDR4', '16GB DDR4', '32GB DDR5'],
  'Armazenamento': ['SSD 480GB', 'SSD 1TB NVMe', 'HD 2TB'],
  'Placa-mãe': ['B550', 'B760', 'X670'],
  'Fonte': ['500W 80 Plus', '650W 80 Plus Bronze', '750W Gold'],
  'Gabinete': ['Mid Tower RGB', 'Mini ITX', 'Full Tower'],
  'Monitor': ['24" 1080p', '27" 1440p 144Hz', '32" 4K']
};

const linhas = [];
let id = 1;
for (const [cat, itens] of Object.entries(categorias)) {
  for (const nome of itens) {
    const preco = (Math.random() * 2000 + 100).toFixed(2);
    linhas.push({
      id,
      nome: `${nome}`,
      categoria: cat,
      preco: Number(preco),
      estoque: Math.floor(Math.random() * 50) + 5
    });
    id++;
  }
}

const out = path.join(__dirname, '..', 'database', 'catalogo-meta.json');
fs.writeFileSync(out, JSON.stringify({ geradoEm: new Date().toISOString(), total: linhas.length, itens: linhas }, null, 2));
console.log(`[gerar-catalogo] ${linhas.length} itens escritos em ${out}`);
