// ============================================================
// SEED DEMO — enche o banco com massa de dados pra demonstração
//
// Rode:   npm run seed:demo
// Limpe:  npm run seed:demo -- --limpar
//
// O que cria (TUDO com o prefixo "demo", pra não encostar nos
// dados originais do seed.sql / migrações):
//   * 5 lojas fictícias com nome de mercado (TechPoint, ...)
//   * 25 clientes  (cliente01@demo.pcforge ... cliente25@...)
//   * 1 endereço por cliente
//   * 100 produtos (20 por loja), peças reais de TI
//   * 150 compras (1–4 itens cada) nos últimos 90 dias
//   * ~80 avaliações (só de quem comprou aquele produto)
//   * 1000 acessos (ACESSO_LOG) nos últimos 30 dias
//   * ~30 itens de carrinho "esquecidos" 
//
// SENHA DE TODOS (clientes e lojas demo): 12345678 (bcrypt).
// O admin NÃO é mexido (adm / senha do .env).
//
// Idempotente: pode rodar quantas vezes quiser (checa antes).
// --limpar remove APENAS o que este script criou.
// ============================================================
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const pool = require('./db');
const { gerarHash } = require('./utils/senha');

const LIMPAR = process.argv.includes('--limpar');
const SENHA_DEMO = '12345678';

const LOJAS_DEMO = [
    { nome: 'TechPoint Informática', cnpj: '90.000.000/0001-01', endereco: 'Av. Sete de Setembro, 2718 - Centro - Curitiba - PR', celular: '41988880001', email: 'loja01@demo.pcforge', cidade: 'Curitiba' },
    { nome: 'Hardware Prime',        cnpj: '90.000.000/0001-02', endereco: 'Av. Paulista, 1007 - Bela Vista - São Paulo - SP',    celular: '11988880002', email: 'loja02@demo.pcforge', cidade: 'São Paulo' },
    { nome: 'MegaByte Store',        cnpj: '90.000.000/0001-03', endereco: 'Rua dos Carijós, 120 - Centro - Belo Horizonte - MG', celular: '31988880003', email: 'loja03@demo.pcforge', cidade: 'Belo Horizonte' },
    { nome: 'Nexus Computadores',    cnpj: '90.000.000/0001-04', endereco: 'Rua dos Andradas, 1234 - Centro Histórico - Porto Alegre - RS', celular: '51988880004', email: 'loja04@demo.pcforge', cidade: 'Porto Alegre' },
    { nome: 'Byte House Brasil',     cnpj: '90.000.000/0001-05', endereco: 'Av. Conselheiro Aguirre, 5110 - Boa Viagem - Recife - PE', celular: '81988880005', email: 'loja05@demo.pcforge', cidade: 'Recife' }
];

const DESCRICOES_LOJA = [
    'Loja especializada em peças e upgrades de PC. Envio para todo o Brasil com nota fiscal.',
    'Tudo pra montar o seu setup: hardware, periféricos e garantia de fábrica.',
    'Peças novas e testadas, atendimento humano e envio rápido.',
    'Sua loja de confiança em hardware desde os clássicos até o lançamento da semana.',
    'Componentes de performance, periféricos e acessórios pra gamers e criadores.'
];

const NOMES_CLIENTES = [
    'Ana Souza','Bruno Lima','Carla Mendes','Diego Ferreira','Ester Rocha',
    'Felipe Andrade','Gabriela Costa','Henrique Alves','Isabela Martins','João Pereira',
    'Karla Nogueira','Lucas Barbosa','Mariana Castro','Nathan Ribeiro','Olívia Cardoso',
    'Pedro Teixeira','Queila Fonseca','Rafael Moreira','Sabrina Duarte','Thiago Ramos',
    'Ulisses Braga','Vitória Lopes','Wagner Freitas','Xênia Paiva','Zeca Antunes'
];

