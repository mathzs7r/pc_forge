// ============================================================
// produto.js — página de detalhe do produto (estilo Mercado Livre)
//
// produto.html?id=N  ->  GET /produtos/N            (detalhe + loja + nota)
//                        GET /produtos/N/avaliacoes  (resumo + lista)
// O cliente logado pode avaliar; só quem JÁ COMPROU o produto é
// aceito pela API (403 com mensagem explicando caso contrário).
// ============================================================

const idProduto = Number(new URLSearchParams(window.location.search).get('id'));

// helpers locais (produto.js não compartilha escopo com produtos.js)
// Mesmo escape do PCForgeUtil (util.js): escapa também as aspas, porque
// o resultado entra dentro de atributos (alt="...", title="...").
function escapeHtml(texto) {
    return String(texto ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const ICONES = {
    'processadores': '🔲', 'placas de vídeo': '🎮', 'placas de video': '🎮',
    'memória ram': '💾', 'memoria ram': '💾', 'armazenamento': '📀',
    'placas-mãe': '🖥️', 'placas-mae': '🖥️', 'fontes': '⚡',
    'periféricos': '⌨️', 'perifericos': '⌨️', 'acessórios': '🎧', 'acessorios': '🎧'
};
function iconeDe(categoria) {
    return ICONES[(categoria || '').toLowerCase()] || '💻';
}

// Desenha 5 estrelas (cheias/vazias) a partir de uma média 0–5
function estrelasHtml(media, extras) {
    const m = Number(media) || 0;
    const cheias = Math.round(m);
    let html = `<span class="estrelas ${extras || ''}" aria-label="${m.toFixed(1)} de 5">`;
    for (let i = 1; i <= 5; i++) {
        html += `<span class="estrela${i <= cheias ? ' cheia' : ''}">★</span>`;
    }
    return html + '</span>';
}

let produtoAtual = null;
let notaEscolhida = 0;

// ------------------------------------------------------------
// Carregamento
// ------------------------------------------------------------
async function carregarProduto() {
    const caixa = document.getElementById('produto-conteudo');

    if (!Number.isInteger(idProduto) || idProduto <= 0) {
        caixa.innerHTML = '<p class="estado-vazio">Produto inválido. <a href="produtos.html">Voltar à vitrine</a>.</p>';
        return;
    }

    // Skeleton: dá feedback imediato de que a página está trabalhando
    // (o texto "Carregando produto..." simples parecia congelado).
    if (!estaEmModoDemo()) {
        caixa.innerHTML = `
            <div class="produto-ml produto-esqueleto">
                <div class="produto-foto esqueleto-bloco"></div>
                <div>
                    <div class="esqueleto-linha do-67"></div>
                    <div class="esqueleto-linha do-100"></div>
                    <div class="esqueleto-linha do-40"></div>
                </div>
                <div class="produto-vendedor esqueleto-bloco"></div>
            </div>`;
    }

    try {
        if (estaEmModoDemo()) return renderizarDemo();

        // detalhe e avaliações viajam juntos
        const [produto, avaliacoes] = await Promise.all([
            apiGet(`/produtos/${idProduto}`),
            apiGet(`/produtos/${idProduto}/avaliacoes`)
        ]);
        produtoAtual = produto;
        renderizar(produto, avaliacoes);
        // coração de favoritar: carrega os IDs e liga o botão renderizado
        if (window.PCForgeFavoritos) {
            PCForgeFavoritos.carregarIds().then(() => {
                PCForgeFavoritos.decorarBotoes(caixa);
            });
        }
    } catch (error) {
        caixa.innerHTML = `<p class="estado-vazio">
            Não foi possível abrir esse produto.<br>
            Confira se a API está rodando em <code>${API_URL}</code><br>
            (${escapeHtml(error.message)})<br><br>
            <a href="produtos.html">Voltar à vitrine</a>
        </p>`;
    }
}

// ------------------------------------------------------------
// Renderização principal
// ------------------------------------------------------------
function renderizar(p, rev) {
    const caixa = document.getElementById('produto-conteudo');
    const urlFoto = p.IMAGEM_URL
        ? p.IMAGEM_URL /* foto real externa (migração 009) tem prioridade */
        : p.TEM_IMAGEM
            ? `${API_URL}/produtos/${p.ID}/imagem?v=${p.IMG_VERSAO || 0}`
            : null;

    const nota = Number(p.PRODUTO_NOTA || 0);
    const notaLoja = Number(p.LOJA_NOTA || 0);
    const qtdAval = Number(p.AVALIACOES_QTD || 0);
    const logado = JSON.parse(sessionStorage.getItem('cliente') || 'null');

    // SEO: o <title> estático vira o nome real do produto (como loja.html já faz)
    document.title = `${p.NOME} | PC Forge`;

    caixa.innerHTML = `
    <nav class="migalhas" aria-label="Você está aqui">
        <a href="produtos.html">Vitrine</a>
        <span>›</span>
        <span>${escapeHtml(p.CATEGORIA)}</span>
        <span>›</span>
        <strong>${escapeHtml(p.NOME)}</strong>
    </nav>

    <div class="produto-ml">
        <figure class="produto-foto ${urlFoto ? 'com-foto' : ''}" id="produto-foto">
            ${urlFoto
                ? `<img src="${escapeHtml(urlFoto)}" alt="${escapeHtml(p.NOME)}">`
                : `<span class="produto-foto-icone">${iconeDe(p.CATEGORIA)}</span>`}
        </figure>

        <div class="produto-compra">
            <span class="produto-categoria">${escapeHtml(p.CATEGORIA)}</span>
            <h1>${escapeHtml(p.NOME)}</h1>

            <a class="produto-nota-resumo" href="#avaliacoes">
                ${estrelasHtml(nota)}
                <strong>${nota > 0 ? nota.toFixed(1) : 'Sem nota ainda'}</strong>
                <span>(${qtdAval} ${qtdAval === 1 ? 'avaliação' : 'avaliações'})</span>
            </a>

            <div class="produto-preco">${formatarPreco(p.PRECO)}</div>

            <span class="cartao-frete">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M2 6h11v10H2z" stroke="currentColor" stroke-width="1.6"/>
                    <path d="M13 9h4l3 3.5V16h-7z" stroke="currentColor" stroke-width="1.6"/>
                    <circle cx="6" cy="18" r="1.8" fill="currentColor"/>
                    <circle cx="16.5" cy="18" r="1.8" fill="currentColor"/>
                </svg>
                Frete grátis
            </span>

            <div class="produto-acoes">
                <span class="produto-qtd">
                    <label for="qtd-produto" class="vendedor-meta">Quantidade</label>
                    <div class="qtd-produto">
                        <button type="button" class="qtd-btn" id="qtd-menos" aria-label="Diminuir quantidade">−</button>
                        <input id="qtd-produto" class="qtd-num" type="number" min="1" max="99" step="1" value="1" inputmode="numeric" aria-live="polite">
                        <button type="button" class="qtd-btn" id="qtd-mais" aria-label="Aumentar quantidade">+</button>
                    </div>
                </span>
                <button type="button" class="produto-comprar" id="botao-comprar">Comprar agora</button>
                <button type="button" class="produto-carrinho" id="botao-carrinho">Adicionar ao carrinho</button>
                ${window.PCForgeFavoritos ? PCForgeFavoritos.coracaoHtml(p.ID) : ''}
            </div>
        </div>

        <aside class="produto-vendedor">
            <h2>Vendido por</h2>
            <a class="vendedor-link" href="loja.html?id=${encodeURIComponent(p.ID_LOJA)}">
                <span class="vendedor-nome">${escapeHtml(p.LOJA_NOME)}</span>
                ${estrelasHtml(notaLoja)}
                <span class="vendedor-meta">
                    ${notaLoja > 0
                        ? `${notaLoja.toFixed(1)} de 5 (média da loja, ${Number(p.LOJA_AVALIACOES_QTD)} avaliações)`
                        : 'Loja nova, sem avaliações ainda'}
                </span>
                <span class="vendedor-ver">Ver a página da loja ›</span>
            </a>
            ${p.LOJA_DESCRICAO ? `<p class="vendedor-descricao">${escapeHtml(p.LOJA_DESCRICAO)}</p>` : ''}
        </aside>
    </div>

    <section class="produto-descricao">
        <h2>Descrição do produto</h2>
        <p>${escapeHtml(p.DESCRICAO) || 'O vendedor ainda não escreveu uma descrição para este produto.'}</p>
    </section>

    <section class="produto-avaliacoes" id="avaliacoes">
        <h2>Avaliações do produto</h2>
        <div id="avaliacoes-corpo">${montarAvaliacoesHtml(rev, logado)}</div>
    </section>

    <a class="voltar-vitrine" href="produtos.html">‹ Continuar comprando</a>
    `;

    // foto que falhou -> ícone da categoria
    const fig = document.getElementById('produto-foto');
    const img = fig.querySelector('img');
    if (img) img.addEventListener('error', () => {
        fig.classList.remove('com-foto');
        if (!fig.querySelector('.produto-foto-icone')) {
            const span = document.createElement('span');
            span.className = 'produto-foto-icone';
            span.textContent = iconeDe(p.CATEGORIA);
            fig.appendChild(span);
        }
        img.remove();
    });

    // ações do carrinho (sem login -> guarda o produto e leva pro login)
    const itemCarrinho = {
        ID: p.ID, NOME: p.NOME, PRECO: p.PRECO,
        ID_LOJA: p.ID_LOJA, CATEGORIA: p.CATEGORIA,
        TEM_IMAGEM: p.TEM_IMAGEM, IMG_VERSAO: p.IMG_VERSAO
    };

    // Selecionador de quantidade (botões ± e clamp do campo; handlers no fim do arquivo).
    ligarSelecionadorQuantidade();

    // "Comprar agora": adiciona e LEVA para o carrinho (final dali).
    document.getElementById('botao-comprar').addEventListener('click', (e) =>
        adicionarAoCarrinho(itemCarrinho, e.currentTarget, { aoTerminar: 'carrinho' }));
    document.getElementById('botao-carrinho').addEventListener('click', (e) =>
        adicionarAoCarrinho(itemCarrinho, e.currentTarget));

    notaEscolhida = 0;
    ligarEstrelasEscolha();
    ligarFormularioAvaliacao();
}

// ------------------------------------------------------------
// Bloco de avaliações: resumo + barras + lista + form
// ------------------------------------------------------------
function montarAvaliacoesHtml(rev, logado) {
    const r = rev.resumo;
    const total = Number(r.TOTAL) || 0;
    const media = r.MEDIA === null ? null : Number(r.MEDIA);
    const contagens = [5, 4, 3, 2, 1].map((n) => Number(r[['CINCO', 'QUATRO', 'TRES', 'DOIS', 'UM'][5 - n]] || 0));

    let geral;
    if (total === 0) {
        geral = `<p class="sem-avaliacoes">Este produto ainda não tem avaliações.${logado ? ' Se você já comprou, seja o primeiro a avaliar!' : ''}</p>`;
    } else {
        geral = `
        <div class="avaliacao-resumo">
            <div class="avaliacao-media">
                <span class="avaliacao-big">${media.toFixed(1)}</span>
                ${estrelasHtml(media, 'grande')}
                <span class="avaliacao-total">${total} ${total === 1 ? 'avaliação' : 'avaliações'} de compradores</span>
            </div>
            <div class="avaliacao-barras">
                ${[5, 4, 3, 2, 1].map((n, i) => {
                    const pct = Math.round((contagens[i] / total) * 100);
                    return `
                    <div class="avaliacao-barra">
                        <span class="barra-estrela">${n} ★</span>
                        <span class="barra-trilho"><span class="barra-cor" style="width:${pct}%"></span></span>
                        <span class="barra-qtd">${contagens[i]}</span>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    }

    const itens = rev.lista.map((a) => `
        <article class="avaliacao-item">
            <header>
                ${estrelasHtml(a.NOTA)}
                <strong class="avaliacao-autor">${escapeHtml(a.NOME_CLIENTE)}</strong>
                <span class="avaliacao-data">${escapeHtml(a.DATA_BR)}</span>
            </header>
            ${a.COMENTARIO
                ? `<p class="avaliacao-texto">${escapeHtml(a.COMENTARIO)}</p>`
                : '<p class="avaliacao-texto avaliacao-sem-texto">(sem comentário)</p>'}
        </article>
    `).join('');

    const formulario = logado ? `
        <form class="avaliacao-form" id="form-avaliacao">
            <h3>Avaliar este produto</h3>
            <div class="estrelas-escolher" id="estrelas-escolher" role="radiogroup" aria-label="Sua nota">
                ${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="estrela-escolher" data-nota="${n}" aria-label="${n} estrelas">★</button>`).join('')}
            </div>
            <textarea id="avaliacao-comentario" maxlength="1000" placeholder="Como foi a sua experiência? (opcional)"></textarea>
            <button type="submit" class="produto-carrinho">Enviar avaliação</button>
        </form>
    ` : `
        <div class="avaliacao-entrar">
            <a href="login.html">Entre na sua conta</a> para avaliar este produto.
            <small>Lembrando: só quem comprou o produto consegue avaliar.</small>
        </div>
    `;

    return geral + `<div class="avaliacao-lista">${itens}</div>` + formulario;
}

// ------------------------------------------------------------
// Form: estrelas clicáveis + envio pra API
// ------------------------------------------------------------
function ligarEstrelasEscolha() {
    const caixa = document.getElementById('estrelas-escolher');
    if (!caixa) return;

    const botoes = [...caixa.querySelectorAll('.estrela-escolher')];
    const pintar = (ate) => {
        botoes.forEach((b) => b.classList.toggle('escolhida', Number(b.dataset.nota) <= ate));
    };

    botoes.forEach((b) => {
        b.addEventListener('mouseenter', () => pintar(Number(b.dataset.nota)));
        b.addEventListener('mouseleave', () => pintar(notaEscolhida));
        b.addEventListener('click', () => {
            notaEscolhida = Number(b.dataset.nota);
            pintar(notaEscolhida);
        });
    });
}

function ligarFormularioAvaliacao() {
    const form = document.getElementById('form-avaliacao');
    if (!form) return;

    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        if (notaEscolhida < 1) {
            mostrarToast('Escolha de 1 a 5 estrelas antes de enviar.', 'aviso');
            return;
        }
        const comentario = document.getElementById('avaliacao-comentario').value;

        try {
            const r = await apiPost(`/produtos/${idProduto}/avaliacao`, {
                nota: notaEscolhida,
                comentario
            });
            mostrarToast(r.resposta, 'sucesso');
            // Recarrega pra atualizar a lista, as barras e a média do topo
            carregarProduto();
        } catch (error) {
            if (!error.sessaoExpirada) mostrarToast(error.message, 'erro');
        }
    });
}

// ------------------------------------------------------------
// Modo visualização (demo): dados de exemplo, sem reviews reais
// ------------------------------------------------------------
function renderizarDemo() {
    const p = PRODUTOS_DEMO.find((x) => x.ID === idProduto);
    const caixa = document.getElementById('produto-conteudo');

    if (!p) {
        caixa.innerHTML = '<p class="estado-vazio">Produto de exemplo não encontrado. <a href="produtos.html">Voltar</a></p>';
        return;
    }

    caixa.innerHTML = `
    <nav class="migalhas" aria-label="Você está aqui">
        <a href="produtos.html">Vitrine</a><span>›</span>
        <span>${escapeHtml(p.CATEGORIA)}</span><span>›</span>
        <strong>${escapeHtml(p.NOME)}</strong>
    </nav>
    <div class="produto-ml">
        <figure class="produto-foto"><span class="produto-foto-icone">${iconeDe(p.CATEGORIA)}</span></figure>
        <div class="produto-compra">
            <span class="produto-categoria">${escapeHtml(p.CATEGORIA)}</span>
            <h1>${escapeHtml(p.NOME)}</h1>
            <div class="produto-preco">${formatarPreco(p.PRECO)}</div>
            <span class="cartao-frete">🚚 Frete grátis</span>
            <div class="produto-acoes">
                <button type="button" class="produto-carrinho" id="botao-carrinho">Adicionar ao carrinho</button>
            </div>
        </div>
        <aside class="produto-vendedor">
            <h2>Vendido por</h2>
            <span class="vendedor-nome">${escapeHtml(p.LOJA_NOME)}</span>
            <p class="vendedor-descricao">Produto de exemplo do modo visualização — sem loja nem avaliações reais.</p>
        </aside>
    </div>
    <section class="produto-descricao">
        <h2>Descrição do produto</h2>
        <p>${escapeHtml(p.NOME)} — item de exemplo da categoria ${escapeHtml(p.CATEGORIA)} no modo visualização.</p>
    </section>
    <section class="produto-avaliacoes"><h2>Avaliações</h2>
        <p class="sem-avaliacoes">As avaliações de exemplo só aparecem no site real, com a API rodando.</p>
    </section>
    <a class="voltar-vitrine" href="produtos.html">‹ Continuar comprando</a>`;

    const demoProduto = { ID: p.ID, NOME: p.NOME, PRECO: p.PRECO, ID_LOJA: p.ID_LOJA, CATEGORIA: p.CATEGORIA };
    document.getElementById('botao-carrinho').addEventListener('click', (e) => adicionarAoCarrinho(demoProduto, e.currentTarget));
}

// ------------------------------------------------------------
// Quantidade escolhida na página do produto (1..99, LIMITE_POR_ITEM do
// backend). Se a página não tem selecionador (modo demo), vale 1.
// ------------------------------------------------------------
function lerQuantidade() {
    const campo = document.getElementById('qtd-produto');
    if (!campo) return 1;
    const n = Math.floor(Number(campo.value));
    return Number.isFinite(n) && n >= 1 ? Math.min(n, 99) : 1;
}

function ligarSelecionadorQuantidade() {
    const campo = document.getElementById('qtd-produto');
    if (!campo) return;
    document.getElementById('qtd-menos').addEventListener('click', () => {
        campo.value = Math.max(1, lerQuantidade() - 1);
    });
    document.getElementById('qtd-mais').addEventListener('click', () => {
        campo.value = Math.min(99, lerQuantidade() + 1);
    });
    campo.addEventListener('change', () => { campo.value = lerQuantidade(); });
}

// ------------------------------------------------------------
// Adicionar ao carrinho (mesma lógica da vitrine)
// opcoes.aoTerminar = 'carrinho' -> depois de adicionar, vai pra tela
// do carrinho (é o que o botão "Comprar agora" promete).
// ------------------------------------------------------------
async function adicionarAoCarrinho(produto, botao, opcoes = {}) {
    if (!sessionStorage.getItem('cliente')) {
        sessionStorage.setItem('produtoPretendido', JSON.stringify({ id: produto.ID, nome: produto.NOME }));
        mostrarToast('Entre na sua conta pra levar esse produto pro carrinho.', 'aviso');
        setTimeout(() => { window.location.href = 'login.html'; }, 1200);
        return;
    }

    const quantidade = lerQuantidade();

    botao.disabled = true;
    try {
        await Carrinho.adicionar(produto, quantidade);
        const rótulo = quantidade > 1 ? `${quantidade}× ${produto.NOME}` : `"${produto.NOME}"`;
        if (opcoes.aoTerminar === 'carrinho') {
            mostrarToast('Adicionado! Revisando seu carrinho...', 'sucesso');
            setTimeout(() => { window.location.href = 'carrinho.html'; }, 500);
        } else {
            mostrarToast(`${rótulo} foi pro seu carrinho.`, 'sucesso');
        }
    } catch (error) {
        if (!error.sessaoExpirada) mostrarToast(error.message, 'erro');
    } finally {
        botao.disabled = false;
    }
}

carregarProduto();
