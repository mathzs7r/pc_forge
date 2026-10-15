// ============================================================
// carrinho-api.js — tudo que o site faz com o carrinho do cliente.
// Carregado em todas as páginas (a barra do topo mostra o contador).
//
// Uso:  const resumo = await Carrinho.adicionar(produto);
//       resumo = { itens: [...], total: 1300.2, quantidade_total: 4 }
//
// Todas as funções que mexem no carrinho devolvem o resumo atualizado e avisam
// a barra do topo (evento "carrinho:atualizado") pra o número do ícone mudar.
//
// Carrinho normal  -> fica no banco, via API (rotas /carrinho/...), preso à conta.
// Modo visualização -> fica no localStorage do navegador (não existe API/banco
//                      nesse modo, então é só pra navegar e testar a tela).
// ============================================================
(function () {
    const CHAVE_CONTAGEM = 'carrinho_qtd';           // cache do número do ícone (sessionStorage)
    const CHAVE_DEMO = 'pcforge_carrinho_demo';      // carrinho do modo visualização (localStorage)
    const LIMITE_POR_ITEM = 99;                      // o mesmo limite da API

    function clienteLogado() {
        try {
            const cliente = JSON.parse(sessionStorage.getItem('cliente'));
            return cliente && cliente.id !== undefined ? cliente : null;
        } catch {
            return null;
        }
    }

    function emModoDemo() {
        return typeof estaEmModoDemo === 'function' && estaEmModoDemo();
    }

    function exigirCliente() {
        const cliente = clienteLogado();
        if (!cliente) {
            const erro = new Error('Entre na sua conta pra usar o carrinho.');
            erro.semLogin = true;
            throw erro;
        }
        return cliente;
    }

    function contagemGuardada() {
        const n = Number(sessionStorage.getItem(CHAVE_CONTAGEM));
        return Number.isFinite(n) && n > 0 ? n : 0;
    }

    // Guarda o número e avisa a barra do topo. Devolve o próprio resumo (pra encadear).
    function publicar(resumo) {
        const quantidade = Number(resumo.quantidade_total) || 0;
        sessionStorage.setItem(CHAVE_CONTAGEM, String(quantidade));
        document.dispatchEvent(new CustomEvent('carrinho:atualizado', { detail: { quantidade } }));
        return resumo;
    }

    // ---------- modo visualização (carrinho local) ----------
    function lerLocal() {
        try {
            const lista = JSON.parse(localStorage.getItem(CHAVE_DEMO));
            return Array.isArray(lista) ? lista : [];
        } catch {
            return [];
        }
    }

    function salvarLocal(itens) {
        localStorage.setItem(CHAVE_DEMO, JSON.stringify(itens));
    }

    // Mesma conta da API: dinheiro em centavos (inteiros), pra não herdar erro de ponto flutuante.
    function resumoLocal(itens) {
        let totalCentavos = 0;
        let quantidadeTotal = 0;
        const lista = itens.map((item) => {
            const subtotalCentavos = Math.round(item.PRECO * 100) * item.QUANTIDADE;
            totalCentavos += subtotalCentavos;
            quantidadeTotal += item.QUANTIDADE;
            return { ...item, SUBTOTAL: subtotalCentavos / 100 };
        });
        return { itens: lista, total: totalCentavos / 100, quantidade_total: quantidadeTotal };
    }

    function itemLocalDe(produto) {
        const base = produto.NOME
            ? produto
            : (typeof PRODUTOS_DEMO !== 'undefined' ? PRODUTOS_DEMO.find((p) => p.ID === Number(produto.ID)) : null);
        if (!base) return null;
        return {
            ID_PRODUTO: base.ID,
            NOME: base.NOME,
            CATEGORIA: base.CATEGORIA,
            PRECO: Number(base.PRECO),
            QUANTIDADE: 0,
            ID_LOJA: base.ID_LOJA || null,
            LOJA_NOME: base.LOJA_NOME,
            TEM_IMAGEM: 0,
            IMG_VERSAO: 0,
            IMAGEM_URL: base.IMAGEM_URL
        };
    }

    // ---------- operações ----------
    async function obter() {
        if (emModoDemo()) return publicar(resumoLocal(lerLocal()));
        const cliente = exigirCliente();
        return publicar(await apiGet(`/carrinho/${cliente.id}`));
    }

    // "produto" precisa ao menos de { ID }. Se já está no carrinho, soma na quantidade.
    async function adicionar(produto, quantidade) {
        const qtd = quantidade === undefined ? 1 : quantidade;
        if (emModoDemo()) {
            exigirCliente();
            const itens = lerLocal();
            const existente = itens.find((i) => i.ID_PRODUTO === Number(produto.ID));
            if (existente) {
                existente.QUANTIDADE = Math.min(existente.QUANTIDADE + qtd, LIMITE_POR_ITEM);
            } else {
                const novo = itemLocalDe(produto);
                if (!novo) throw new Error('Esse produto não está mais disponível.');
                novo.QUANTIDADE = Math.min(qtd, LIMITE_POR_ITEM);
                itens.unshift(novo);
            }
            salvarLocal(itens);
            return publicar(resumoLocal(itens));
        }
        const cliente = exigirCliente();
        return publicar(await apiPost(`/carrinho/${cliente.id}/itens`, { id_produto: produto.ID, quantidade: qtd }));
    }

    // Define a quantidade (não soma). 1 a 99.
    async function alterarQuantidade(idProduto, quantidade) {
        if (emModoDemo()) {
            const itens = lerLocal();
            const item = itens.find((i) => i.ID_PRODUTO === Number(idProduto));
            if (item) item.QUANTIDADE = Math.max(1, Math.min(quantidade, LIMITE_POR_ITEM));
            salvarLocal(itens);
            return publicar(resumoLocal(itens));
        }
        const cliente = exigirCliente();
        return publicar(await apiPut(`/carrinho/${cliente.id}/itens/${idProduto}`, { quantidade }));
    }

    async function remover(idProduto) {
        if (emModoDemo()) {
            const itens = lerLocal().filter((i) => i.ID_PRODUTO !== Number(idProduto));
            salvarLocal(itens);
            return publicar(resumoLocal(itens));
        }
        const cliente = exigirCliente();
        return publicar(await apiDelete(`/carrinho/${cliente.id}/itens/${idProduto}`));
    }

    async function esvaziar() {
        if (emModoDemo()) {
            salvarLocal([]);
            return publicar(resumoLocal([]));
        }
        const cliente = exigirCliente();
        return publicar(await apiDelete(`/carrinho/${cliente.id}`));
    }

    // dados = { id_endereco, forma_pagamento }. Devolve { id_compra, total, ... }.
    async function finalizar(dados) {
        if (emModoDemo()) {
            const resumo = resumoLocal(lerLocal());
            salvarLocal([]);
            publicar(resumoLocal([]));
            return { resposta: 'Pedido simulado (modo visualização).', id_compra: null, total: resumo.total, quantidade_total: resumo.quantidade_total, demo: true };
        }
        const cliente = exigirCliente();
        const pedido = await apiPost(`/carrinho/${cliente.id}/finalizar`, dados);
        publicar({ quantidade_total: 0 });
        return pedido;
    }

    // Atualiza só o número do ícone (a barra do topo chama isso em toda página).
    async function atualizarContador() {
        if (!clienteLogado()) {
            publicar({ quantidade_total: 0 });
            return;
        }
        try {
            await obter();
        } catch (_) {
            // O número é só um enfeite: se falhar (API fora do ar), fica o último valor.
        }
    }

    window.Carrinho = {
        LIMITE_POR_ITEM,
        contagemGuardada,
        obter,
        adicionar,
        alterarQuantidade,
        remover,
        esvaziar,
        finalizar,
        atualizarContador
    };
})();