const PRODUTOS_MODELO = [
    // [nome, categoria, preço base, descrição curta]
    ['Intel Core i3-12100F','Processadores',749,'4 núcleos / 8 threads, até 4.3 GHz. Ótimo custo-benefício.'],
    ['Intel Core i5-12400F','Processadores',999,'6 núcleos / 12 threads, até 4.4 GHz, socket LGA 1700.'],
    ['Intel Core i5-13400F','Processadores',1249,'10 núcleos (6P+4E), até 4.6 GHz.'],
    ['Intel Core i7-13700K','Processadores',2299,'16 núcleos, até 5.4 GHz, desbloqueado.'],
    ['AMD Ryzen 5 5600','Processadores',799,'6 núcleos / 12 threads, AM4, cooler incluso.'],
    ['AMD Ryzen 5 7600X','Processadores',1399,'6 núcleos, até 5.3 GHz, AM5.'],
    ['AMD Ryzen 7 5800X3D','Processadores',1899,'3D V-Cache, imbatível em jogos.'],
    ['AMD Ryzen 9 7900X','Processadores',2799,'12 núcleos / 24 threads, AM5.'],
    ['RTX 4060 8GB','Placas de Vídeo',1799,'Ada Lovelace, DLSS 3, 115W, ideal pra 1080p+.'],
    ['RTX 4060 Ti 16GB','Placas de Vídeo',2699,'16GB de VRAM pra jogos e IA leve.'],
    ['RTX 4070 Super 12GB','Placas de Vídeo',3699,'Perfomance de alto nível em 1440p.'],
    ['RX 6600 8GB','Placas de Vídeo',1149,'RDNA 2, eficiência energética, 1080p.'],
    ['RX 7600 XT 16GB','Placas de Vídeo',2099,'RDNA 3, 16GB, ótimo pra jogo moderno.'],
    ['RX 7800 XT 16GB','Placas de Vídeo',3099,'Alta performance em 1440p/4K leve.'],
    ['Memória 8GB DDR4 3200MHz','Memória RAM',159,'Módulo único DDR4 3200, CL16.'],
    ['Kit 16GB (2x8) DDR4 3600MHz','Memória RAM',289,'Dual channel, perfil XMP.'],
    ['Kit 32GB (2x16) DDR5 6000MHz','Memória RAM',799,'CL30, ideal pra Ryzen 7000+ e Intel 13a+'],
    ['Memória 16GB DDR5 5200MHz','Memória RAM',349,'Módulo único DDR5, RGB opcional.'],
    ['SSD SATA 480GB','Armazenamento',219,'SSD 2.5" SATA III, upgrade instantâneo.'],
    ['SSD NVMe 500GB Gen3','Armazenamento',289,'M.2 NVMe PCIe 3.0, até 3.500 MB/s.'],
    ['SSD NVMe 1TB Gen4','Armazenamento',469,'M.2 NVMe PCIe 4.0, até 7.000 MB/s.'],
    ['SSD NVMe 2TB Gen4','Armazenamento',849,'Alta capacidade pra jogos pesados.'],
    ['Placa-mãe H610M DDR4','Placas-mãe',499,'Chipset Intel H610, mATX, socket 1700.'],
    ['Placa-mãe B660M WiFi','Placas-mãe',849,'B660, Wi-Fi incluso, DDR4.'],
    ['Placa-mãe B650M WiFi','Placas-mãe',899,'B650 mATX, DDR5, Wi-Fi 6.'],
    ['Placa-mãe B550 Tomahawk','Placas-mãe',1099,'B550 ATX, PCIe 4.0, DDR4.'],
    ['Fonte 600W 80 Plus White','Fontes',219,'Fonte ATX 600W, PFC ativo.'],
    ['Fonte 650W 80 Plus Bronze','Fontes',349,'Modular parcial, proteção completa.'],
    ['Fonte 750W 80 Plus Gold','Fontes',599,'Totalmente modular, certificada Gold.'],
    ['Fonte 850W 80 Plus Gold','Fontes',799,'Alta performance, silenciosa.'],
    ['Gabinete mATX com 2 fans','Gabinetes',249,'Mini torre, painel lateral acrílico.'],
    ['Gabinete Mid Tower RGB','Gabinetes',379,'Frente de vidro temperado, 3 fans RGB.'],
    ['Gabinete Full Tower','Gabinetes',599,'Espaço total, airflow otimizado.'],
    ['Cooler a Ar 120mm','Refrigeração',99,'Silencioso, para socket 1700/AM4/AM5.'],
    ['Water Cooler 240mm','Refrigeração',449,'AIO 240mm, bom pra i7/R7.'],
    ['Water Cooler 360mm','Refrigeração',799,'AIO 360mm RGB pra CPUs top.'],
    ['Monitor 24" 75Hz IPS','Monitores',649,'Full HD IPS, borda fina, HDMI+VGA.'],
    ['Monitor 27" 144Hz','Monitores',1099,'1440p, 144Hz, resposta 1ms.'],
    ['Monitor 32" 165Hz Curvo','Monitores',1499,'Wide QHD curvo, imersão total.'],
    ['Teclado Mecânico RGB Red','Periféricos',279,'Switch linear red, keycaps double-shot.'],
    ['Teclado Mecânico TKL Brown','Periféricos',349,'Tenkeyless, switch tactile brown.'],
    ['Mouse Gamer 8000 DPI','Periféricos',199,'Sensor óptico, 8 botões, RGB.'],
    ['Mouse Sem Fio 16000 DPI','Periféricos',329,'Sensor 16k, 400h de bateria.'],
    ['Headset 7.1 Surround','Periféricos',259,'Drivers 50mm, mic removível.'],
    ['Microfone USB Cardioide','Periféricos',399,'Padrão cardioide, braço articulado.'],
    ['Headset com Cancelamento','Periféricos',599,'ANC híbrido, conforto por horas.']
];

