// Perfil da loja: dados do cadastro, edição, números de venda e vendas recentes.
(function () {
    const U = PCForgeUtil;
    let sessao = U.lerSessao('loja');

    if (!sessao) {
        U.exigirLogin('loja', 'Entre na sua loja pra ver o perfil.');
        return;
    }

    const base = `/perfil/loja/${sessao.id}`;
    const $ = (id) => document.getElementById(id);

    function pintarCabecalho(nome, desde) {
        $('perfil-avatar').textContent = U.primeiroNome(nome).charAt(0) || '?';
        $('perfil-nome').textContent = nome;
        $('perfil-desde').textContent = desde || '';
    }

    pintarCabecalho(sessao.nome, sessao.email);

    if (estaEmModoDemo()) {
        $('link-pagina-publica').hidden = true;
        $('perfil-demo').hidden = false;
        return;
    }
    $('link-pagina-publica').href = `loja.html?id=${encodeURIComponent(sessao.id)}`;
    $('perfil-conteudo').hidden = false;

    function mostrarErro(mensagem) {
        const el = $('mensagem-erro');
        el.textContent = mensagem;
        el.style.display = 'block';
    }

    const campoDescricao = $('perfil-campo-descricao');
    function atualizarContador() { $('contador-descricao').textContent = campoDescricao.value.length; }
    campoDescricao.addEventListener('input', atualizarContador);

    // ------------------------------------------------------------
    // Logo da loja: escolha/preview/remoção, enviada no mesmo PUT
    // dos outros dados (campo "logo" em base64, ou "remover_logo").
    // ------------------------------------------------------------
    let logoNova = null;       // base64 do arquivo escolhido
    let removerLogo = false;   // clicou em "Remover logo" (e a loja tinha)
    let logoTinhaAntes = false;

    const campoLogo = $('perfil-campo-logo');
    const imgLogo = $('logo-preview');
    const fallbackLogo = $('logo-fallback');

    function mostrarLogo(urlOuDataUrl) {
        if (urlOuDataUrl) {
            imgLogo.src = urlOuDataUrl;
            imgLogo.hidden = false;
            fallbackLogo.hidden = true;
        } else {
            imgLogo.removeAttribute('src');
            imgLogo.hidden = true;
            fallbackLogo.hidden = false;
        }
    }

    function limparEscolhaLogo() {
        logoNova = null;
        campoLogo.value = '';
    }

    campoLogo.addEventListener('change', async function () {
        const arquivo = campoLogo.files[0];
        if (!arquivo) return;
        try {
            logoNova = await prepararImagemParaUpload(arquivo);
            removerLogo = false;
            mostrarLogo(logoNova); // preview local, antes de salvar
        } catch (error) {
            limparEscolhaLogo();
            mostrarToast(error.message, 'erro');
        }
    });

    $('perfil-botao-remover-logo').addEventListener('click', function () {
        limparEscolhaLogo();
        mostrarLogo(null);
        // Só manda "remover" de verdade se a loja JÁ tinha logo salva;
        // remover uma logo que só existia no preview local não manda nada.
        removerLogo = logoTinhaAntes;
    });

    function renderPerfil(p) {
        pintarCabecalho(p.NOME, `Loja desde ${U.mesAno(p.CRIADO_EM)}`);

        $('dados-cadastro').innerHTML = `
            <div class="largo"><dt>Nome da loja</dt><dd>${U.escapeHtml(p.NOME)}</dd></div>
            <div><dt>CNPJ</dt><dd>${U.escapeHtml(p.CNPJ)}</dd></div>
            <div><dt>Celular</dt><dd>${U.escapeHtml(p.CELULAR)}</dd></div>
            <div class="largo"><dt>E-mail</dt><dd>${U.escapeHtml(p.EMAIL)}</dd></div>
            <div class="largo"><dt>Endereço</dt><dd>${U.escapeHtml(p.ENDERECO)}</dd></div>
        `;

        const r = p.RESUMO;
        $('stats').innerHTML = `
            <div class="stat-card"><span>Produtos à venda</span><strong>${r.PRODUTOS_ATIVOS}</strong></div>
            <div class="stat-card"><span>Pedidos recebidos</span><strong>${r.PEDIDOS}</strong></div>
            <div class="stat-card"><span>Itens vendidos</span><strong>${r.ITENS_VENDIDOS}</strong></div>
            <div class="stat-card"><span>Faturamento</span><strong>${U.formatarPreco(r.FATURAMENTO)}</strong></div>
        `;

        $('perfil-campo-nome').value = p.NOME;
        $('perfil-campo-endereco').value = p.ENDERECO;
        $('perfil-campo-celular').value = p.CELULAR;
        $('perfil-campo-email').value = p.EMAIL;
        campoDescricao.value = p.DESCRICAO || '';
        atualizarContador();

        // Logo atual (ou fallback) — e anota se já tinha pra lógica de remover
        logoTinhaAntes = Boolean(p.TEM_LOGO);
        limparEscolhaLogo();
        removerLogo = false;
        mostrarLogo(urlImagemLoja(p));
    }

    $('form-dados').addEventListener('submit', async function (evento) {
        evento.preventDefault();
        $('mensagem-erro').style.display = 'none';
        // Estado de envio no botão de salvar (evita duplo clique / sem feedback).
        const botaoSalvar = this.querySelector('button[type="submit"], input[type="submit"], button');
        try {
            const r = await U.comEstadoEnviando(botaoSalvar, () => apiPut(base, {
                nome: $('perfil-campo-nome').value,
                endereco: $('perfil-campo-endereco').value,
                celular: $('perfil-campo-celular').value,
                email: $('perfil-campo-email').value,
                descricao: campoDescricao.value,
                nova_senha: $('perfil-nova-senha').value,
                senha_atual: $('perfil-senha-atual').value,
                logo: logoNova || undefined,          // só vai se escolheu logo nova
                remover_logo: removerLogo || undefined // só vai se clicou em "Remover logo"
            }));
            sessao = { ...sessao, nome: r.loja.nome, email: r.loja.email };
            U.salvarSessao('loja', sessao);
            if (typeof window.atualizarNavbar === 'function') window.atualizarNavbar();
            $('perfil-nova-senha').value = '';
            $('perfil-senha-atual').value = '';
            mostrarToast(r.resposta, 'sucesso');
            renderPerfil(await apiGet(base));
        } catch (error) {
            if (!error.sessaoExpirada) mostrarErro(error.message);
        }
    });

    function renderVendas(vendas) {
        const el = $('lista-vendas');
        if (vendas.length === 0) {
            el.innerHTML = '<p class="estado-vazio">Nenhuma venda ainda. Quando um cliente comprar seus produtos, elas aparecem aqui.</p>';
            return;
        }
        el.innerHTML = vendas.map((v) => `
            <div class="venda-linha">
                <div>
                    <span class="venda-nome">${v.QUANTIDADE}× ${U.escapeHtml(v.NOME)}</span>
                    <small>Pedido #${v.ID_COMPRA} · ${U.escapeHtml(U.formatarData(v.DATA, true))} · ${U.escapeHtml(v.COMPRADOR)} (${U.escapeHtml(v.CIDADE)}/${U.escapeHtml(v.ESTADO)})</small>
                </div>
                <span class="venda-total">${U.formatarPreco(v.TOTAL)}</span>
            </div>`).join('');
    }

    (async function iniciar() {
        try {
            const [perfil, vendas] = await Promise.all([apiGet(base), apiGet(`${base}/vendas`)]);
            renderPerfil(perfil);
            renderVendas(vendas);
        } catch (error) {
            if (!error.sessaoExpirada) {
                $('perfil-conteudo').hidden = true;
                $('perfil-demo').hidden = false;
                $('perfil-demo').innerHTML = `<h2>Não foi possível carregar o perfil</h2><p class="subtitulo" style="text-align:left">${U.escapeHtml(error.message)}</p>`;
            }
        }
    })();
})();
