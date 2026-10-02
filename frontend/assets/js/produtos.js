let produtosCache = [];
let categoriaAtiva = 'todas';

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
        produtosCache = estaEmModoDemo() ? PRODUTOS_DEMO : await apiGet('/produtos');

        if (produtosCache.length === 0) {
            grade.innerHTML = `<p class="estado-vazio">
                Ainda não tem nenhum produto cadastrado.<br>
                Crie uma conta de loja e cadastre seus produtos no painel da loja.
            </p>`;
            return;
        }

        montarFiltros();
        renderizarProdutos();
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

    grade.innerHTML = filtrados.map((produto) => `
        <div class="cartao-produto">
            <div class="cartao-thumb">
                <span class="cartao-categoria">${escapeHtml(produto.CATEGORIA)}</span>
                <span>${iconeDe(produto.CATEGORIA)}</span>
            </div>
            <div class="cartao-corpo">
                <span class="cartao-loja">${escapeHtml(produto.LOJA_NOME)}</span>
                <span class="cartao-nome">${escapeHtml(produto.NOME)}</span>
                <span class="cartao-preco">${formatarPreco(produto.PRECO)}</span>
                <button class="cartao-comprar" type="button" data-id="${produto.ID}">Comprar</button>
            </div>
        </div>
    `).join('');

    grade.querySelectorAll('.cartao-comprar').forEach((botao) => {
        botao.addEventListener('click', () => {
            const produto = produtosCache.find((p) => String(p.ID) === botao.dataset.id);
            tentarComprar(produto);
        });
    });
}

function tentarComprar(produto) {
    const clienteLogado = sessionStorage.getItem('cliente');

    if (!clienteLogado) {
        sessionStorage.setItem('produtoPretendido', JSON.stringify({ id: produto.ID, nome: produto.NOME }));
        mostrarToast('Você precisa entrar na sua conta pra comprar. Vamos te levar pro login.', 'aviso');
        setTimeout(() => { window.location.href = 'login.html'; }, 1200);
        return;
    }

    mostrarToast(`Comprando "${produto.NOME}"! (fluxo de pagamento ainda não implementado)`, 'info');
}

carregarProdutos();
