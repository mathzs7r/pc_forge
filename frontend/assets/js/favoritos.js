// ============================================================
// FAVORITOS (lista de desejos) — módulo compartilhado
// Usado por: vitrine (produtos.js), página do produto (produto.js)
// e perfil do cliente (perfil-cliente.js).
//
// Endpoints (routes/perfil.js, migração 010):
//   GET    /perfil/cliente/:id/favoritos            (lista p/ "Meus favoritos")
//   POST   /perfil/cliente/:id/favoritos            { id_produto }
//   DELETE /perfil/cliente/:id/favoritos/:idProduto
//
// O navegador guarda só os IDs pra pintar os corações; a lista
// completa (com dados do produto) é a mesma rota GET.
// Sem login: o clique no coração redireciona pro login (igual carrinho).
// ============================================================
window.PCForgeFavoritos = (function () {
    let ids = new Set();
    let listaCache = null; // produtos completos, só quando o perfil pedir

    function sessao() {
        // lê direto do sessionStorage (sem depender de PCForgeUtil/util.js,
        // que nem toda página de vitrine carrega)
        try {
            return JSON.parse(sessionStorage.getItem('cliente') || 'null');
        } catch (e) {
            return null;
        }
    }
    function logado() { return Boolean(sessao()) && typeof estaEmModoDemo === 'function' && !estaEmModoDemo(); }

    async function carregarIds() {
        if (!logado()) return false;
        try {
            const lista = await apiGet(`/perfil/cliente/${sessao().id}/favoritos`);
            ids = new Set(lista.map((p) => p.ID));
            listaCache = lista;
            return true;
        } catch (e) {
            return false; // sem favoritos pintados, mas sem quebrar a página
        }
    }

    function tem(idProduto) { return ids.has(Number(idProduto)); }

    // troca coração vazio cheio: POST ou DELETE conforme estado atual
    async function alternar(idProduto) {
        if (!logado()) {
            window.location.href = 'login.html';
            return null;
        }
        const id = Number(idProduto);
        if (tem(id)) {
            await apiDelete(`/perfil/cliente/${sessao().id}/favoritos/${id}`);
            ids.delete(id);
            return { favorito: false };
        }
        await apiPost(`/perfil/cliente/${sessao().id}/favoritos`, { id_produto: id });
        ids.add(id);
        return { favorito: true };
    }

    async function listar() {
        await carregarIds();
        return listaCache || [];
    }

    function invalidar() { listaCache = null; }

    // ---------- coração nos cards da vitrine ----------
    // Depois de renderizar os cards, chame isto de vez pra ligar os botões.
    function decorarBotoes(container) {
        if (!logado()) return; // sem login, corações nem aparecem

        container.querySelectorAll('[data-favoritar]').forEach((botao) => {
            if (botao.dataset.ligado) return;
            botao.dataset.ligado = '1';
            const id = botao.dataset.favoritar;
            pintar(botao, tem(id));
            botao.addEventListener('click', async (evento) => {
                evento.preventDefault();
                evento.stopPropagation();
                botao.disabled = true;
                try {
                    const r = await alternar(id);
                    if (!r) return; // redirecionados pro login
                    pintar(botao, r.favorito);
                    mostrarToast(r.favorito ? 'Adicionado aos favoritos!' : 'Removido dos favoritos.', 'sucesso');
                } catch (e) {
                    mostrarToast(e.message, 'erro');
                } finally {
                    botao.disabled = false;
                }
            });
        });
    }

    function pintar(botao, ativo) {
        botao.classList.toggle('favoritado', ativo);
        botao.setAttribute('aria-pressed', String(ativo));
        botao.setAttribute('aria-label', ativo ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
        botao.textContent = ativo ? '♥' : '♡';
    }

    const htmlBase = '<button type="button" class="cartao-favorito" data-favoritar="__ID__" aria-label="Adicionar aos favoritos">♡</button>';
    function coracaoHtml(idProduto) {
        if (!logado()) return '';
        return htmlBase.replace('__ID__', Number(idProduto));
    }

    return { carregarIds, tem, alternar, listar, invalidar, decorarBotoes, coracaoHtml };
})();
