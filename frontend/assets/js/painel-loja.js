(function () {
    const lojaSalva = sessionStorage.getItem('loja');

    if (!lojaSalva) {
        window.location.href = 'loja-login.html';
        return;
    }

    const loja = JSON.parse(lojaSalva);
    let produtosLoja = [];
    let proximoIdDemo = 9000;
    let produtoEmEdicaoId = null; // null = formulário está cadastrando; senão, é o ID sendo editado

    document.getElementById('nome-loja').textContent = loja.nome;

    const form = document.getElementById('form-produto');
    const botaoSalvar = document.getElementById('botao-salvar-produto');
    const botaoCancelarEdicao = document.getElementById('botao-cancelar-edicao');

    function formatarPreco(valor) {
        return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function escapeHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto ?? '';
        return div.innerHTML;
    }

    function mostrarErro(mensagem) {
        const el = document.getElementById('mensagem-erro');
        el.textContent = mensagem;
        el.style.display = 'block';
        document.getElementById('mensagem-produto').style.display = 'none';
    }

    function mostrarSucesso(mensagem) {
        const el = document.getElementById('mensagem-produto');
        el.textContent = mensagem;
        el.style.display = 'block';
        document.getElementById('mensagem-erro').style.display = 'none';
    }

    function esconderMensagens() {
        document.getElementById('mensagem-erro').style.display = 'none';
        document.getElementById('mensagem-produto').style.display = 'none';
    }

    async function carregarProdutos() {
        const lista = document.getElementById('lista-produtos');
        lista.innerHTML = '<p class="estado-carregando">Carregando produtos...</p>';

        try {
            if (estaEmModoDemo()) {
                // Modo visualização: usa os produtos de exemplo como se fossem
                // desta loja, só pra dar pra testar a tela sem API/MySQL.
                if (produtosLoja.length === 0) {
                    produtosLoja = PRODUTOS_DEMO.map((p) => ({
                        ID: p.ID, NOME: p.NOME, CATEGORIA: p.CATEGORIA, PRECO: p.PRECO, DESCRICAO: ''
                    }));
                }
            } else {
                produtosLoja = await apiGet(`/produtos/loja/${loja.id}`);
            }
            renderizarLista();
        } catch (error) {
            lista.innerHTML = `<p class="estado-vazio">Não foi possível carregar seus produtos. (${escapeHtml(error.message)})</p>`;
        }
    }

    function renderizarLista() {
        const lista = document.getElementById('lista-produtos');

        if (produtosLoja.length === 0) {
            lista.innerHTML = '<p class="estado-vazio">Você ainda não cadastrou nenhum produto. Use o formulário ao lado pra adicionar o primeiro.</p>';
            return;
        }

        lista.innerHTML = produtosLoja.map((produto) => `
            <div class="item-produto-loja">
                <div>
                    <span class="item-categoria">${escapeHtml(produto.CATEGORIA)}</span>
                    <span class="item-nome">${escapeHtml(produto.NOME)}</span>
                    ${produto.DESCRICAO ? `<span class="item-descricao">${escapeHtml(produto.DESCRICAO)}</span>` : ''}
                </div>
                <div class="item-acoes">
                    <span class="item-preco">${formatarPreco(produto.PRECO)}</span>
                    <button type="button" class="item-editar" data-id="${produto.ID}">Editar</button>
                    <button type="button" class="item-excluir" data-id="${produto.ID}">Excluir</button>
                </div>
            </div>
        `).join('');

        lista.querySelectorAll('.item-editar').forEach((botao) => {
            botao.addEventListener('click', () => iniciarEdicao(botao.dataset.id));
        });
        lista.querySelectorAll('.item-excluir').forEach((botao) => {
            botao.addEventListener('click', () => excluirProduto(botao.dataset.id));
        });
    }

    function iniciarEdicao(id) {
        const produto = produtosLoja.find((p) => String(p.ID) === String(id));
        if (!produto) return;

        esconderMensagens();
        produtoEmEdicaoId = produto.ID;

        document.getElementById('nome-produto').value = produto.NOME;
        document.getElementById('categoria-produto').value = produto.CATEGORIA;
        document.getElementById('preco-produto').value = produto.PRECO;
        document.getElementById('descricao-produto').value = produto.DESCRICAO || '';

        botaoSalvar.value = 'Salvar alterações';
        botaoCancelarEdicao.hidden = false;
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function cancelarEdicao() {
        produtoEmEdicaoId = null;
        form.reset();
        botaoSalvar.value = 'Adicionar produto';
        botaoCancelarEdicao.hidden = true;
        esconderMensagens();
    }

    async function excluirProduto(id) {
        if (!confirm('Excluir este produto? Essa ação não pode ser desfeita.')) return;

        if (estaEmModoDemo()) {
            produtosLoja = produtosLoja.filter((p) => String(p.ID) !== String(id));
            if (String(produtoEmEdicaoId) === String(id)) cancelarEdicao();
            renderizarLista();
            mostrarToast('Produto excluído com sucesso.', 'sucesso');
            return;
        }

        try {
            const resposta = await fetch(`${API_URL}/produtos/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_loja: loja.id })
            });
            const dados = await resposta.json().catch(() => ({}));
            if (!resposta.ok) {
                throw new Error(dados.resposta || 'Não foi possível excluir o produto.');
            }
            if (String(produtoEmEdicaoId) === String(id)) cancelarEdicao();
            await carregarProdutos();
            mostrarToast('Produto excluído com sucesso.', 'sucesso');
        } catch (error) {
            mostrarToast(error.message, 'erro');
        }
    }

    botaoCancelarEdicao.addEventListener('click', cancelarEdicao);

    form.addEventListener('submit', async function (evento) {
        evento.preventDefault();
        esconderMensagens();

        const nome = document.getElementById('nome-produto').value.trim();
        const categoria = document.getElementById('categoria-produto').value;
        const preco = document.getElementById('preco-produto').value;
        const descricao = document.getElementById('descricao-produto').value.trim();

        if (!nome || !categoria || !preco) {
            mostrarErro('Preencha nome, categoria e preço.');
            return;
        }

        const estaEditando = produtoEmEdicaoId !== null;

        try {
            if (estaEmModoDemo()) {
                if (estaEditando) {
                    const produto = produtosLoja.find((p) => String(p.ID) === String(produtoEmEdicaoId));
                    if (produto) {
                        produto.NOME = nome;
                        produto.CATEGORIA = categoria;
                        produto.PRECO = Number(preco);
                        produto.DESCRICAO = descricao;
                    }
                } else {
                    produtosLoja.unshift({
                        ID: proximoIdDemo++,
                        NOME: nome,
                        CATEGORIA: categoria,
                        PRECO: Number(preco),
                        DESCRICAO: descricao
                    });
                }
                renderizarLista();
            } else if (estaEditando) {
                await apiPut(`/produtos/${produtoEmEdicaoId}`, {
                    id_loja: loja.id,
                    nome,
                    categoria,
                    descricao,
                    preco: Number(preco)
                });
                await carregarProdutos();
            } else {
                await apiPost('/produtos', {
                    id_loja: loja.id,
                    nome,
                    categoria,
                    descricao,
                    preco: Number(preco)
                });
                await carregarProdutos();
            }

            const estavaEditando = estaEditando;
            cancelarEdicao();
            mostrarSucesso(estavaEditando
                ? 'Produto atualizado com sucesso!'
                : 'Produto cadastrado! Já aparece na sua lista e na vitrine pública.');
        } catch (error) {
            mostrarErro(error.message);
        }
    });

    document.getElementById('botao-sair').addEventListener('click', function () {
        sessionStorage.removeItem('loja');
        window.location.href = 'loja-login.html';
    });

    carregarProdutos();
})();
