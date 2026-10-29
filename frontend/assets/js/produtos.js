// ============================================================
// produtos.js — vitrine/catálogo com filtros NO SERVIDOR
//
// A própria API agora aceita os parâmetros em GET /produtos:
//   nome=        -> busca por parte do nome
//   ordem=       -> menor_preco | maior_preco  (padrão: mais recentes)
//   categoria=   -> categoria exata
//   preco_min= / preco_max= -> faixa de preço
//   pagina=      -> 10 produtos por página (pág. 1 = 1º ao 10º)
// Este arquivo só monta esses parâmetros e exibe o resultado.
// ============================================================

const LIMITE_POR_PAGINA = 10; // tem que bater com o LIMITE do backend

const filtros = {
    nome: '',
    categoria: '',      // '' = todas
    ordem: '',          // '' = padrão (ID DESC), ou menor_preco/maior_preco
    preco_min: '',
    preco_max: '',
    pagina: 1
};

let produtosCache = [];      // produtos da página atual
let categoriasCache = null;  // lista de categorias (buscada 1 vez na API)
let totalResultados = 0;     // total achado pelos filtros (todas as páginas)

// Na página pública de uma loja (loja.html?id=3) esta mesma lógica de catálogo
// mostra só os produtos daquela loja. Na vitrine geral (produtos.html) não filtra.
const idLojaFiltro = document.body.dataset.pagina === 'loja-publica'
    ? new URLSearchParams(window.location.search).get('id')
    : null;

const ICONES_POR_CATEGORIA = {
    'processadores': '🔲',
    'placas de vídeo': '🎮',
    'placas de video': '🎮',
    'memória ram': '💾',
    'memoria ram': '💾',
    'armazenamento': '📀',
    'placas-mãe': '🖥️',
    'placas-mae': '🖥️',
    'fontes': '⚡',
    'periféricos': '⌨️',
    'perifericos': '⌨️',
    'acessórios': '🎧',
    'acessorios': '🎧',
    'default': '💻'
};

function iconeDe(categoria) {
    const chave = (categoria || '').toLowerCase();
    return ICONES_POR_CATEGORIA[chave] || ICONES_POR_CATEGORIA.default;
}

function formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Mesmo escape do PCForgeUtil (util.js): escapa & < > " ' — as aspas
// importam porque este valor entra DENTRO de atributos (title="...",
// alt="..."), onde só escapar < > não protege.
function escapeHtml(texto) {
    return String(texto ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ------------------------------------------------------------
// Monta a query string com base nos filtros atuais
// ------------------------------------------------------------
function construirQuery() {
    const parametros = [];
    if (idLojaFiltro) parametros.push(`loja=${encodeURIComponent(idLojaFiltro)}`);
    if (filtros.nome) parametros.push(`nome=${encodeURIComponent(filtros.nome)}`);
    if (filtros.categoria && filtros.categoria !== 'todas') {
        parametros.push(`categoria=${encodeURIComponent(filtros.categoria)}`);
    }
    if (filtros.ordem) parametros.push(`ordem=${filtros.ordem}`);
    if (filtros.preco_min !== '') parametros.push(`preco_min=${filtros.preco_min}`);
    if (filtros.preco_max !== '') parametros.push(`preco_max=${filtros.preco_max}`);
    parametros.push(`pagina=${filtros.pagina}`);
    return `/produtos?${parametros.join('&')}`;
}

// ------------------------------------------------------------
// Carrega uma página de produtos da API (ou do modo demo)
// ------------------------------------------------------------
// Skeleton da vitrine: cards fantasmas com brilho varrendo (o layout da
// grade aparece imediatamente, que é o que dá sensação de velocidade).
function renderizarSkeletonCatalogo() {
    const grade = document.getElementById('grade-produtos');
    grade.innerHTML = Array.from({ length: LIMITE_POR_PAGINA }, () => `
        <div class="cartao-produto esqueleto">
            <div class="cartao-thumb esqueleto-bloco"></div>
            <div class="cartao-corpo">
                <div class="esqueleto-linha do-67"></div>
                <div class="esqueleto-linha do-100"></div>
                <div class="esqueleto-linha do-40"></div>
            </div>
        </div>
    `).join('') + '<p class="estado-carregando" aria-live="polite">Carregando produtos...</p>';
}

async function carregarProdutos() {
    const grade = document.getElementById('grade-produtos');

    // A URL acompanha o estado dos filtros (deep link / F5 / voltar funcionam).
    atualizarUrl();

    if (estaEmModoDemo()) {
        // Modo visualização: filtra localmente sobre os produtos de exemplo
        carregarCategoriasDemo();
        produtosCache = paginarProdutosDemo();
        totalResultados = contarProdutosDemo();
        montarFiltros();
        montarContador();
        renderizarProdutos();
        montarPaginacao();
        adicionarProdutoPretendido();
        return;
    }

    // Cards fantasmas enquanto a resposta não chega (não demora: é imediato).
    renderizarSkeletonCatalogo();

    try {
        // Traz os produtos E o total de resultados (header X-Resultados-Total)
        const { dados, headers } = await apiGetComMeta(construirQuery());
        produtosCache = dados;
        totalResultados = Number(headers.get('x-resultados-total')) || produtosCache.length;

        // Busca a lista de categorias uma única vez (pra montar os chips)
        if (categoriasCache === null) {
            categoriasCache = await apiGet('/produtos/categorias');
        }

        montarFiltros();
        montarContador();
        renderizarProdutos();
        montarPaginacao();
        adicionarProdutoPretendido();
    } catch (error) {
        grade.innerHTML = `<p class="estado-vazio">
            Não foi possível carregar os produtos.<br>
            Confira se a API está rodando em <code>${API_URL}</code><br>
            (${escapeHtml(error.message)})<br><br>
            <a href="produtos.html">Tentar de novo</a>
        </p>`;
    }
}

// ------------------------------------------------------------
// Modo demo: mesma filtragem, mas feita aqui no navegador
// ------------------------------------------------------------
function carregarCategoriasDemo() {
    if (categoriasCache === null) {
        categoriasCache = [...new Set(PRODUTOS_DEMO.map((p) => p.CATEGORIA))];
    }
}

function filtrarProdutosDemo() {
    let lista = [...PRODUTOS_DEMO];

    if (idLojaFiltro) lista = lista.filter((p) => String(p.ID_LOJA) === String(idLojaFiltro));
    if (filtros.categoria && filtros.categoria !== 'todas') {
        lista = lista.filter((p) => p.CATEGORIA === filtros.categoria);
    }
    if (filtros.nome) {
        const alvo = filtros.nome.toLowerCase();
        lista = lista.filter((p) => p.NOME.toLowerCase().includes(alvo));
    }
    if (filtros.preco_min !== '') lista = lista.filter((p) => Number(p.PRECO) >= Number(filtros.preco_min));
    if (filtros.preco_max !== '') lista = lista.filter((p) => Number(p.PRECO) <= Number(filtros.preco_max));

    if (filtros.ordem === 'menor_preco') lista.sort((a, b) => a.PRECO - b.PRECO);
    if (filtros.ordem === 'maior_preco') lista.sort((a, b) => b.PRECO - a.PRECO);

    return lista; // SEM slice: quem corta a página é quem chama
}

// Conta quantos produtos o filtro do modo demo acharia (pra saber se há próxima página)
function contarProdutosDemo() {
    return filtrarProdutosDemo().length;
}

function paginarProdutosDemo() {
    const inicio = (filtros.pagina - 1) * LIMITE_POR_PAGINA;
    return filtrarProdutosDemo().slice(inicio, inicio + LIMITE_POR_PAGINA);
}

// ------------------------------------------------------------
// Monta os controles: busca, ordenação, preço e chips de categoria
// ------------------------------------------------------------
function montarFiltros() {
    const container = document.getElementById('filtros');

    // Quem estava digitando na barra não deve perder o foco por causa do
    // rebuild (a barra é reconstruída a cada carregamento de página).
    const focoDeVolta = document.activeElement;
    const indicadorFoco = focoDeVolta && typeof focoDeVolta.className === 'string' ? focoDeVolta.className : null;
    const selecaoDeVolta = focoDeVolta && typeof focoDeVolta.selectionStart === 'number' ? focoDeVolta.selectionStart : null;

    container.innerHTML = '';

    // --- barra de busca grande (com lupa e atalho "/") ---
    const barra = document.createElement('div');
    barra.className = 'filtros-barra';
    barra.innerHTML = `
        <div class="busca-caixa">
            <span class="busca-lupa" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.8"/>
                    <path d="M15.5 15.5 20.5 20.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
            </span>
            <input class="filtro-input filtro-busca" type="search" aria-label="Buscar produto pelo nome"
                placeholder="Buscar produto, categoria ou loja..." value="${escapeHtml(filtros.nome)}">
            <kbd class="busca-atalho" title="Aperta / pra focar a busca">/</kbd>
        </div>

        <div class="ordem-pilulas" role="group" aria-label="Ordenar resultados">
            <button type="button" class="ordem-pilula${filtros.ordem === '' ? ' ativa' : ''}" data-ordem="">Relevância</button>
            <button type="button" class="ordem-pilula${filtros.ordem === 'menor_preco' ? ' ativa' : ''}" data-ordem="menor_preco">Menor preço</button>
            <button type="button" class="ordem-pilula${filtros.ordem === 'maior_preco' ? ' ativa' : ''}" data-ordem="maior_preco">Maior preço</button>
        </div>

        <span class="filtro-preco-grupo">
            <label class="filtro-label" for="filtro-preco-min">R$</label>
            <input id="filtro-preco-min" class="filtro-input filtro-preco" type="number" min="0"
                placeholder="mín" value="${escapeHtml(filtros.preco_min)}">
            <span class="filtro-label">até</span>
            <input id="filtro-preco-max" class="filtro-input filtro-preco" type="number" min="0"
                placeholder="máx" aria-label="Preço máximo" value="${escapeHtml(filtros.preco_max)}">
        </span>

        <button class="filtro-chip filtro-aplicar" type="button">Filtrar</button>
        <button class="filtro-chip filtro-limpar" type="button">Limpar</button>
    `;
    container.appendChild(barra);

    const buscar = barra.querySelector('.filtro-busca');
    const pilulas = barra.querySelectorAll('.ordem-pilula');
    const precoMin = barra.querySelector('#filtro-preco-min');
    const precoMax = barra.querySelector('#filtro-preco-max');

    // Enter no campo de busca aplica os filtros
    [buscar, precoMin, precoMax].forEach((campo) => {
        campo.addEventListener('keydown', (evento) => {
            if (evento.key === 'Enter') aplicarFiltrosDaInterface();
        });
    });

    // pílulas de ordenação: clicou troca a ordem e recarrega
    pilulas.forEach((pilula) => {
        pilula.addEventListener('click', function () {
            pilulas.forEach((p) => p.classList.toggle('ativa', p === pilula));
            filtros.ordem = this.dataset.ordem;
            filtros.pagina = 1;
            carregarProdutos();
        });
    });

    // Busca "ao digitar" com debounce (450ms sem digitar = aplica). Antes só
    // aplicava com Enter/botão — funciona, mas parece que a busca está presa.
    let cicloDebounce = null;
    buscar.addEventListener('input', () => {
        clearTimeout(cicloDebounce);
        cicloDebounce = setTimeout(aplicarFiltrosDaInterface, 450);
    });

    barra.querySelector('.filtro-aplicar').addEventListener('click', aplicarFiltrosDaInterface);
    barra.querySelector('.filtro-limpar').addEventListener('click', () => {
        filtros.nome = '';
        filtros.categoria = '';
        filtros.ordem = '';
        filtros.preco_min = '';
        filtros.preco_max = '';
        filtros.pagina = 1;
        carregarProdutos();
    });

    // --- chips/cards de categoria (com ícone, estilo botão) ---
    const categorias = categoriasCache === null ? [] : ['todas', ...categoriasCache];
    categorias.forEach((categoria) => {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'filtro-chip filtro-cat';
        const rotulo = categoria === 'todas' ? 'Todas' : categoria;
        const icone = categoria === 'todas' ? '🛒' : iconeDe(categoria);
        botao.innerHTML = `<span class="filtro-cat-icone" aria-hidden="true">${icone}</span>${escapeHtml(rotulo)}`;
        botao.setAttribute('aria-pressed',
            (categoria === 'todas'
                ? (!filtros.categoria || filtros.categoria === 'todas')
                : categoria === filtros.categoria) ? 'true' : 'false');
        botao.addEventListener('click', () => {
            aplicarCategoriaDaInterface(categoria);
        });
        container.appendChild(botao);
    });

    // Devolve o foco onde estava (ex.: o usuário ainda está digitando a busca).
    if (indicadorFoco) {
        const alvo = container.querySelector(`.${indicadorFoco.split(' ').filter(Boolean).map((c) => CSS.escape(c)).join('.')}`);
        if (alvo) {
            alvo.focus({ preventScroll: true });
            if (selecaoDeVolta !== null && alvo.setSelectionRange) {
                try { alvo.setSelectionRange(selecaoDeVolta, selecaoDeVolta); } catch { /* campo sem caret */ }
            }
        }
    }
}

// Lê os campos da barra SEM disparar busca (quem chama decide o momento).
// A ordenação hoje é por pílulas — a ordem vem da pílula marcada com a
// classe "ativa" (antes lia um .filtro-select que não existe mais e quebrava
// QUALQUER aplicação de filtro: busca, Enter, botão Filtrar e os chips).
function lerCamposDaBarra() {
    const barra = document.querySelector('.filtros-barra');
    if (!barra) return false;

    filtros.nome = barra.querySelector('.filtro-busca').value.trim();

    const pilulaAtiva = barra.querySelector('.ordem-pilula.ativa');
    filtros.ordem = pilulaAtiva ? pilulaAtiva.dataset.ordem : '';

    const min = barra.querySelector('#filtro-preco-min').value.trim();
    const max = barra.querySelector('#filtro-preco-max').value.trim();
    filtros.preco_min = min === '' ? '' : min;
    filtros.preco_max = max === '' ? '' : max;

    filtros.pagina = 1;
    return true;
}

// Botão "Filtrar" e Enter nos campos: relê a barra e recarrega do servidor.
function aplicarFiltrosDaInterface() {
    if (!lerCamposDaBarra()) return;
    carregarProdutos();
}

// A pessoa clicou no chip de categoria. Antes disparamos DUAS cargas seguidas
// (a de aplicar os campos + a nova categoria), e a primeira podia responder
// por último e sobrescrever a grade com a categoria antiga. Agora: aplica os
// campos e carrega UMA vez só.
function aplicarCategoriaDaInterface(categoria) {
    if (!lerCamposDaBarra()) return;
    filtros.categoria = categoria;
    filtros.pagina = 1;
    carregarProdutos();
}

// ------------------------------------------------------------
// FILTROS NA URL (?categoria=...&nome=...&ordem=...&pagina=...)
// Antes os filtros moravam só num objeto do JS: recarregar a página,
// voltar no navegador ou compartilhar um link perdia tudo. Agora:
//   * ao abrir a página, os filtros são lidos da URL (lerFiltrosDaUrl);
//   * a cada carregamento, os MESMOS valores são escritos de volta na
//     URL com history.replaceState (não cria entradas no histórico a
//     cada tecla — a URL apenas acompanha o estado atual).
// ------------------------------------------------------------
function lerFiltrosDaUrl() {
    const url = new URLSearchParams(window.location.search);
    if (url.has('nome')) filtros.nome = url.get('nome') || '';
    if (url.has('categoria')) filtros.categoria = url.get('categoria') || '';
    if (url.has('ordem')) filtros.ordem = url.get('ordem') || '';
    if (url.has('preco_min')) filtros.preco_min = url.get('preco_min') || '';
    if (url.has('preco_max')) filtros.preco_max = url.get('preco_max') || '';
    const pagina = Number(url.get('pagina'));
    if (Number.isInteger(pagina) && pagina > 0) filtros.pagina = pagina;
}

function atualizarUrl() {
    const url = new URL(window.location.href);
    const parametros = new URLSearchParams(url.search);

    const valores = {
        nome: filtros.nome,
        categoria: filtros.categoria && filtros.categoria !== 'todas' ? filtros.categoria : '',
        ordem: filtros.ordem,
        preco_min: filtros.preco_min,
        preco_max: filtros.preco_max,
        pagina: filtros.pagina > 1 ? String(filtros.pagina) : ''
    };

    for (const [nome, valor] of Object.entries(valores)) {
        if (valor) parametros.set(nome, valor);
        else parametros.delete(nome);
    }
    // A página pública da loja (loja.html) usa ?loja=N; preserva.
    if (idLojaFiltro) parametros.set('loja', idLojaFiltro);

    const novaBusca = parametros.toString();
    history.replaceState(null, '', novaBusca ? `${url.pathname}?${novaBusca}` : url.pathname);
}

// ------------------------------------------------------------
// Contador de resultados, estilo Mercado Livre ("X resultados")
// ------------------------------------------------------------
function montarContador() {
    const secao = document.getElementById('grade-produtos').parentElement;

    let contador = document.getElementById('contador-resultados');
    if (!contador) {
        contador = document.createElement('p');
        contador.id = 'contador-resultados';
        contador.className = 'contador-resultados';
        contador.setAttribute('aria-live', 'polite'); /* leitor de tela anuncia when muda */
        secao.insertBefore(contador, document.getElementById('grade-produtos'));
    }

    const numero = totalResultados.toLocaleString('pt-BR');
    contador.textContent = `${numero} ${totalResultados === 1 ? 'resultado' : 'resultados'}`;
}

// ------------------------------------------------------------
// Paginação: "Página X" + botões Anterior/Próxima
// ------------------------------------------------------------
function montarPaginacao() {
    const secao = document.getElementById('grade-produtos').parentElement;

    let rodape = document.getElementById('paginacao');
    if (!rodape) {
        rodape = document.createElement('nav');
        rodape.id = 'paginacao';
        rodape.className = 'paginacao';
        rodape.setAttribute('aria-label', 'Paginação de resultados');
        secao.appendChild(rodape);
    }
    rodape.innerHTML = '';

    const anterior = document.createElement('button');
    anterior.type = 'button';
    anterior.className = 'paginacao-botao';
    anterior.textContent = '‹ Anterior';
    anterior.disabled = filtros.pagina <= 1;
    anterior.addEventListener('click', () => mudarPagina(-1));
    rodape.appendChild(anterior);

    const indicador = document.createElement('span');
    indicador.className = 'paginacao-indicador';
    indicador.textContent = `Página ${filtros.pagina}`;
    rodape.appendChild(indicador);

    const proxima = document.createElement('button');
    proxima.type = 'button';
    proxima.className = 'paginacao-botao';
    proxima.textContent = 'Próxima ›';
    // Se o total de resultados é multiple do LIMITE, usar "menos que o LIMITE
    // veio" dava uma página extra vazia. O total exato (header X-Resultados-Total
    // ou a contagem do modo demo) decide se existe página seguinte.
    proxima.disabled = totalResultados <= filtros.pagina * LIMITE_POR_PAGINA;
    proxima.addEventListener('click', () => mudarPagina(1));
    rodape.appendChild(proxima);
}

function mudarPagina(delta) {
    filtros.pagina = Math.max(1, filtros.pagina + delta);
    carregarProdutos();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ------------------------------------------------------------
// Renderização dos cards (igual antes, só com paginação)
// ------------------------------------------------------------
function renderizarProdutos() {
    const grade = document.getElementById('grade-produtos');
    const filtrados = produtosCache;

    if (filtrados.length === 0) {
        grade.innerHTML = filtros.pagina > 1
            ? '<p class="estado-vazio">Não há produtos nessa página — volte uma página.</p>'
            : `
            <div class="vazio-busca">
                <span class="vazio-busca-icone" aria-hidden="true">⌕</span>
                <h3>Nada por aqui.</h3>
                <p>Nenhum produto pra <strong>"${escapeHtml(filtros.nome || 'esses filtros')}"</strong> ou categoria escolhida.</p>
                <div class="vazio-sugestoes">
                    <span>sugerir:</span>
                    ${['memória RAM', 'placa de vídeo', 'SSD', 'processador'].map((s) =>
                        `<button type="button" class="vazio-sugestao" data-busca="${escapeHtml(s)}">${escapeHtml(s)}</button>`
                    ).join('')}
                </div>
                <button type="button" class="vazio-limpar">Limpar os filtros</button>
            </div>`;

        // sugestões: clicar roda uma busca nova em cima
        grade.querySelectorAll('.vazio-sugestao').forEach((botao) => {
            botao.addEventListener('click', function () {
                filtros.nome = this.dataset.busca;
                filtros.categoria = '';
                filtros.ordem = '';
                filtros.preco_min = '';
                filtros.preco_max = '';
                filtros.pagina = 1;
                carregarProdutos();
            });
        });
        const limpar = grade.querySelector('.vazio-limpar');
        if (limpar) limpar.addEventListener('click', () => {
            filtros.nome = ''; filtros.categoria = ''; filtros.ordem = '';
            filtros.preco_min = ''; filtros.preco_max = ''; filtros.pagina = 1;
            carregarProdutos();
        });
        return;
    }

    grade.innerHTML = filtrados.map((produto) => {
        const urlFoto = urlImagemProduto(produto);
        return `
        <div class="cartao-produto">
            <a class="cartao-thumb-link" href="produto.html?id=${encodeURIComponent(produto.ID)}" title="Ver detalhes de ${escapeHtml(produto.NOME)}">
                <div class="cartao-thumb${urlFoto ? ' com-foto' : ''}">
                    ${urlFoto ? `<img src="${escapeHtml(urlFoto)}" alt="${escapeHtml(produto.NOME)}" loading="lazy">` : ''}
                    <span class="cartao-categoria">${escapeHtml(produto.CATEGORIA)}</span>
                    <span class="cartao-icone">${iconeDe(produto.CATEGORIA)}</span>
                    ${PCForgeFavoritos.coracaoHtml(produto.ID)}
                </div>
            </a>
            <div class="cartao-corpo">
                ${produto.ID_LOJA
                    ? `<a class="cartao-loja cartao-loja-link" href="loja.html?id=${encodeURIComponent(produto.ID_LOJA)}" title="Ver a página da loja">${escapeHtml(produto.LOJA_NOME)}</a>`
                    : `<span class="cartao-loja">${escapeHtml(produto.LOJA_NOME)}</span>`}
                <h3 class="cartao-nome"><a class="cartao-nome-link" href="produto.html?id=${encodeURIComponent(produto.ID)}">${escapeHtml(produto.NOME)}</a></h3>
                <span class="cartao-preco">${formatarPreco(produto.PRECO)}</span>
                <span class="cartao-frete">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M2 6h11v10H2z" stroke="currentColor" stroke-width="1.6"/>
                        <path d="M13 9h4l3 3.5V16h-7z" stroke="currentColor" stroke-width="1.6"/>
                        <circle cx="6" cy="18" r="1.8" fill="currentColor"/>
                        <circle cx="16.5" cy="18" r="1.8" fill="currentColor"/>
                    </svg>
                    Frete grátis
                </span>
                <button class="cartao-comprar" type="button" data-id="${produto.ID}">Adicionar ao carrinho</button>
            </div>
        </div>
    `;
    }).join('');

    // Foto que não carregou (API fora do ar, etc.): cai de volta pro ícone da categoria.
    grade.querySelectorAll('.cartao-thumb img').forEach((img) => {
        img.addEventListener('error', () => {
            img.parentElement.classList.remove('com-foto');
            img.remove();
        });
    });

    grade.querySelectorAll('.cartao-comprar').forEach((botao) => {
        botao.addEventListener('click', () => {
            const produto = produtosCache.find((p) => String(p.ID) === botao.dataset.id);
            adicionarAoCarrinho(produto, botao);
        });
    });

    // liga os corações de favoritar que vierem nos cards
    if (window.PCForgeFavoritos) PCForgeFavoritos.decorarBotoes(grade);
}

async function adicionarAoCarrinho(produto, botao) {
    const clienteLogado = sessionStorage.getItem('cliente');

    // Sem login: guarda qual produto a pessoa queria. Depois de entrar, ela volta
    // pra vitrine e o produto cai no carrinho sozinho (adicionarProdutoPretendido).
    if (!clienteLogado) {
        sessionStorage.setItem('produtoPretendido', JSON.stringify({ id: produto.ID, nome: produto.NOME }));
        mostrarToast('Você precisa entrar na sua conta pra montar o carrinho. Vamos te levar pro login.', 'aviso');
        setTimeout(() => { window.location.href = 'login.html'; }, 1200);
        return;
    }

    botao.disabled = true;
    try {
        await Carrinho.adicionar(produto);
        mostrarToast(`"${produto.NOME}" foi pro seu carrinho.`, 'sucesso');
    } catch (error) {
        // Sessão expirada: o api.js já avisou e está levando pro login.
        if (!error.sessaoExpirada) mostrarToast(error.message, 'erro');
    } finally {
        botao.disabled = false;
    }
}

// A pessoa clicou em "Adicionar ao carrinho" sem estar logada, entrou, e voltou
// pra cá: coloca no carrinho o produto que ela tinha escolhido.
async function adicionarProdutoPretendido() {
    const bruto = sessionStorage.getItem('produtoPretendido');
    if (!bruto || !sessionStorage.getItem('cliente')) return;
    sessionStorage.removeItem('produtoPretendido');

    let pretendido;
    try { pretendido = JSON.parse(bruto); } catch { return; }
    if (!pretendido || !pretendido.id) return;

    try {
        // Tenta com os dados completos da vitrine (o modo visualização precisa deles).
        const produto = produtosCache.find((p) => String(p.ID) === String(pretendido.id)) || { ID: pretendido.id };
        await Carrinho.adicionar(produto);
        mostrarToast(`"${pretendido.nome}" foi pro seu carrinho.`, 'sucesso');
    } catch (error) {
        if (!error.sessaoExpirada) mostrarToast(`Não consegui adicionar "${pretendido.nome}": ${error.message}`, 'aviso');
    }
}

// Estado inicial: filtros que vieram na URL (compartilhamento/F5/voltar)
// e depois a primeira carga da vitrine.
lerFiltrosDaUrl();
carregarProdutos();

// Atalho "/" foca a busca (igual apps). Ignora se já está digitando
// em outro campo (input/select/textarea) — senão roubaria o teclado.
document.addEventListener('keydown', function (evento) {
    if (evento.key !== '/') return;
    const alvo = evento.target;
    if (alvo && (/^(input|textarea|select)$/i).test(alvo.tagName)) return;
    const busca = document.querySelector('.filtro-busca');
    if (busca) {
        evento.preventDefault();
        busca.focus();
        busca.select();
    }
});
