// "Modo visualização": ativado pelo login secreto (clique na logo).
// Deixa navegar pelo site inteiro sem precisar da API/MySQL rodando,
// usando dados de exemplo aqui embaixo em vez de chamar o back-end.
//
// IMPORTANTE: isso não é segurança de verdade. É só uma chave guardada
// no localStorage do navegador, pra facilitar testes locais. Não sirva
// pra proteger nada que importe de verdade.
const CHAVE_MODO_DEMO = 'pcforge_modo_demo';

function estaEmModoDemo() {
    return localStorage.getItem(CHAVE_MODO_DEMO) === 'true';
}

function ativarModoDemo() {
    localStorage.setItem(CHAVE_MODO_DEMO, 'true');
}

function sairDoModoDemo() {
    localStorage.removeItem(CHAVE_MODO_DEMO);
}

// Produtos de exemplo — peças e acessórios de TI
const PRODUTOS_DEMO = [
    { ID: 1, NOME: 'Intel Core i5-14400F', CATEGORIA: 'Processadores', PRECO: 1299.90, LOJA_NOME: 'Loja Exemplo PC Forge' },
    { ID: 2, NOME: 'AMD Ryzen 5 7600', CATEGORIA: 'Processadores', PRECO: 1499.90, LOJA_NOME: 'Loja Exemplo PC Forge' },
    { ID: 3, NOME: 'RTX 4060 8GB GDDR6', CATEGORIA: 'Placas de Vídeo', PRECO: 1899.90, LOJA_NOME: 'Loja Exemplo PC Forge' },
    { ID: 4, NOME: 'RX 7600 8GB', CATEGORIA: 'Placas de Vídeo', PRECO: 1699.90, LOJA_NOME: 'Loja Exemplo PC Forge' },
    { ID: 5, NOME: 'Memória RAM 16GB DDR5 5600MHz', CATEGORIA: 'Memória RAM', PRECO: 449.90, LOJA_NOME: 'Loja Exemplo PC Forge' },
    { ID: 6, NOME: 'SSD NVMe 1TB Gen4', CATEGORIA: 'Armazenamento', PRECO: 399.90, LOJA_NOME: 'Loja Exemplo PC Forge' },
    { ID: 7, NOME: 'Placa-mãe B650M WiFi', CATEGORIA: 'Placas-mãe', PRECO: 899.90, LOJA_NOME: 'Loja Exemplo PC Forge' },
    { ID: 8, NOME: 'Fonte 650W 80 Plus Bronze', CATEGORIA: 'Fontes', PRECO: 349.90, LOJA_NOME: 'Loja Exemplo PC Forge' },
    { ID: 9, NOME: 'Teclado Mecânico RGB Switch Red', CATEGORIA: 'Periféricos', PRECO: 279.90, LOJA_NOME: 'Loja Exemplo PC Forge' },
    { ID: 10, NOME: 'Headset Gamer 7.1 Surround', CATEGORIA: 'Acessórios', PRECO: 199.90, LOJA_NOME: 'Loja Exemplo PC Forge' }
];
