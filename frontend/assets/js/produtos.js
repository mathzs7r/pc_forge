let produtosCache = [];
let categoriaAtiva = 'todas';

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

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
}

async function carregarProdutos() {
    const grade = document.getElementById('grade-produtos');
    try {
        const caminho = idLojaFiltro ? `/produtos?loja=${encodeURIComponent(idLojaFiltro)}` : '/produtos';
        produtosCache = estaEmModoDemo() ? PRODUTOS_DEMO : await apiGet(caminho);

        if (produtosCache.length === 0) {
            grade.innerHTML = idLojaFiltro
                ? `<p class="estado-vazio">Essa loja ainda não tem produtos à venda.</p>`
                : `<p class="estado-vazio">
                    Ainda não tem nenhum produto cadastrado.<br>
                    Crie uma conta de loja e cadastre seus produtos no painel da loja.
                </p>`;
            return;
        }

        montarFiltros();
        renderizarProdutos();
        adicionarProdutoPretendido();
    } catch (error) {
        grade.innerHTML = `<p class="estado-vazio">
            Não foi possível carregar os produtos.<br>
            Confira se a API está rodando em <code>${API_URL}</code>,
            ou clique na logo pra usar o modo visualização.<br>
            (${escapeHtml(error.message)})
        </p>`;
    }
}

function montarFiltros() {
    const categorias = ['todas', ...new Set(produtosCache.map((p) => p.CATEGORIA))];
    const container = document.getElementById('filtros');
    container.innerHTML = '';

    categorias.forEach((categoria) => {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'filtro-chip';
        botao.textContent = categoria === 'todas' ? 'Todas' : categoria;
        botao.setAttribute('aria-pressed', categoria === categoriaAtiva ? 'true' : 'false');
        botao.addEventListener('click', () => {
            categoriaAtiva = categoria;
            montarFiltros();
            renderizarProdutos();
        });
        container.appendChild(botao);
    });
}

function renderizarProdutos() {
    const grade = document.getElementById('grade-produtos');
    const filtrados = categoriaAtiva === 'todas'
        ? produtosCache
        : produtosCache.filter((p) => p.CATEGORIA === categoriaAtiva);

    if (filtrados.length === 0) {
        grade.innerHTML = '<p class="estado-vazio">Nenhum produto encontrado nessa categoria.</p>';
        return;
    }

    grade.innerHTML = filtrados.map((produto) => {
        const urlFoto = urlImagemProduto(produto);
        return `
        <div class="cartao-produto">
            <div class="cartao-thumb${urlFoto ? ' com-foto' : ''}">
                ${urlFoto ? `<img src="${escapeHtml(urlFoto)}" alt="${escapeHtml(produto.NOME)}" loading="lazy">` : ''}
                <span class="cartao-categoria">${escapeHtml(produto.CATEGORIA)}</span>
                <span class="cartao-icone">${iconeDe(produto.CATEGORIA)}</span>
            </div>
            <div class="cartao-corpo">
                ${produto.ID_LOJA
                    ? `<a class="cartao-loja cartao-loja-link" href="loja.html?id=${encodeURIComponent(produto.ID_LOJA)}" title="Ver a página da loja">${escapeHtml(produto.LOJA_NOME)}</a>`
                    : `<span class="cartao-loja">${escapeHtml(produto.LOJA_NOME)}</span>`}
                <span class="cartao-nome">${escapeHtml(produto.NOME)}</span>
                <span class="cartao-preco">${formatarPreco(produto.PRECO)}</span>
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

carregarProdutos();
