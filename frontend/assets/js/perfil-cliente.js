// Perfil do cliente: dados do cadastro, edição, endereços e pedidos.
(function () {
    const U = PCForgeUtil;
    let sessao = U.lerSessao('cliente');

    if (!sessao) {
        U.exigirLogin('cliente', 'Entre na sua conta pra ver seu perfil.');
        return;
    }

    const base = `/perfil/cliente/${sessao.id}`;
    const $ = (id) => document.getElementById(id);
    let enderecoEmEdicaoId = null; // null = o formulário está criando um endereço novo

    function pintarCabecalho(nome, desde) {
        $('perfil-avatar').textContent = U.primeiroNome(nome).charAt(0) || '?';
        $('perfil-nome').textContent = nome;
        $('perfil-desde').textContent = desde || '';
    }

    pintarCabecalho(sessao.nome, sessao.email);

    if (estaEmModoDemo()) {
        $('perfil-demo').hidden = false;
        return;
    }
    $('perfil-conteudo').hidden = false;

    function mostrarErro(idElemento, mensagem) {
        const el = $(idElemento);
        el.textContent = mensagem;
        el.style.display = 'block';
    }
    const esconderErro = (idElemento) => { $(idElemento).style.display = 'none'; };

    // ---------- dados do cadastro ----------
    function renderDados(p) {
        pintarCabecalho(p.NOME, `Cliente desde ${U.mesAno(p.CRIADO_EM)}`);
        $('dados-cadastro').innerHTML = `
            <div class="largo"><dt>Nome</dt><dd>${U.escapeHtml(p.NOME)}</dd></div>
            <div><dt>CPF</dt><dd>${U.escapeHtml(p.CPF)}</dd></div>
            <div><dt>Nascimento</dt><dd>${U.escapeHtml(U.dataIsoParaBr(p.NASCIMENTO))}</dd></div>
            <div><dt>E-mail</dt><dd>${U.escapeHtml(p.EMAIL)}</dd></div>
            <div><dt>Celular</dt><dd>${U.escapeHtml(p.CELULAR)}</dd></div>
        `;
        $('perfil-campo-nome').value = p.NOME;
        $('perfil-campo-email').value = p.EMAIL;
        $('perfil-campo-celular').value = p.CELULAR;
    }

    $('form-dados').addEventListener('submit', async function (evento) {
        evento.preventDefault();
        esconderErro('mensagem-erro');
        // Estado de envio no botão de salvar (evita duplo clique / sem feedback).
        const botaoSalvar = this.querySelector('button[type="submit"], input[type="submit"], button');
        try {
            const r = await U.comEstadoEnviando(botaoSalvar, () => apiPut(base, {
                nome: $('perfil-campo-nome').value,
                email: $('perfil-campo-email').value,
                celular: $('perfil-campo-celular').value,
                nova_senha: $('perfil-nova-senha').value,
                senha_atual: $('perfil-senha-atual').value
            }));
            // Mantém o token e atualiza o nome/e-mail da sessão (a barra do topo usa isso).
            sessao = { ...sessao, nome: r.cliente.nome, email: r.cliente.email };
            U.salvarSessao('cliente', sessao);
            if (typeof window.atualizarNavbar === 'function') window.atualizarNavbar();
            $('perfil-nova-senha').value = '';
            $('perfil-senha-atual').value = '';
            mostrarToast(r.resposta, 'sucesso');
            renderDados(await apiGet(base));
        } catch (error) {
            if (!error.sessaoExpirada) mostrarErro('mensagem-erro', error.message);
        }
    });

    // ---------- endereços ----------
    let enderecos = [];

    function renderEnderecos() {
        const el = $('lista-enderecos');
        if (enderecos.length === 0) {
            el.innerHTML = '<p class="estado-vazio" style="padding:10px 0">Você ainda não tem endereço cadastrado.</p>';
            return;
        }
        el.innerHTML = enderecos.map((e) => `
            <div class="endereco-card">
                <div>
                    ${U.escapeHtml(e.RUA)}, ${U.escapeHtml(e.NUMERO)}
                    <small>${U.escapeHtml(e.BAIRRO)} — ${U.escapeHtml(e.CIDADE)}/${U.escapeHtml(e.ESTADO)} · CEP ${U.escapeHtml(e.CEP)}</small>
                </div>
                <div class="item-acoes">
                    <button type="button" class="item-editar" data-id="${e.ID}">Editar</button>
                    <button type="button" class="item-excluir" data-id="${e.ID}">Excluir</button>
                </div>
            </div>`).join('');
        el.querySelectorAll('.item-editar').forEach((b) => b.addEventListener('click', () => abrirFormEndereco(Number(b.dataset.id))));
        el.querySelectorAll('.item-excluir').forEach((b) => b.addEventListener('click', () => excluirEndereco(Number(b.dataset.id))));
    }

    async function carregarEnderecos() {
        enderecos = await apiGet(`${base}/enderecos`);
        renderEnderecos();
    }

    function abrirFormEndereco(id) {
        const e = id ? enderecos.find((x) => x.ID === id) : null;
        enderecoEmEdicaoId = e ? e.ID : null;
        esconderErro('mensagem-erro-endereco');
        $('titulo-form-endereco').textContent = e ? 'Editar endereço' : 'Novo endereço';
        ['cep', 'numero', 'rua', 'bairro', 'cidade'].forEach((campo) => { $(campo).value = e ? e[campo.toUpperCase()] : ''; });
        $('uf').value = e ? e.ESTADO : '';
        $('form-endereco').hidden = false;
        $('botao-novo-endereco').hidden = true;
        $('cep').focus();
    }

    function fecharFormEndereco() {
        enderecoEmEdicaoId = null;
        $('form-endereco').hidden = true;
        $('botao-novo-endereco').hidden = false;
    }

    $('botao-novo-endereco').addEventListener('click', () => abrirFormEndereco(null));
    $('botao-cancelar-endereco').addEventListener('click', fecharFormEndereco);

    $('form-endereco').addEventListener('submit', async function (evento) {
        evento.preventDefault();
        esconderErro('mensagem-erro-endereco');
        const dados = {
            cep: $('cep').value, numero: $('numero').value, rua: $('rua').value,
            bairro: $('bairro').value, cidade: $('cidade').value, uf: $('uf').value
        };
        // Estado de envio no botão de salvar (evita duplo clique).
        const botaoSalvar = this.querySelector('button[type="submit"], input[type="submit"], button');
        try {
            await U.comEstadoEnviando(botaoSalvar, () =>
                enderecoEmEdicaoId
                    ? apiPut(`${base}/enderecos/${enderecoEmEdicaoId}`, dados)
                    : apiPost(`${base}/enderecos`, dados)
            );
            mostrarToast(enderecoEmEdicaoId ? 'Endereço atualizado!' : 'Endereço adicionado!', 'sucesso');
            fecharFormEndereco();
            await carregarEnderecos();
        } catch (error) {
            if (!error.sessaoExpirada) mostrarErro('mensagem-erro-endereco', error.message);
        }
    });

    async function excluirEndereco(id) {
        if (!(await U.confirmar('Excluir este endereço?', { titulo: 'Excluir endereço', confirmar: 'Excluir' }))) return;
        try {
            await apiDelete(`${base}/enderecos/${id}`);
            mostrarToast('Endereço removido.', 'sucesso');
            if (enderecoEmEdicaoId === id) fecharFormEndereco();
            await carregarEnderecos();
        } catch (error) {
            if (!error.sessaoExpirada) mostrarToast(error.message, 'erro');
        }
    }

    // ---------- pedidos ----------
    const ROTULO_STATUS = {
        PENDENTE: 'Pendente', PAGO: 'Pago', ENVIADO: 'Enviado',
        ENTREGUE: 'Entregue', CANCELADO: 'Cancelado'
    };
    function chipStatus(status) {
        const s = (status || 'PENDENTE').toUpperCase();
        return `<span class="chip-status ${s.toLowerCase()}">${ROTULO_STATUS[s] || s}</span>`;
    }

    function renderPedidos(pedidos) {
        const el = $('lista-pedidos');
        if (pedidos.length === 0) {
            el.innerHTML = '<p class="estado-vazio">Você ainda não fez nenhum pedido. <a href="produtos.html" style="color: var(--accent); font-weight: 700;">Ir às compras</a></p>';
            return;
        }
        el.innerHTML = pedidos.map((p) => `
            <details class="pedido">
                <summary>
                    <span><span class="pedido-id">Pedido #${p.ID}</span> <span class="pedido-meta">· ${U.escapeHtml(U.formatarData(p.DATA, true))} · ${U.escapeHtml(p.FORMA_PAGAMENTO)}</span></span>
                    <span class="pedido-direita">${chipStatus(p.STATUS)} <span class="pedido-total">${U.formatarPreco(p.VALOR_INICIAL)}</span></span>
                </summary>
                <div class="pedido-corpo">
                    ${p.ITENS.map((i) => `
                        <div class="pedido-item">
                            <span>${i.QUANTIDADE}× ${U.escapeHtml(i.NOME)} <small>— ${U.escapeHtml(i.LOJA_NOME)}</small></span>
                            <span>${U.formatarPreco(Math.round(i.VALOR_UNITARIO * 100) * i.QUANTIDADE / 100)}</span>
                        </div>`).join('')}
                    <p class="pedido-entrega">Entrega: ${U.escapeHtml(p.ENDERECO)}</p>
                </div>
            </details>`).join('');
    }

    // ---------- favoritos (lista de desejos) ----------
    async function renderFavoritos() {
        const el = $('lista-favoritos');
        try {
            const favoritos = await PCForgeFavoritos.listar();
            if (favoritos.length === 0) {
                el.innerHTML = '<p class="estado-vazio">Nenhum favorito ainda. Toque no coração ♡ dos produtos pra guardar aqui.</p>';
                return;
            }
            // cards iguais aos da vitrine (catalog.css); clicar no coração tira da lista
            el.innerHTML = favoritos.map((produto) => {
                const urlFoto = urlImagemProduto(produto);
                return `
                <div class="cartao-produto">
                    <a class="cartao-thumb-link" href="produto.html?id=${encodeURIComponent(produto.ID)}" title="Ver detalhes de ${U.escapeHtml(produto.NOME)}">
                        <div class="cartao-thumb${urlFoto ? ' com-foto' : ''}">
                            ${urlFoto ? `<img src="${U.escapeHtml(urlFoto)}" alt="${U.escapeHtml(produto.NOME)}" loading="lazy">` : ''}
                            <span class="cartao-categoria">${U.escapeHtml(produto.CATEGORIA)}</span>
                        </div>
                    </a>
                    <div class="cartao-corpo">
                        ${produto.ID_LOJA
                            ? `<a class="cartao-loja cartao-loja-link" href="loja.html?id=${encodeURIComponent(produto.ID_LOJA)}">${U.escapeHtml(produto.LOJA_NOME)}</a>`
                            : `<span class="cartao-loja">${U.escapeHtml(produto.LOJA_NOME)}</span>`}
                        <h3 class="cartao-nome"><a class="cartao-nome-link" href="produto.html?id=${encodeURIComponent(produto.ID)}">${U.escapeHtml(produto.NOME)}</a></h3>
                        <span class="cartao-preco">${U.formatarPreco(produto.PRECO)}</span>
                        <button class="cartao-comprar" type="button" data-id="${produto.ID}">Adicionar ao carrinho</button>
                    </div>
                </div>`;
            }).join('');

            // coração já nasce preenchido; clicar remove da lista
            el.querySelectorAll('[data-favoritar]').forEach((botao) => {
                const id = botao.dataset.favoritar;
                PCForgeFavoritos.tem(id); // estado no cache
                botao.classList.add('favoritado');
                botao.textContent = '♥';
                botao.addEventListener('click', async () => {
                    botao.disabled = true;
                    try {
                        const r = await PCForgeFavoritos.alternar(id);
                        if (r && !r.favorito) {
                            mostrarToast('Removido dos favoritos.', 'sucesso');
                            await renderFavoritos();
                        }
                    } catch (e) {
                        mostrarToast(e.message, 'erro');
                    } finally {
                        botao.disabled = false;
                    }
                });
            });

            // "Adicionar ao carrinho" dos favoritos: reusa a máquina do carrinho
            el.querySelectorAll('.cartao-comprar').forEach((botao) => {
                botao.addEventListener('click', async () => {
                    const produto = favoritos.find((p) => String(p.ID) === botao.dataset.id);
                    try {
                        await Carrinho.adicionar(produto);
                        mostrarToast(`${produto.NOME} foi pro carrinho!`, 'sucesso');
                    } catch (e) {
                        mostrarToast(e.message, 'erro');
                    }
                });
            });
        } catch (error) {
            el.innerHTML = `<p class="estado-vazio">Não foi possível carregar os favoritos. (${U.escapeHtml(error.message)})</p>`;
        }
    }

    (async function iniciar() {
        try {
            const [perfil, , pedidos] = await Promise.all([
                apiGet(base),
                carregarEnderecos(),
                apiGet(`${base}/pedidos`)
            ]);
            renderDados(perfil);
            renderPedidos(pedidos);
            renderFavoritos();
            if (window.location.hash) {
                const alvo = document.querySelector(window.location.hash);
                if (alvo) alvo.scrollIntoView();
            }
        } catch (error) {
            if (!error.sessaoExpirada) {
                $('perfil-conteudo').hidden = true;
                $('perfil-demo').hidden = false;
                $('perfil-demo').innerHTML = `<h2>Não foi possível carregar o perfil</h2><p class="subtitulo" style="text-align:left">${U.escapeHtml(error.message)}</p>`;
            }
        }
    })();
})();
