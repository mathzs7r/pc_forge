// ============================================================
// loja-publica.js — pagina pública de uma loja (loja.html?id=3)
//
// Cabeçalho: nome, "sobre" e números da loja (AGORA com estrelas
// e média de avaliações, estilo Mercado Livre).
// Os produtos em si são carregados pelo produtos.js (filtrado).
// O rodapé "Avaliações da loja" soma o que os compradores
// falaram de TODOS os produtos dela (GET /loja/:id/avaliacoes).
// ============================================================
(function () {
    const U = PCForgeUtil;
    const idLoja = new URLSearchParams(window.location.search).get('id');

    const elNome = document.getElementById('loja-nome');
    const elDescricao = document.getElementById('loja-descricao');
    const elMeta = document.getElementById('loja-meta');

    function lojaNaoEncontrada(mensagem) {
        elNome.textContent = 'Loja não encontrada';
        elDescricao.innerHTML = `${U.escapeHtml(mensagem)}<br><a href="produtos.html" style="color: var(--accent); font-weight: 700;">Voltar para a vitrine</a>`;
        elMeta.innerHTML = '';
        // Esconde (em vez de limpar) porque o produtos.js escreve nesses elementos depois.
        document.getElementById('filtros').hidden = true;
        document.getElementById('secao-produtos').hidden = true;
        document.getElementById('loja-avaliacoes').hidden = true;
    }

    // Bloco de estrelas + média, clicável (desce até a seção de avaliações)
    function blocoNota(nota, qtd) {
        const m = Number(nota) || 0;
        const n = Number(qtd) || 0;
        const texto = m > 0
            ? `${U.escapeHtml(m.toFixed(1))} de 5 (${n} ${n === 1 ? 'avaliação de compradores' : 'avaliações de compradores'})`
            : 'Loja nova, sem avaliações ainda';
        return `
        <a class="loja-nota" href="#loja-avaliacoes" title="Ver as avaliações da loja">
            ${U.estrelasHtml(m)}
            <span>${texto}</span>
        </a>`;
    }

    // ------------------------------------------------------------
    // Seção "Avaliações da loja": resumo + barras + lista
    // ------------------------------------------------------------
    function montarAvaliacoesHtml(rev) {
        const r = rev.resumo;
        const total = Number(r.TOTAL) || 0;
        const media = r.MEDIA === null ? null : Number(r.MEDIA);
        const contagens = [5, 4, 3, 2, 1].map((n) => Number(r[['CINCO', 'QUATRO', 'TRES', 'DOIS', 'UM'][5 - n]] || 0));

        let geral;
        if (total === 0) {
            geral = '<p class="sem-avaliacoes">Esta loja ainda não recebeu avaliações.</p>';
        } else {
            geral = `
            <div class="avaliacao-resumo">
                <div class="avaliacao-media">
                    <span class="avaliacao-big">${media.toFixed(1)}</span>
                    ${U.estrelasHtml(media, 'grande')}
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
                    ${U.estrelasHtml(a.NOTA)}
                    <strong class="avaliacao-autor">${U.escapeHtml(a.NOME_CLIENTE)}</strong>
                    <span class="avaliacao-data">${U.escapeHtml(a.DATA_BR)}</span>
                </header>
                <a class="avaliacao-produto" href="produto.html?id=${encodeURIComponent(a.PRODUTO_ID)}">
                    avaliou: ${U.escapeHtml(a.PRODUTO_NOME)} ›
                </a>
                ${a.COMENTARIO
                    ? `<p class="avaliacao-texto">${U.escapeHtml(a.COMENTARIO)}</p>`
                    : '<p class="avaliacao-texto avaliacao-sem-texto">(sem comentário)</p>'}
            </article>
        `).join('');

        return geral + `<div class="avaliacao-lista">${itens}</div>`;
    }

    async function carregarAvaliacoes() {
        const corpo = document.getElementById('loja-avaliacoes-corpo');
        try {
            const rev = await apiGet(`/loja/${encodeURIComponent(idLoja)}/avaliacoes`);
            corpo.innerHTML = montarAvaliacoesHtml(rev);
        } catch (error) {
            corpo.innerHTML = `<p class="sem-avaliacoes">Não foi possível carregar as avaliações agora. (${U.escapeHtml(error.message)})</p>`;
        }
    }

    async function carregar() {
        if (estaEmModoDemo()) {
            elNome.textContent = 'Loja Exemplo PC Forge';
            elDescricao.textContent = 'Modo visualização: aqui apareceria o texto "sobre a loja" escrito pelo vendedor.';
            document.getElementById('loja-avaliacoes').hidden = true;
            return;
        }

        if (!idLoja) {
            lojaNaoEncontrada('Nenhuma loja foi informada no endereço.');
            return;
        }

        try {
            const loja = await apiGet(`/loja/${encodeURIComponent(idLoja)}/publico`);
            document.title = `${loja.NOME} | PC Forge`;

            // Nome + logo + estrelas (clicáveis, descem pra avaliações)
            elNome.innerHTML = `
                <span class="loja-emblema" aria-hidden="true">
                    ${urlImagemLoja(loja)
                        ? `<img src="${U.escapeHtml(urlImagemLoja(loja))}" alt="" onerror="this.parentElement.classList.add('sem-foto');this.remove()">`
                        : '<span class="loja-emblema-fallback">🔥</span>'}
                </span>
                <span class="loja-nome-texto">${U.escapeHtml(loja.NOME)}</span>
                ${blocoNota(loja.NOTA_MEDIA, loja.AVALIACOES_QTD)}
            `;
            elDescricao.textContent = loja.DESCRICAO || 'Loja parceira da PC Forge.';

            const n = loja.TOTAL_PRODUTOS;
            elMeta.innerHTML = `
                <span><strong>${n}</strong> ${n === 1 ? 'produto' : 'produtos'} à venda</span>
                <span>Na PC Forge desde <strong>${U.escapeHtml(U.mesAno(loja.CRIADO_EM))}</strong></span>
            `;

            // As avaliacoes da loja vem por conta própria (não travam o header)
            carregarAvaliacoes();
        } catch (error) {
            lojaNaoEncontrada(error.message);
        }
    }

    carregar();
})();
