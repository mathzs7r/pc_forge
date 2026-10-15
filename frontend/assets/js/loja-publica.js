// Cabeçalho da página pública da loja (loja.html?id=3): nome, "sobre" e números.
// Os produtos em si são carregados pelo produtos.js (filtrado por essa loja).
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
    }

    async function carregar() {
        if (estaEmModoDemo()) {
            elNome.textContent = 'Loja Exemplo PC Forge';
            elDescricao.textContent = 'Modo visualização: aqui apareceria o texto "sobre a loja" escrito pelo vendedor.';
            return;
        }
        if (!idLoja) {
            lojaNaoEncontrada('Nenhuma loja foi informada no endereço.');
            return;
        }

        try {
            const loja = await apiGet(`/loja/${encodeURIComponent(idLoja)}/publico`);
            document.title = `${loja.NOME} | PC Forge`;
            elNome.textContent = loja.NOME;
            elDescricao.textContent = loja.DESCRICAO || 'Loja parceira da PC Forge.';

            const n = loja.TOTAL_PRODUTOS;
            elMeta.innerHTML = `
                <span><strong>${n}</strong> ${n === 1 ? 'produto' : 'produtos'} à venda</span>
                <span>Na PC Forge desde <strong>${U.escapeHtml(U.mesAno(loja.CRIADO_EM))}</strong></span>
            `;
        } catch (error) {
            lojaNaoEncontrada(error.message);
        }
    }

    carregar();
})();