const FORMAS_PAGAMENTO = ['Cartão de crédito', 'Cartão de crédito', 'Pix', 'Pix', 'Boleto bancário'];

function aleatorio(n) { return Math.floor(Math.random() * n); }
function escolher(lista) { return lista[aleatorio(lista.length)]; }
function aleatorioEntre(min, max) { return min + aleatorio(max - min + 1); }
function dataAleatoria(diasAtras) {
    const agora = Date.now();
    return new Date(agora - aleatorio(diasAtras) * 24 * 60 * 60 * 1000);
}
function dataIso(d) {
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

// Nome do produto: modelo + sufixo da loja só quando o MESMO modelo
// aparece em mais de uma loja (evita repetição idêntica na vitrine).
function nomeDoProduto(indiceGlobal) {
    const modelo = PRODUTOS_MODELO[indiceGlobal % PRODUTOS_MODELO.length];
    const rodada = Math.floor(indiceGlobal / PRODUTOS_MODELO.length);
    const ehRepetido = rodada > 0;
    const variante = ehRepetido ? ` — Edição ${['Pro', 'Max', 'Plus', 'Turbo'][rodada % 4]}` : '';
    return { modelo, nome: modelo[0] + variante };
}

async function main() {
    try {
        const conexaoTeste = await pool.getConnection();
        await conexaoTeste.ping();
        conexaoTeste.release();
    } catch (e) {
        console.error('❌ Sem conexão com o MySQL. Suba o banco primeiro (ex.: XAMPP).');
        process.exit(1);
    }

    if (LIMPAR) return limpar();

    console.log('[seed] Gerando hash da senha demo ("' + SENHA_DEMO + '")...');
    const senhaHash = await gerarHash(SENHA_DEMO);

    // --------------------------------------------------------
    // 1) LOJAS
    // --------------------------------------------------------
    console.log('[seed] Lojas...');
    const idsLojas = [];
    for (let i = 0; i < LOJAS_DEMO.length; i++) {
        const l = LOJAS_DEMO[i];
        const [ja] = await pool.query('SELECT ID FROM LOJA WHERE EMAIL = ?', [l.email]);
        if (ja.length > 0) { idsLojas.push(ja[0].ID); continue; }
        const [r] = await pool.query(
            `INSERT INTO LOJA (NOME, CNPJ, ENDERECO, CELULAR, EMAIL, SENHA, DESCRICAO)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [l.nome, l.cnpj, l.endereco, l.celular, l.email, senhaHash, DESCRICOES_LOJA[i]]
        );
        idsLojas.push(r.insertId);
    }
    console.log(`       ${idsLojas.length} lojas demo (IDs ${idsLojas.join(', ')})`);

    // --------------------------------------------------------
    // 2) CLIENTES + ENDEREÇOS
    // --------------------------------------------------------
    console.log('[seed] Clientes + endereços...');
    const UFs = ['PR', 'SP', 'MG', 'RS', 'PE', 'SC', 'BA', 'DF', 'GO', 'AM', 'PA', 'CE', 'MT', 'MS', 'RJ', 'ES', 'PB', 'RN', 'SE', 'PI', 'MA', 'TO', 'AC', 'RO', 'RR'];
    const cidadesPorUf = { PR: 'Curitiba', SP: 'São Paulo', MG: 'Belo Horizonte', RS: 'Porto Alegre', PE: 'Recife', SC: 'Joinville', BA: 'Salvador', DF: 'Brasília', GO: 'Goiânia', AM: 'Manaus', PA: 'Belém', CE: 'Fortaleza', MT: 'Cuiabá', MS: 'Campo Grande', RJ: 'Rio de Janeiro', ES: 'Vitória', PB: 'João Pessoa', RN: 'Natal', SE: 'Aracaju', PI: 'Teresina', MA: 'São Luís', TO: 'Palmas', AC: 'Rio Branco', RO: 'Porto Velho', RR: 'Boa Vista' };
    const CEPS = ['80010-010','01310-100','30130-010','90010-030','50050-900','88015-010','40010-000','70070-020','74015-910','69010-010','66015-010','60010-020','78005-100','79002-060','20040-020','29010-900','58013-230','59012-000','49010-060','64000-050','65010-100','77001-012','69900-060','76801-100','69301-010'];
    const RUAS = ['Av. Central','Rua das Palmeiras','Rua XV de Novembro','Av. Getúlio Vargas','Rua das Hortênsias'];

    const clientesDemo = []; // { id, nome, enderecoId, celular }
    for (let i = 1; i <= 25; i++) {
        const email = `cliente${String(i).padStart(2, '0')}@demo.pcforge`;
        const cpf = `900.000.000-${String(i).padStart(2, '0')}`;
        const nome = NOMES_CLIENTES[i - 1];
        const nascimentoIso = `19${aleatorioEntre(70, 99)}-${String(aleatorioEntre(1, 12)).padStart(2, '0')}-${String(aleatorioEntre(1, 28)).padStart(2, '0')}`;
        const celular = `(${UFs[i - 1] && UFs[i - 1] === 'SP' ? '11' : '41'}) 9${aleatorioEntre(1000, 9999)}-${String(aleatorioEntre(1000, 9999))}`;

        const [ja] = await pool.query('SELECT ID FROM CLIENTE WHERE EMAIL = ?', [email]);
        let idCliente;
        if (ja.length > 0) {
            idCliente = ja[0].ID;
        } else {
            const [r] = await pool.query(
                `INSERT INTO CLIENTE (NOME, CPF, EMAIL, CELULAR, NASCIMENTO, SENHA)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [nome, cpf, email, celular, nascimentoIso, senhaHash]
            );
            idCliente = r.insertId;
        }

        // Endereço: 1 por cliente (só insere se ele ainda não tem NENHUM)
        const [temEnd] = await pool.query('SELECT ID FROM ENDERECO WHERE ID_CLIENTE = ?', [idCliente]);
        if (temEnd.length === 0) {
            const uf = UFs[(i - 1) % UFs.length];
            const [rEnd] = await pool.query(
                `INSERT INTO ENDERECO (ID_CLIENTE, CEP, RUA, NUMERO, BAIRRO, CIDADE, ESTADO)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [idCliente, CEPS[(i - 1) % CEPS.length], escolher(RUAS), String(aleatorioEntre(1, 9999)),
                 escolher(['Centro', 'Jardim América', 'Batel', 'Boa Viagem', 'Santa Mônica']),
                 cidadesPorUf[uf], uf]
            );
            clientesDemo.push({ id: idCliente, nome, enderecoId: rEnd.insertId });
        } else {
            clientesDemo.push({ id: idCliente, nome, enderecoId: temEnd[0].ID });
        }
    }
    console.log(`       ${clientesDemo.length} clientes demo`);

    // --------------------------------------------------------
    // 3) PRODUTOS — 20 por loja, com foto reaproveitada de produto real
    // --------------------------------------------------------
    console.log('[seed] Produtos (com IMAGEM_URL apontando pra foto existente)...');
    const [comFoto] = await pool.query('SELECT ID FROM PRODUTO WHERE IMAGEM IS NOT NULL ORDER BY ID');
    const idsComFoto = comFoto.map((f) => f.ID);

    const idsProdutos = [];
    let indiceGlobal = 0;
    for (const idLoja of idsLojas) {
        for (let k = 0; k < 20; k++, indiceGlobal++) {
            const { modelo, nome } = nomeDoProduto(indiceGlobal);
            const [, categoria, precoBase, descricao] = modelo;
            // preço variando ±25%
            const preco = Math.round(precoBase * (0.75 + Math.random() * 0.5) * 100) / 100;

            // idempotência: nome + loja
            const [ja] = await pool.query(
                'SELECT ID FROM PRODUTO WHERE ID_LOJA = ? AND NOME = ?',
                [idLoja, nome]
            );
            if (ja.length > 0) { idsProdutos.push(ja[0].ID); continue; }

            const urlFoto = idsComFoto.length > 0
                ? `/produtos/${idsComFoto[aleatorio(idsComFoto.length)]}/imagem`
                : null;

            const [r] = await pool.query(
                `INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO, IMAGEM_URL)
                 VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?)`,
                [idLoja, nome, descricao, categoria, preco, 'demo.jpg', urlFoto]
            );
            idsProdutos.push(r.insertId);
        }
    }
    console.log(`       ${idsProdutos.length} produtos demo`);

    // --------------------------------------------------------
    // 4) COMPRAS + ITENS VENDIDOS (150)
    // --------------------------------------------------------
    console.log('[seed] Compras e itens vendidos (150)...');
    const [[totalComprasAntes]] = (await pool.query(
        `SELECT COUNT(*) n FROM COMPRA WHERE ID_CLIENTE IN (?)`,
        [clientesDemo.map((c) => c.id)]
    ));
    const FALTAM = Math.max(0, 150 - Number(totalComprasAntes.n));
    if (FALTAM === 0) {
        console.log('       Já tinha 150+ demo, pulando.');
    } else {
        const compras = []; // linhas pra bulk do POSSUI
        for (let i = 0; i < FALTAM; i++) {
            const cliente = escolher(clientesDemo);
            const data = dataAleatoria(90);
            const itens = [];
            const numItens = aleatorioEntre(1, 4);
            const usados = new Set();
            let valor = 0;
            for (let j = 0; j < numItens; j++) {
                const idProduto = idsProdutos[aleatorio(idsProdutos.length)];
                if (usados.has(idProduto)) continue;
                usados.add(idProduto);
                const qtd = aleatorioEntre(1, 3);
                // grava o preço do produto no momento da venda (POSSUI.ValorUnitario)
                const [[p]] = await pool.query('SELECT PRECO FROM PRODUTO WHERE ID = ?', [idProduto]);
                itens.push({ idProduto, qtd, preco: p.PRECO });
                valor += Number(p.PRECO) * qtd;
            }
            if (itens.length === 0) continue;

            const forma = escolher(FORMAS_PAGAMENTO);
            const [r] = await pool.query(
                `INSERT INTO COMPRA (ID_CLIENTE, ID_ENDERECO, DATA, FORMA_PAGAMENTO, VALOR_INICIAL)
                 VALUES (?, ?, ?, ?, ?)`,
                [cliente.id, cliente.enderecoId, dataIso(data), forma, Math.round(valor * 100) / 100]
            );
            for (const item of itens) {
                compras.push([r.insertId, item.idProduto, item.preco, item.qtd]);
            }
        }
        if (compras.length > 0) {
            await pool.query('INSERT INTO POSSUI (ID_COMPRA, ID_PRODUTO, VALOR_UNITARIO, QUANTIDADE) VALUES ?', [compras]);
        }
        console.log(`       ${FALTAM} compras novas, ${compras.length} itens vendidos`);
    }
    // Status realista espalhado ENTRE TODAS as compras demo (não só as
    // novas): as antigas tendem a estar ENTREGUE, as recentes no início
    // do ciclo. PENDENTE fica pra ~1/5 — é o que a loja "tem que cuidar".
    await pool.query(
        `UPDATE COMPRA SET STATUS = ELT(1 + FLOOR(RAND()*5),
                  'PENDENTE','PAGO','ENVIADO','ENTREGUE','ENTREGUE')
         WHERE ID_CLIENTE IN (?)`,
        [clientesDemo.map((c) => c.id)]
    );
    console.log('       status das compras demo atualizado');

    // --------------------------------------------------------
    // 5) AVALIAÇÕES (~80, só de quem comprou o produto) — idempotente por par
    // --------------------------------------------------------
    console.log('[seed] Avaliações...');
    const [pares] = await pool.query(
        `SELECT DISTINCT X.ID_PRODUTO, C.ID AS ID_CLIENTE, C.NOME
         FROM POSSUI X
         JOIN COMPRA CM ON CM.ID = X.ID_COMPRA
         JOIN CLIENTE C ON C.ID = CM.ID_CLIENTE
         WHERE C.EMAIL LIKE '%@demo.pcforge'`
    );
    const comentarios = [
        'Chegou rápido e bem embalado. Recomendo!',
        'Funcionou de primeira, nota fiscal certinha.',
        'Ótimo produto pelo preço. Loja parceira.',
        'Instalação simples, veio tudo no box original.',
        'Bom custo-benefício, mas embalagem podia ser mais reforçada.',
        'Excelente! Segunda compra aqui e não decepciona.',
        'Veio antes do prazo, suporte respondeu rápido.',
        'Produto impecável, já indiquei pra amigos.'
    ];
    const [[jaExistentes]] = await pool.query(
        `SELECT COUNT(*) n FROM AVALIACAO A
         JOIN CLIENTE C ON C.ID = A.ID_CLIENTE WHERE C.EMAIL LIKE '%@demo.pcforge'`
    );
    const FALTAM_AVAL = Math.max(0, 80 - Number(jaExistentes.n));
    let criadasAval = 0;
    const usadas = new Set();
    for (let i = 0; i < pares.length && criadasAval < FALTAM_AVAL; i++) {
        const par = pares[aleatorio(pares.length)];
        const chave = `${par.ID_PRODUTO}:${par.ID_CLIENTE}`;
        if (usadas.has(chave)) continue;
        usadas.add(chave);
        const primeiroNome = par.NOME.split(' ')[0] + ' ' + (par.NOME.split(' ')[1] ? par.NOME.split(' ')[1][0] + '.' : '');
        try {
            await pool.query(
                `INSERT INTO AVALIACAO (ID_PRODUTO, ID_CLIENTE, NOME_CLIENTE, NOTA, COMENTARIO)
                 VALUES (?, ?, ?, ?, ?)`,
                [par.ID_PRODUTO, par.ID_CLIENTE, primeiroNome, aleatorioEntre(2, 5), escolher(comentarios)]
            );
            criadasAval++;
        } catch { /* par já avaliado: segue */ }
    }
    console.log(`       ${criadasAval} avaliações novas`);

    // --------------------------------------------------------
    // 6) ACESSO_LOG (1000 entradas, últimos 30 dias)
    // --------------------------------------------------------
    console.log('[seed] Registros de acesso...');
    const paginas = ['/produtos.html', '/produto.html', '/index.html', '/carrinho.html', '/login.html', '/cliente-cadastro.html', '/loja-cadastro.html', '/perfil-cliente.html'];
    const [[acessosDemo]] = await pool.query(
        `SELECT COUNT(*) n FROM ACESSO_LOG
         WHERE PAGINA LIKE '%/%' AND DATA > DATE_SUB(NOW(), INTERVAL 30 DAY)
           AND PAGINA IN ('/produtos.html','/produto.html','/index.html','/carrinho.html','/login.html','/cliente-cadastro.html','/loja-cadastro.html','/perfil-cliente.html')`
    );
    const FALTAM_ACESSO = Math.max(0, 1000 - Number(acessosDemo.n));
    if (FALTAM_ACESSO > 0) {
        const entradas = [];
        for (let i = 0; i < FALTAM_ACESSO; i++) {
            const d = dataAleatoria(30);
            entradas.push([escolher(paginas), dataIso(d)]);
        }
        await pool.query('INSERT INTO ACESSO_LOG (PAGINA, DATA) VALUES ?', [entradas]);
        console.log(`       ${FALTAM_ACESSO} acessos inseridos`);
    } else {
        console.log('       Já tinha 1000+ na janela de 30 dias, pulando.');
    }

    // --------------------------------------------------------
    // 7) CARRINHO_ITEM (~30, dos clientes demo)
    // --------------------------------------------------------
    console.log('[seed] Itens de carrinho...');
    let carrinhoAdicionados = 0;
    for (let i = 0; i < 40 && carrinhoAdicionados < 30; i++) {
        const cliente = escolher(clientesDemo);
        const idProduto = idsProdutos[aleatorio(idsProdutos.length)];
        try {
            await pool.query(
                `INSERT INTO CARRINHO_ITEM (ID_CLIENTE, ID_PRODUTO, QUANTIDADE)
                 VALUES (?, ?, ?)`,
                [cliente.id, idProduto, aleatorioEntre(1, 2)]
            );
            carrinhoAdicionados++;
        } catch { /* cliente-produto já no carrinho: segue */ }
    }
    console.log(`       ${carrinhoAdicionados} itens de carrinho`);

    console.log('\n✅ Seed demo concluído!');
    console.log('   Logins (senha geral: ' + SENHA_DEMO + '):');
    console.log('   • Cliente: cliente01@demo.pcforge ... cliente25@demo.pcforge');
    console.log('   • Loja:    loja01@demo.pcforge (TechPoint) ... loja05@demo.pcforge (Byte House)');
    console.log('   • Admin:   adm / Fa110809 (não mexido)');
    console.log('\n   Pra REMOVER tudo isso: npm run seed:demo -- --limpar');
}

// ------------------------------------------------------------
// --limpar: apaga SÓ o que tem o prefixo demo, na ordem que a
// FK exige (filhos antes de pais).
// ------------------------------------------------------------
async function limpar() {
    console.log('[seed] Removendo SOMENTE registros demo...');
    await pool.query(
        `DELETE X FROM POSSUI X JOIN COMPRA C ON C.ID = X.ID_COMPRA
         JOIN CLIENTE CL ON CL.ID = C.ID_CLIENTE WHERE CL.EMAIL LIKE '%@demo.pcforge'`
    );
    await pool.query(
        `DELETE CM FROM COMPRA CM JOIN CLIENTE C ON C.ID = CM.ID_CLIENTE WHERE C.EMAIL LIKE '%@demo.pcforge'`
    );
    await pool.query(
        `DELETE CI FROM CARRINHO_ITEM CI JOIN CLIENTE C ON C.ID = CI.ID_CLIENTE WHERE C.EMAIL LIKE '%@demo.pcforge'`
    );
    await pool.query(
        `DELETE A FROM AVALIACAO A JOIN CLIENTE C ON C.ID = A.ID_CLIENTE WHERE C.EMAIL LIKE '%@demo.pcforge'`
    );
    await pool.query(
        `DELETE P FROM PRODUTO P JOIN LOJA L ON L.ID = P.ID_LOJA WHERE L.EMAIL LIKE '%@demo.pcforge'`
    );
    await pool.query(
        `DELETE E FROM ENDERECO E JOIN CLIENTE C ON C.ID = E.ID_CLIENTE WHERE C.EMAIL LIKE '%@demo.pcforge'`
    );
    await pool.query(`DELETE FROM CLIENTE WHERE EMAIL LIKE '%@demo.pcforge'`);
    await pool.query(`DELETE FROM LOJA WHERE EMAIL LIKE '%@demo.pcforge'`);
    console.log('✅ Limpo: nada do seed original foi tocado.');
}

main()
    .then(() => process.exit(0))
    .catch((erro) => {
        console.error('❌ Falha no seed:', erro && erro.message ? erro.message : erro);
        process.exit(1);
    });
