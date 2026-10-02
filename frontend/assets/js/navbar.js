(function () {
    const DESTINOS = {
        cliente: { cadastro: 'cliente-cadastro.html', login: 'login.html' },
        loja: { cadastro: 'loja-cadastro.html', login: 'loja-login.html' }
    };

    // Pra onde manda a pessoa quando ela clica em "Sair" na navbar.
    const DESTINO_SAIR = {
        cliente: 'produtos.html',
        loja: 'loja-login.html'
    };

    function escapeHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto ?? '';
        return div.innerHTML;
    }

    function primeiroNome(nomeCompleto) {
        return (nomeCompleto || '').trim().split(/\s+/)[0] || '';
    }

    // Lê sessionStorage.cliente ou sessionStorage.loja — é ali que
    // login.js / loja-login.js guardam quem está logado nessa aba.
    function pegarSessaoLogada(tipo) {
        const bruto = sessionStorage.getItem(tipo);
        if (!bruto) return null;
        try {
            const sessao = JSON.parse(bruto);
            return sessao && sessao.nome ? sessao : null;
        } catch {
            return null;
        }
    }

    function montarBlocoAcessos(tipo, sessao) {
        if (!sessao) {
            return `
                <a href="${DESTINOS[tipo].login}" class="botao-topo botao-fantasma">Entrar</a>
                <a href="${DESTINOS[tipo].cadastro}" class="botao-topo botao-solido">Criar conta</a>
            `;
        }

        const nome = primeiroNome(sessao.nome);
        return `
            <span class="usuario-logado" title="${escapeHtml(sessao.nome)}">
                <span class="usuario-logado-avatar">${escapeHtml(nome.charAt(0) || '?')}</span>
                <span class="usuario-logado-nome"><span class="usuario-saudacao">Olá,</span>${escapeHtml(nome)}</span>
            </span>
            <button type="button" class="botao-topo botao-fantasma" id="botao-navbar-sair">Sair</button>
        `;
    }

    function montarNavbar() {
        const montagem = document.getElementById('topo-montagem');
        if (!montagem) return;

        const tipo = montagem.dataset.tipo === 'loja' ? 'loja' : 'cliente';
        const modo = montagem.dataset.modo === 'login' ? 'login' : 'cadastro';
        const sessao = pegarSessaoLogada(tipo);

        montagem.innerHTML = `
            <header class="topo">
                <div class="topo-conteudo">
                    <button type="button" class="marca-topo" id="botao-logo" title="PC Forge">
                        <span class="marca-emblema">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 18h16v2H4v-2z" fill="#fff"/>
                                <path d="M6 16l2-8h8l2 8H6z" stroke="#fff" stroke-width="1.5" fill="none"/>
                                <path d="M10 8V5h4v3" stroke="#fff" stroke-width="1.5"/>
                                <circle cx="12" cy="12" r="1.5" fill="#fff"/>
                            </svg>
                        </span>
                        <span class="marca-texto">PC <span>FORGE</span></span>
                    </button>

                    <div class="topo-acessos">
                        <div class="alternador" data-ativo="${tipo}">
                            <button type="button" class="alternador-opcao" data-tipo="cliente" aria-selected="${tipo === 'cliente'}">Cliente</button>
                            <button type="button" class="alternador-opcao" data-tipo="loja" aria-selected="${tipo === 'loja'}">Loja</button>
                            <span class="alternador-indicador"></span>
                        </div>
                        ${tipo === 'loja' ? '<a href="painel-loja.html" class="link-inicio">Meus produtos</a>' : ''}
                        ${montarBlocoAcessos(tipo, sessao)}
                    </div>
                </div>
            </header>
        `;

        montagem.querySelectorAll('.alternador-opcao').forEach(function (botao) {
            botao.addEventListener('click', function () {
                const tipoClicado = botao.dataset.tipo;
                if (tipoClicado === tipo) return;
                window.location.href = DESTINOS[tipoClicado][modo];
            });
        });

        const botaoLogo = document.getElementById('botao-logo');
        if (botaoLogo) {
            botaoLogo.addEventListener('click', function () {
                if (typeof window.abrirModalAdmin === 'function') {
                    window.abrirModalAdmin();
                }
            });
        }

        const botaoSair = document.getElementById('botao-navbar-sair');
        if (botaoSair) {
            botaoSair.addEventListener('click', function () {
                sessionStorage.removeItem(tipo);
                if (typeof window.mostrarToast === 'function') {
                    window.mostrarToast('Você saiu da sua conta.', 'info');
                }
                setTimeout(() => { window.location.href = DESTINO_SAIR[tipo]; }, 500);
            });
        }

        if (typeof estaEmModoDemo === 'function' && estaEmModoDemo()) {
            const aviso = document.createElement('button');
            aviso.type = 'button';
            aviso.className = 'aviso-demo';
            aviso.textContent = 'Modo visualização — sair';
            aviso.addEventListener('click', function () {
                sairDoModoDemo();
                window.location.href = 'produtos.html';
            });
            document.body.appendChild(aviso);
        }
    }

    // Além de montar no carregamento da página, remonta a navbar se outra
    // aba/página mexer no login (ex: fez logout em outra aba) — assim o
    // nome exibido nunca fica "preso" desatualizado.
    window.addEventListener('storage', function (evento) {
        if (evento.key === 'cliente' || evento.key === 'loja') {
            montarNavbar();
        }
    });

    document.addEventListener('DOMContentLoaded', montarNavbar);

    // Outras páginas (ex: painel-loja.js) podem chamar isso depois de logar
    // ou deslogar programaticamente, sem precisar recarregar a página.
    window.atualizarNavbar = montarNavbar;
})();
