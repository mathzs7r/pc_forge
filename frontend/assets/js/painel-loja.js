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
    let fotoNova = null;          // foto escolhida agora (data URL já reduzida), ou null
    let removerFoto = false;      // true = ao salvar, apagar a foto que o produto já tinha
    let produtoTinhaFoto = false; // o produto em edição já tinha foto guardada?

    document.getElementById('nome-loja').textContent = loja.nome;

    const form = document.getElementById('form-produto');
    const botaoSalvar = document.getElementById('botao-salvar-produto');
    const botaoCancelarEdicao = document.getElementById('botao-cancelar-edicao');
    const campoFoto = document.getElementById('foto-produto');
    const blocoPreview = document.getElementById('foto-preview');
    const imgPreview = document.getElementById('foto-preview-img');
    const botaoRemoverFoto = document.getElementById('botao-remover-foto');

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

    // ---------- foto do produto ----------
    function mostrarPreview(url) {
        imgPreview.src = url;
        blocoPreview.hidden = false;
    }

    function limparFoto() {
        fotoNova = null;
        removerFoto = false;
        produtoTinhaFoto = false;
        campoFoto.value = '';
        imgPreview.removeAttribute('src');
        blocoPreview.hidden = true;
    }

    campoFoto.addEventListener('change', async function () {
        const arquivo = campoFoto.files[0];
        if (!arquivo) return;

        try {
            fotoNova = await prepararImagemParaUpload(arquivo);
            removerFoto = false;
            mostrarPreview(fotoNova);
        } catch (error) {
            // Escolha inválida: só avisa e limpa o campo de arquivo. Tudo o mais
            // (preview e foto já escolhida antes, ou a foto atual do produto)
            // continua exatamente como estava na tela.
            campoFoto.value = '';
            mostrarToast(error.message, 'erro');
        }
    });

    botaoRemoverFoto.addEventListener('click', function () {
        fotoNova = null;
        campoFoto.value = '';
        imgPreview.removeAttribute('src');
        blocoPreview.hidden = true;
        // Editando um produto que já tinha foto: avisa a API pra apagar ao salvar.
        removerFoto = produtoEmEdicaoId !== null && produtoTinhaFoto;
    });

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

        lista.innerHTML = produtosLoja.map((produto) => {
            const urlFoto = urlImagemProduto(produto);
            return `
            <div class="item-produto-loja">
                <div class="item-principal">
                    <div class="item-thumb${urlFoto ? ' com-foto' : ''}">
                        ${urlFoto ? `<img src="${escapeHtml(urlFoto)}" alt="" loading="lazy">` : ''}
                        <span class="item-thumb-icone">📦</span>
                    </div>
                    <div>
                        <span class="item-categoria">${escapeHtml(produto.CATEGORIA)}</span>
                        <span class="item-nome">${escapeHtml(produto.NOME)}</span>
                        ${produto.DESCRICAO ? `<span class="item-descricao">${escapeHtml(produto.DESCRICAO)}</span>` : ''}
                    </div>
                </div>
                <div class="item-acoes">
                    <span class="item-preco">${formatarPreco(produto.PRECO)}</span>
                    <button type="button" class="item-editar" data-id="${produto.ID}">Editar</button>
                    <button type="button" class="item-excluir" data-id="${produto.ID}">Excluir</button>
                </div>
            </div>
        `;
        }).join('');

        // Foto que falhou ao carregar (API caiu, produto sem foto...): volta pro ícone.
        lista.querySelectorAll('.item-thumb img').forEach((img) => {
            img.addEventListener('error', () => {
                img.parentElement.classList.remove('com-foto');
                img.remove();
            });
        });

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

        limparFoto();
        const urlFoto = urlImagemProduto(produto);
        produtoTinhaFoto = Boolean(urlFoto);
        if (urlFoto) mostrarPreview(urlFoto);

        botaoSalvar.value = 'Salvar alterações';
        botaoCancelarEdicao.hidden = false;
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function cancelarEdicao() {
        produtoEmEdicaoId = null;
        form.reset();
        limparFoto();
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
                        if (fotoNova) produto.IMAGEM_URL = fotoNova;
                        else if (removerFoto) delete produto.IMAGEM_URL;
                    }
                } else {
                    produtosLoja.unshift({
                        ID: proximoIdDemo++,
                        NOME: nome,
                        CATEGORIA: categoria,
                        PRECO: Number(preco),
                        DESCRICAO: descricao,
                        IMAGEM_URL: fotoNova || undefined
                    });
                }
                renderizarLista();
            } else if (estaEditando) {
                await apiPut(`/produtos/${produtoEmEdicaoId}`, {
                    id_loja: loja.id,
                    nome,
                    categoria,
                    descricao,
                    preco: Number(preco),
                    imagem: fotoNova || undefined,          // só vai se escolheu foto nova
                    remover_imagem: removerFoto || undefined // só vai se clicou em "Remover foto"
                });
                await carregarProdutos();
            } else {
                await apiPost('/produtos', {
                    id_loja: loja.id,
                    nome,
                    categoria,
                    descricao,
                    preco: Number(preco),
                    imagem: fotoNova || undefined
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
